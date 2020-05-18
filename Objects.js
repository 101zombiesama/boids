function drawTriangle(ctx, boid, color) {
    const h = boid.radialBound;
    const angle = Math.PI/12;
    // get vector position A
    const ca = boid.forward.normalize().scale(boid.radialBound);
    const ac = ca.scale(-1);

    const a = ca.add(boid.location);
    const rac = ac.getRight();
    const lac = ac.getLeft();
    const cb = rac.normalize().scale(h*Math.tan(angle));
    const cd = lac.normalize().scale(h*Math.tan(angle));
    const ad = ac.add(cd);
    const ab = ac.add(cb);
    const b = ab.add(a);
    const d = ad.add(a);

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(d.x, d.y);
    ctx.lineTo(a.x, a.y);
    ctx.strokeStyle = color;
    ctx.stroke()
    ctx.strokeStyle = 'black';
}

function drawBounds(ctx, boid) {
    ctx.beginPath();
    ctx.arc(boid.location.x, boid.location.y, boid.radialBound, 0, 2*Math.PI);
    ctx.fillStyle = 'rgb(0, 0, 0, 0.25)';
    ctx.fill();
}

function drawForward(ctx, boid) {
    // showing forward vector
    ctx.beginPath();
    ctx.moveTo(boid.location.x, boid.location.y);
    ctx.lineTo(boid.forward.x*20 + boid.location.x, boid.forward.y*20 + boid.location.y);
    ctx.stroke();
}

class Boid extends Object{
    constructor(location, mass, initialVelocity, maxSpeed, maxAccelerationMag, collidable, radialBound, color) {
        super(location, mass, initialVelocity, maxSpeed, maxAccelerationMag, collidable, radialBound);
        this.color = color;
    }

    align(boids, steerAccMag) {
        // steers this boid to align with other boids
        var totalVel = new Vec2(0, 0);
        for (let boid of boids) {
            totalVel = totalVel.add(boid.velocity);
        }
        const avgVel = totalVel.div(boids.length);
        const steer = avgVel.sub(this.velocity);
        const steerDir = steer.normalize();
        // accelerate towrds the steerDir
        this.acceleration = this.acceleration.add(steerDir.scale(steerAccMag));
    }

    cohesion(boids, steerAccMag) {
        // steers this boid towards average location of local boids
        var totalLoc = new Vec2(0, 0);
        for (let boid of boids) {
            totalLoc = totalLoc.add(boid.location);
        }
        const avgLoc = totalLoc.div(boids.length);
        const steer = avgLoc.sub(this.location);
        const steerDir = steer.normalize();
        // accelerate towrds the steerDir
        this.acceleration = this.acceleration.add(steerDir.scale(steerAccMag));
    }

    separate(boids, separationMultiplier) {
        // steers this boid away from local boids inversly proportional to the dist to avoid crowding
        const c1 = new Point(this.location.x, this.location.y);
        var total = new Vec2(0, 0);
        for (let boid of boids) {
            const c2 = new Point(boid.location.x, boid.location.y);
            const dist = c1.distanceTo(c2);
            const scaledVec = this.location.sub(boid.location).div((dist)**2);
            total = total.add(scaledVec);
        }
        const steer = total.div(boids.length);
        const steerDir = steer.normalize();
        this.acceleration = this.acceleration.add(steer).scale(separationMultiplier);
        // this.acceleration = this.acceleration.add(steerDir.scale(separationMultiplier));
    }

    render(ctx) {
        drawTriangle(ctx, this, this.color);
        // drawBounds(ctx, this);
    }
}

class BoidSystem {
    constructor(canvas, num_boids, boidRadius, localRadius, initialSpeed, maxSpeed, maxAccelerationMag, color) {
        this.canvas = canvas;
        this.num_boids = num_boids;
        this.boidRadius = boidRadius;
        this.localRadius = localRadius;
        this.initialSpeed = initialSpeed;
        this.maxSpeed = maxSpeed;
        this.maxAccelerationMag = maxAccelerationMag;
        this.color = color;
        this.boids = [];
        this.rays = [];
    }

    create() {
        const boids = []
        
        for (let i=0; i<this.num_boids; i++) {
            const rand_location = new Vec2(_.random(0, this.canvas.width), _.random(0, this.canvas.height));
            const rand_initVel = new Vec2(_.random(-this.initialSpeed, this.initialSpeed, true), _.random(-this.initialSpeed, this.initialSpeed, true));
            const boid = new Boid(rand_location, 1, rand_initVel, this.maxSpeed, this.maxAccelerationMag, true, this.boidRadius, this.color);

            boids.push(boid);
        }
        this.boids = boids;
    }

    update(ctx) {
        for(let [i, boid] of this.boids.entries()) {
            // seamless tiling of boids when they go offscreen
            if (boid.location.x > canvasMain.width) {
                boid.location.x = 0;
            }
            if (boid.location.y > canvasMain.height) {
                boid.location.y = 0
            }
            if (boid.location.x < 0) {
                boid.location.x = canvasMain.width;
            }
            if (boid.location.y < 0) {
                boid.location.y = canvasMain.height;
            }

            // get all the boids in local radius
            const c1 = new Point(boid.location.x, boid.location.y);
            const localBoids = [];
            for (let otherBoid of this.boids) {
                if (otherBoid != boid) {
                    const c2 = new Point(otherBoid.location.x, otherBoid.location.y);
                    const dist = c1.distanceTo(c2);
                    if (dist < this.localRadius) {
                        localBoids.push(otherBoid);
                    }
                }
            }

            // apply boids rules
            // boid.acceleration = boid.acceleration.scale(0);
            if (localBoids.length > 0) {
                 boid.align(localBoids, 0.05);
                 boid.cohesion(localBoids, 0.028);
                 boid.separate(localBoids, 1);
             }

            boid.update();
            boid.render(ctx);

            
        }
    }

}
