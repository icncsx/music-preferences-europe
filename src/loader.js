var dots = d3.selectAll('.dot').nodes();
var header = d3.select('#chart');
header.style('opacity','0');

var tlLoader = new TimelineMax({
    onComplete: checkLoad
});

function animation(){
    tlLoader
    .staggerFromTo(dots, 1.5,
        { y: 0, autoAlpha: 0 },
        { y: 20, autoAlpha: 1, ease: Back.easeInOut },
        0.05
    )
    .fromTo(loader, 0.5,
        { autoAlpha: 1, scale: 1.3 },
        { autoAlpha: 0, scale: 1, ease: Power0.easeNone, delay: 0.5 },
    );

}

function checkLoad(){
    if (d3.select('#map').node()){
        // console.log('ready')
        loadContent();
    } else {
        // console.log('not ready')
        animation();
    }
}

animation();

function loadContent() {

    let tlLoaderOut = new TimelineLite({ onComplete: contentIn });
    tlLoaderOut
        // want two tweens to happen at the same time // add 0 absolute position
        .set(dots, { backgroundColor: "#2b4d66", autoAlpha: 0 })
        .to(loader, 0.5, {
            autoAlpha: 1,
            scale: 1.3,
            ease: Power0.easeNone,
            delay: 0
        })
        .staggerFromTo(dots, 0.3,
            { y: 0, autoAlpha: 0 },
            { y: 20, autoAlpha: 1, ease: Bounce.easeOut, delay: 0 },
            0.3
        )
        .to(loader, 0.3, {
            y: -150,
            autoAlpha: 0,
            ease: Back.easeIn,
            delay: 0.3
        })
}

function contentIn() {

    var tlLoaderIn = new TimelineMax({
    });

    tlLoaderIn
    .to(header.node(), 0.5,
        { autoAlpha: 1, ease: Power0.easeNone }
    );

}