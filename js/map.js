var matchedData;
var rankingData;
var mapData;
var popularityData;

files = Promise.all([
    d3.json('../data/matched.json'),
    d3.json('../data/ranking.json'),
    d3.json('../data/europe.json'),
    d3.csv('../data/language.csv')
])
    .then(function (threeFiles) {

        matchedData = threeFiles[0];
        rankingData = threeFiles[1];
        mapData = threeFiles[2];
        languageData = threeFiles[3];

        popularData = {};
        rankingData.forEach(function(el1){
            el1['rankings'].forEach(function(el2){
                let title = el2['title'];
                let artist = el2['artist'];

                if (!(popularData[artist])){
                    popularData[artist] = {}
                    popularData[artist][title] = 1
                } 
                else {
                    if ((title in popularData[artist])){
                        popularData[artist][title] += 1
                    } else {
                        popularData[artist][title] = 1
                    }
                }
            })
        })
        console.log(popularData)

        var sortable = [];
        for (let artist in popularData) {
            sortable.push([artist, popularData[artist]]);
        }

        // number of unique songs
        var number_of_songs = _.sum(
            sortable.map(function(d){
                return Object.keys(d[1]).length;
            })
        )

        var sorted = sortable.sort(function(a, b) {
            return _.sum(Object.values(a[1])) - _.sum(Object.values(b[1]));
        }).reverse();

        // get top 5;
        var top5 = sorted.slice(0,5);

        // sum
        // top5.forEach(function(d){
        //     console.log(d[0]);
        //     console.log(
        //         _.sum(Object.values(d[1]))
        //     )  
        // })

        // total number of unique songs
        draw();
    })

function draw() {

    var height = 680;

    var width = 700;

    var margin = {
        top: 30,
        right: 0,
        bottom: 30,
        left: 0
    },
        container_width = width,
        container_height = height,
        width = container_width - margin.left - margin.right,
        height = container_height - margin.top - margin.bottom;

    var svg = d3
        .select("#chart")
        .append("svg")
        .attr("id", "svg_container")
        .attr("viewBox", `0 0 ${container_width} ${container_height}`)
        .attr("preserveAspectRatio", "xMidYMid");

    var container1 = svg.append('g')
        .attr('id', 'map')
    // .attr('transform', 'translate(0,0)');

    projection = d3.geoMercator()
        // If center is specified, sets the projection’s center to the specified center, a two-element array of longitude and latitude in degrees and returns the projection. If center is not specified, returns the current center, which defaults to ⟨0°,0°⟩.
        .center([13, 52])
        .translate([width / 2, height / 1.55])
        .scale(530);

    var path = d3
        .geoPath(projection);

    var totalCountries = rankingData.map(function(d){
        return d.country;
    })

    var colorScale = d3.scaleQuantize()
            .domain([0, 50])
            .range([
                '#08519c',
                '#6baed6',
                '#fb6a4a',
                '#de2d26',
                '#a50f15'
            ]);

    container1
        .selectAll('woj')
        .data(mapData.features)
        .enter()
        .append('path')
        .attr('class', 'state')
        .attr('d', path)
        .attr('fill', "#A8ABB0")
        .attr('stroke', 'black')
        .attr('stroke-width', 0.6)
        .attr('opacity', 1)
        .on('click', function (d) {

            let focusCountry = d['properties']['NAME'];

            let rankingFilter = rankingData.filter(function(el){
                return _.includes(el.country, focusCountry)
            })

            let appendObject = d3.select('#top100');

            d3.selectAll('.song').remove();

            d3.select('#country-chart')
                .style('opacity','1')
                .text('Top 100: ' + focusCountry );
            d3.select('#top100').style('opacity','1');

            rankingFilter[0]['rankings'].forEach(function(el){
                // console.log(el);
                let trObject = appendObject.append('tr').attr('class','song');
                trObject.append('td').text(el['rank'])
                trObject.append('td').text(el['title'])
                trObject.append('td').text(el['artist'])
            })

            let filtered = matchedData.filter(function (el) {
                return _.includes(el.countries, focusCountry)
            })


            filtered.forEach(function (el1) {
                d3.selectAll('path').each(function (el2) {
                    if (_.includes(el1.countries, el2['properties']['NAME'])) {

                        let similarity = el1['overlaps'].length;

                        if (similarity > 0){
                            d3.select(this)
                                .attr('fill', colorScale(similarity));
                        }
                    }
                })
            })

            if (_.includes(totalCountries, d['properties']['NAME'])) {
                d3.select(this).attr('fill','#4D2A4F')
            } else {
                d3.select(this).attr('fill','#A8ABB0')
            }

        })
        .on('mouseover', function (d) {

            div.transition()		
            .duration(200)		
            .style("opacity", .9);		
            
            div.html(`${d['properties']['NAME']}`)
            .style('color','black')	
            .style("left", (d3.event.pageX) + "px")		
            .style("top", (d3.event.pageY - 28) + "px");	

            // console.log(d3.event.pageX, d3.event.x, d3.mouse(this)[0] )

            // let [x, y] = d3.mouse(this);
            // d3.event.x, d3.event.y
        })
        .on('mouseout', function (d) {
            div
                .transition()
                .duration(500)
                .style('opacity', 0);
        });

// Define the div for the tooltip
var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);
}