class Particle extends Object{
    constructor(location, mass, initialVelocity, collidable, radialBound) {
        super(location, mass, initialVelocity, collidable, radialBound);
    }

    render(ctx) {
        ctx.beginPath();
        ctx.arc(this.location.x, this.location.y, this.radialBound, 0, 2*Math.PI);
        ctx.stroke();
    }
}
