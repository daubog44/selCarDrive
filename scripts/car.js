import Controls from "./controls.js";
import Sensor from "./Sensor.js";
import { polysIntersect } from "./utils.js";
import NeuralNetwork from "./network.js";

export default class Car {
  constructor(x, y, width, height, controlType, maxSpeed = 10) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = 0;
    this.acceleration = 0.2;
    this.maxSpeed = maxSpeed;
    this.friction = 0.05;
    this.angle = 0;
    this.dameged = false;
    this.polygons = [];
    this.useBrain = controlType === "AI" ? true : false;
    this.offset = 0;

    if (controlType != "DUMMY") {
      this.sensor = new Sensor(this);
      this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 4]);
    }
    this.controls = new Controls(controlType);
  }

  update(roadBorders, traffic) {
    if (!this.dameged) {
      this.#move();
      this.dameged = this.#assessDamage(roadBorders, traffic);
      this.polygons = this.#createPlygon();
    }
    if (this.sensor) {
      this.sensor.update(roadBorders, traffic);
      let offsets = 0;
      offsets = this.sensor.readings.map((s) => {
        return s == null ? 0 : 1 - s.offset;
      });
      this.offset = offsets.reduce((a, b) => a + b, 0) / offsets.length;

      const outputs = NeuralNetwork.feedForward(offsets, this.brain);
      //console.log(outputs);

      if (this.useBrain) {
        this.controls.forward = outputs[0];
        this.controls.left = outputs[1];
        this.controls.right = outputs[2];
        this.controls.reverse = outputs[3];
      }
    }
  }

  draw(ctx, color, drawSensor = false) {
    //ctx.save();
    //ctx.translate(this.x, this.y);
    //ctx.rotate(-this.angle);
    //ctx.beginPath();
    //ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height);
    //ctx.fillStyle = "red";
    //ctx.fill();
    //ctx.restore();

    if (this.dameged) {
      ctx.fillStyle = "red";
      this.speed = 0;
    } else {
      ctx.fillStyle = color;
    }
    ctx.beginPath();
    ctx.moveTo(this.polygons[0].x, this.polygons[0].y);
    //console.log(this.polygons[0].x);
    for (let i = 1; i < this.polygons.length; i++) {
      ctx.lineTo(this.polygons[i].x, this.polygons[i].y);
    }
    ctx.fill();

    if (drawSensor && this.sensor) {
      this.sensor.draw(ctx);
    }
  }

  #move() {
    if (this.controls.forward) {
      this.speed += this.acceleration;
    }
    if (this.controls.reverse) {
      this.speed -= this.acceleration;
    }

    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
    }
    if (this.speed < -this.maxSpeed / 2) {
      this.speed = -this.maxSpeed / 2;
    }

    if (this.speed > 0) {
      this.speed -= this.friction;
    }

    if (this.speed < 0) {
      this.speed += this.friction;
    }
    if (Math.abs(this.speed) < this.friction) {
      this.speed = 0;
    }

    if (this.speed != 0) {
      const flip = this.speed < 0 ? -1 : 1;
      if (this.controls.left) {
        this.angle += 0.03 * flip;
      }
      if (this.controls.right) {
        this.angle -= 0.03 * flip;
      }
    }

    this.x -= Math.sin(this.angle) * this.speed;
    this.y -= Math.cos(this.angle) * this.speed;
  }

  #createPlygon() {
    const points = [];
    const radius = Math.hypot(this.width, this.height) / 2; // ipotenus /2
    const aplpha = Math.atan2(this.width, this.height);
    points.push({
      x: this.x - Math.sin(this.angle - aplpha) * radius,
      y: this.y - Math.cos(this.angle - aplpha) * radius,
    });
    points.push({
      x: this.x - Math.sin(this.angle + aplpha) * radius,
      y: this.y - Math.cos(this.angle + aplpha) * radius,
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle - aplpha) * radius,
      y: this.y - Math.cos(Math.PI + this.angle - aplpha) * radius,
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle + aplpha) * radius,
      y: this.y - Math.cos(Math.PI + this.angle + aplpha) * radius,
    });
    return points;
  }

  #assessDamage(roadBorders, traffic) {
    for (let i = 0; i < roadBorders.length; i++) {
      if (polysIntersect(this.polygons, roadBorders[i])) {
        return true;
      }
    }

    for (let i = 0; i < traffic.length; i++) {
      if (polysIntersect(this.polygons, traffic[i].polygons)) {
        return true;
      }
    }

    return false;
  }
}
