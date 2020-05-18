var canvasMain = document.getElementById('canvasMain');

canvasMain.width = window.innerWidth;
canvasMain.height = window.innerHeight;

var mouseX = null;
var mouseY = null;

canvasMain.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

var fpsCounter = document.getElementById('fps');

var ctxMain = canvasMain.getContext('2d');

const boidSystem = new BoidSystem(canvasMain, 100, 20, 30, 2, 3.5, 0.2, 'black');
boidSystem.create();


function animate() {
    // for performance analysis
    const t0 = performance.now();

    requestAnimationFrame(animate);

    ctxMain.clearRect(0, 0, canvasMain.width, canvasMain.height);    

    boidSystem.update(ctxMain);
    // boidSystem2.render(ctxMain);


    const t1 = performance.now();
    const fps = 1/(t1-t0)*1000;
    var fpsContent = fps;
    if (fps > 120) {
        fpsContent = `120+`
    }
    fpsCounter.innerHTML = ` fps: ${fpsContent}`;

}

animate();