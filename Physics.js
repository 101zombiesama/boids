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
    constructor(location, mass, initialVelocity, collidable, radialBound) {
        this.location = location;
        this.collidable = collidable;
        this.radialBound = radialBound;
        this.velocity = initialVelocity;
        this.maxSpeed = 15;
        this.acceleration = new Vec2(0, 0);
        this.mass = mass;
    }

    update() {
        // update velocity according to the current acceleration
        if (this.velocity.getLength() < this.maxSpeed) {
            this.velocity = this.velocity.add(this.acceleration);
        }
        // updating location according to the current velocity
        this.location = this.location.add(this.velocity);
    }


}

class Ray {
    constructor(location, dir) {
        this.location = location;
        this.dir = dir;
    }

    cast(checklist) {
        const arr = []
        for (let obj of checklist) {
            // first check if the ray intersects or not;
            const a = this.dir.y;
            const b = -this.dir.x;
            const c = this.dir.x*this.location.y - this.dir.y*this.location.x;
            // d is the perpendicular distance bewteen ray and the center of obj
            const d = Math.abs((a*obj.location.x + b*obj.location.y + c) / Math.sqrt(a**2 + b**2));

            if (d <= obj.radialBound) {
                // calculate point of intersection
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
                z = z.normalize();
                
                const cm = z.scale(obj.radialBound);

                const intersection = cm.add(obj.location);

                arr.push({ obj: obj, point: intersection });
            }
        }
        return arr;

    }

    render(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.location.x, this.location.y);
        ctx.lineTo(this.dir.x*600 + this.location.x, this.dir.y*600 + this.location.y);
        ctx.stroke();
    }
}