class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(otherVector) {
        return new Vec2(this.x + otherVector.x, this.y + otherVector.y);
    }

    dot(otherVector) {
        return this.x*otherVector.x + this.y*otherVector.y;
    }

    sub(otherVector) {
        return new Vec2(this.x-otherVector.x, this.y-otherVector.y);
    }

    scale(scaler) {
        return new Vec2(this.x*scaler, this.y*scaler);
    }

    div(scaler) {
        return new Vec2(this.x/scaler, this.y/scaler);
    }

    getLeft() {
        // returns a left vector to this vector
        return new Vec2(-this.y, this.x);
    }

    getRight() {
        // returns right vector to this vector
        return this.getLeft().scale(-1);
    }

    projectOn(otherVector) {
        const v_scaler = (this.dot(otherVector))/((otherVector.getLength())**2);
        return (otherVector.normalize()).scale(v_scaler);
    }

    getLength() {
        const l = Math.sqrt(this.x**2 + this.y**2);
        return l;
    }

    normalize() {
        const l = this.getLength();
        return new Vec2(this.x/l, this.y/l);
    }

}

class Point extends Vec2 {
    constructor (x, y) {
        super(x, y);
    }

    distanceTo(otherPoint) {
        return Math.sqrt((otherPoint.x-this.x)**2 + (otherPoint.y-this.y)**2);
    }
}

class Object {
    constructor(location, mass, initialVelocity, maxSpeed, maxAccelerationMag, collidable, radialBound) {
        this.location = location;
        this.collidable = collidable;
        this.radialBound = radialBound;
        this.velocity = initialVelocity;
        this.maxSpeed = maxSpeed;
        this.acceleration = new Vec2(0, 0);
        this.maxAccelerationMag = maxAccelerationMag;
        this.mass = mass;
        this.forward = this.velocity.normalize();
        this.attachedRays = [];
    }

    update() {
        // update velocity according to the current acceleration
        this.velocity = this.velocity.add(this.acceleration);

        // limiting velocity according to speed
        if (this.velocity.getLength() > this.maxSpeed) {
            this.velocity = (this.velocity.normalize()).scale(this.maxSpeed);
        }

        // limit acceleration acording to maxAccelerationMag
        if (this.acceleration.getLength() > this.maxAccelerationMag) {
            this.acceleration = (this.acceleration.normalize()).scale(this.maxAccelerationMag);
        }

        // updating location according to the current velocity
        this.location = this.location.add(this.velocity);

        // update forward vector
        this.forward = this.velocity.normalize();

    }


}

class Wall {
    constructor(start, end, normalDir, aof) {
        this.start = start;
        this.end = end;
        this.normalDir = normalDir;
        this.aof = aof;
    }
}

class Ray {
    constructor(location, dir) {
        this.location = location;
        this.dir = dir;
        this.attchedTo = null;
    }

    cast(checklist) {
        const arr = []
        for (let obj of checklist) {
            // check only if the obj is in the direction of ray
            const vt = obj.location.sub(this.location).normalize();
            if (this.dir.dot(vt) > 0) {

                // first check if the ray intersects or not;
                const a = this.dir.y;
                const b = -this.dir.x;
                const c = this.dir.x*this.location.y - this.dir.y*this.location.x;
                // d is the perpendicular distance bewteen ray and the center of obj
                const d = Math.abs((a*obj.location.x + b*obj.location.y + c) / Math.sqrt(a**2 + b**2));

                if (d <= obj.radialBound) {
                    // calculate point of intersection
                    if (d === 0) {
                        const ac = obj.location.sub(this.location);
                        var ca = this.location.sub(obj.location);
                        ca = ca.normalize();
                        const cm = ca.scale(obj.radialBound);
                        const am = ac.add(cm);
                        const intersection = am.add(this.location);
                        arr.push({ obj: obj, point: intersection });
                    }
                    else {
                        const ac = obj.location.sub(this.location);
                        const ca = this.location.sub(obj.location);
                        // projecting ac on vector r (ray)
                        const ap = ac.projectOn(this.dir);
                        const p = ap.add(this.location);
                        const cp = p.sub(obj.location);

                        const alpha = Math.acos(d/ac.getLength());
                        const beta = Math.acos(d/obj.radialBound);
                        const theta = alpha - beta;
                        
                        // now rotate the vector ca by theta radian towards vector cp and normalize it and scale it by radialBound and get the poi.
                        // getting direction to rotate towards
                        
                        const t = ca.x*cp.y - ca.y*cp.x;
                        const cp_tick = new Vec2(-ca.y*t, ca.x*t);
                        var cp_dir = cp_tick.normalize();
                        cp_dir = cp_dir.scale(ca.getLength());
                        // new rotated vector is 
                        var z = (ca.scale(Math.cos(theta))).add(cp_dir.scale(Math.sin(theta)));
                        // console.log("z: ", z)
                        z = z.normalize();
                        
                        const cm = z.scale(obj.radialBound);

                        const intersection = cm.add(obj.location);
                        const i_point = new Point(intersection.x, intersection.y);
                        const o_point = new Point(this.location.x, this.location.y);
                        const dist = o_point.distanceTo(i_point);

                        arr.push({ obj: obj, point: i_point, d: dist });
                    }
                }

            }
            
        }

        // sort the array such that intersection with least d comes first in array
        arr.sort((a, b) => a.d-b.d);
        return arr;

    }

    attachTo(obj) {
        this.attachedTo = obj;
        obj.attachedRays.push(this);
    }

    render(ctx, length) {
        ctx.beginPath();
        ctx.moveTo(this.location.x, this.location.y);
        ctx.lineTo(this.dir.x*length + this.location.x, this.dir.y*length + this.location.y);
        ctx.strokeStyle = 'green';
        ctx.stroke();
        ctx.strokeStyle = 'black';
    }

    renderIntersection(ctx, intersection) {
        ctx.beginPath();
        ctx.arc(intersection.point.x, intersection.point.y, 5, 0, 2*Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
    }

    update() {
        if (this.attachedTo) {
            this.location = this.attachedTo.location;
            this.dir = this.attachedTo.forward;
        }
    }
}