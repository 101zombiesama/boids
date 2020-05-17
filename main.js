var canvasMain = document.getElementById('canvasMain');

canvasMain.width = 600;
canvasMain.height = 600;

var ctxMain = canvasMain.getContext('2d');

const particles = [];

for(let i=0; i<5; i++) {
    const particle = new Particle(new Vec2(_.random(20, canvasMain.width, true), 0), 1, new Vec2(0, _.random(0.5, 2.0)), true, _.random(10, 50));
    particles.push(particle);
}

var mouseX = null;
var mouseY = null;

canvasMain.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
})

const mouseParticle = new Particle(new Vec2(300, 300), 1, new Vec2(0,0), true, 100);

var ray = new Ray(new Vec2(0, 300), new Vec2(1, 0));


function animate() {
    requestAnimationFrame(animate);

    ctxMain.clearRect(0, 0, canvasMain.width, canvasMain.height);    

    mouseParticle.location.x = mouseX;
    mouseParticle.location.y = mouseY;
    
    for (let p of particles) {
        if (p.location.y > canvasMain.height) p.location.y = 0;
        p.update();
        p.render(ctxMain);
    }

    mouseParticle.update();
    mouseParticle.render(ctxMain);

    ray.render(ctxMain);

    const intersections = ray.cast([...particles, mouseParticle]);

    for (let intersection of intersections) {
        ctxMain.beginPath();
        ctxMain.arc(intersection.point.x, intersection.point.y, 10, 0, 2*Math.PI);
        ctxMain.fill();
    }

}

animate()