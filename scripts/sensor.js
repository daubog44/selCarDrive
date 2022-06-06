import { lerp } from "./utils.js";
import { getIntersection } from "./utils.js";

export default class Sensor {
  constructor(car) {
    this.car = car;
    this.rayCount = 7;
    this.rayLength = 300;
    this.raySpread = Math.PI / 2;
    this.rays = [];
    this.readings = [];
  }

  update(roadBorders, traffic) {
    //console.log(roadBorders[1][0]);
    this.#castRays();
    this.readings = [];
    for (let i = 0; i < this.rays.length; i++) {
      const ray = this.rays[i];
      const closest = this.#findClosest(ray, roadBorders, traffic);
      //console.log(closest);
      this.readings.push(closest);
      //console.log(this.readings);
    }
  }

  draw(ctx) {
    for (let i = 0; i < this.rayCount; i++) {
      const ray = this.rays[i];
      let end = ray[1];
      if (this.readings[i]) {
        end = this.readings[i];
      }
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "yellow";
      ctx.moveTo(ray[0].x, ray[0].y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "black";
      ctx.moveTo(ray[1].x, ray[1].y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }
  }

  #castRays() {
    this.rays = [];
    for (let i = 0; i < this.rayCount; i++) {
      const rayAngle =
        lerp(
          this.raySpread / 2,
          -this.raySpread / 2,
          this.rayCount === 1 ? 0.5 : i / (this.rayCount - 1)
        ) + this.car.angle;
      const start = { x: this.car.x, y: this.car.y };
      const end = {
        x: this.car.x - Math.sin(rayAngle) * this.rayLength,
        y: this.car.y - Math.cos(rayAngle) * this.rayLength,
      };
      this.rays.push([start, end]);
    }
  }

  #findClosest(ray, roadBorders, traffic) {
    //console.log(ray);
    let touches = [];
    for (let i = 0; i < roadBorders.length; i++) {
      const touch = getIntersection(
        ray[0],
        ray[1],
        roadBorders[i][0],
        roadBorders[i][1]
      );
      //console.log(touch);
      if (touch) touches.push(touch);
    }

    for (let i = 0; i < traffic.length; i++) {
      const poly = traffic[i].polygons;
      for (let j = 0; j < poly.length; j++) {
        const touch = getIntersection(
          ray[0],
          ray[1],
          poly[j],
          poly[(j + 1) % poly.length]
        );
        if (touch) touches.push(touch);
      }
    }

    if (touches.length === 0) return null;
    const offsets = touches.map((e) => e.offset);
    const closest = Math.min(...offsets);
    return touches.find((e) => e.offset === closest);
  }
}
