console.log('ml5 version:', ml5.version);
let detector;
let cam;
let canvas;
let ctx;
let COLOURS = [
    '#1f77b4',
    '#2ca02c',
    '#d62728',
    '#9467bd',
    '#8c564b',
    '#e377c2',
    '#7f7f7f',
    '#bcbd22',
    '#17becf',
    '#ff7f0e',
];

let detections = [];
let plot;
let history = [];

var paint_count = 0;
var start_time = 0.0;
var ready = true;

function preload() {
    console.log('loading model...');
    detector = ml5.objectDetector('cocossd');
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    plot.setPos(0, windowHeight * 0.5);
    plot.setOuterDim(windowWidth, windowHeight * 0.5);
}

function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    cam = createCapture(VIDEO);
    cam.hide();
    plot = new GPlot(this);
    plot.setPos(0, windowHeight * 0.5);
    plot.setOuterDim(windowWidth, windowHeight * 0.5);
    plot.getXAxis().setAxisLabelText("Time");
    plot.getYAxis().setAxisLabelText("# Objects detected");
    var d = new Date();
    start_time = d.getTime();
}

function draw() {
    background(255);
    let vh = windowHeight * 0.5;
    let vw = vh * cam.width / cam.height;
    let vy = 0;
    let vx = (windowWidth - vw) * 0.5;


    image(cam, vx, vy, vw, vh);

    let sx = vw / cam.width;
    let sy = vh / cam.height;

    for (i in detections) {
        var detection = detections[i];
        var colour = COLOURS[i % COLOURS.length];
        fill('white');
        strokeWeight(2);
        stroke('black');
        text(
            detection.label + ' (' + (detection.confidence * 100.).toFixed(1) + '%)',
            vx + detection.x * sx + 5,
            vy + detection.y * sy + 20,
        );
        noFill();
        strokeWeight(3);
        stroke(colour);
        rect(vx + detection.x * sx, vy + detection.y * sy, detection.width * sx, detection.height * sy);
    }

    const frame = cam.get(0, 0, cam.width, cam.height);
    if (ready && frame) {
        ready = false;
        detector.detect(frame, handle_detection);
    }

    update_plot(frame);

    plot.defaultDraw();

}

function update_plot() {
    if (history.length > 1) {
        plot.setPoints(history);
        plot.setXLim(history[0].x, history[history.length - 1].x);
    }
}

function handle_detection(error, results) {
    if (error) {
        console.log(error);
    }
    detections = results;
    let d = new Date();
    let t = d.getTime() - start_time;
    var point = new GPoint(t, results.length);
    history.push(point);
    if (history.length > 100) {
        history = history.slice(history.length - 100);
    }
    ready = true;
}