import Car from "./scripts/car.js";
import Road from "./scripts/road.js";
import Visualazier from "./scripts/visualazier.js";
import NeuralNetwork from "./scripts/network.js";

const buttonSave = document.getElementById("save");
const buttonDiscard = document.getElementById("discard");
const meters = document.getElementById("meters");
let metersPath;

const canvas = document.getElementById("myCanvas");
canvas.width = 200;
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 300;

const networkContext = networkCanvas.getContext("2d");
const ctx = canvas.getContext("2d");

const road = new Road(canvas.width / 2, canvas.width * 0.9);

const N = 1000;
const cars = generateCars(N);

const traffic = [];
setInterval(() => {
  traffic.push(
    new Car(
      road.getLaneCenter(Math.round(Math.random() * 3)),
      bestCar.y - 1000,
      30,
      50,
      "AI",
      5
    )
  );
}, 1000);

let bestCar = cars[0];
if (localStorage.getItem("brain")) {
  for (let i = 0; i < cars.length; i++) {
    cars[i].brain = JSON.parse(localStorage.getItem("brain"));
    if (i != 0) {
      NeuralNetwork.mutate(cars[i].brain, 0.15); //! value of mutation
    }
  }
}

function save() {
  localStorage.setItem("brain", JSON.stringify(bestCar.brain));
  localStorage.setItem("bestMeters", metersPath);
}

function discard() {
  localStorage.removeItem("brain");
  localStorage.removeItem("bestMeters");
}

function reloadAndSave() {
  save();
  location.reload();
}

buttonSave.addEventListener("click", save);
buttonDiscard.addEventListener("click", discard);

function generateCars(N) {
  const cars = [];
  for (let i = 0; i < N; i++) {
    cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));
  }
  return cars;
}

setInterval(() => {
  const metersBefore = metersPath;
  setTimeout(() => {
    if (
      metersPath == metersBefore &&
      metersPath > localStorage.getItem("bestMeters")
    ) {
      reloadAndSave();
    } else if (metersPath == metersBefore) {
      location.reload();
    }
  }, 3000);
}, 5000);

function animate(time) {
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].update(road.borders, []);
  }

  for (let i = 0; i < cars.length; i++) {
    cars[i].update(road.borders, traffic);
  }

  bestCar = cars.find((car) => car.y == Math.min(...cars.map((c) => c.y)));

  canvas.height = window.innerHeight;
  networkCanvas.height = window.innerHeight;
  ctx.save();

  ctx.translate(0, -bestCar.y + canvas.height * 0.7);
  road.draw(ctx);
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].draw(ctx, "red");
  }

  ctx.globalAlpha = 0.2;
  for (let i = 0; i < cars.length; i++) {
    cars[i].draw(ctx, "blue");
  }
  ctx.globalAlpha = 1;
  bestCar.draw(ctx, "blue", true);
  metersPath = Math.round(Math.abs(bestCar.y));
  meters.innerText = `${metersPath}m`;
  ctx.restore();

  networkContext.lineDashOffset = -time / 50;
  Visualazier.drawNetwork(networkContext, bestCar.brain);
  requestAnimationFrame(animate);
}
animate();

//! example of brain in json format
/*
brain: "{\"levels\":[{\"inputs\":[0.8744198085121659,0.8620494488974156,0,0,0.8501274560780986],\"outputs\":[0,1,1,0,0,0],\"biases\":[0.14523951618716796,-0.15188640357559896,0.019091484594041475,0.16880194007481628,0.28876158838876725,0.05605966707217569],\"weights\":[[0.2193438534729869,0.07769216476277536,0.00531010580858584,0.049891931632467565,-0.24819187209871646,0.019695009424414933],[-0.1371215526107526,0.008757726305468005,0.3216320401895175,0.10908301668284837,-0.2421614000764839,-0.10025537441492106],[0.2500711643645019,0.0004576764556417229,0.10568743820362088,-0.17358726984946987,0.3728504757025728,0.08753773845716525],[0.0807930806411216,0.05362485703041896,-0.2606456001620513,-0.07674494611118891,-0.30474226730831777,-0.09966037427523433],[-0.18966930432386236,0.10847106432550002,-0.1107871442603425,-0.17603567414210342,0.10513614194236853,-0.15118209951975692]]},{\"inputs\":[0,1,1,0,0,0],\"outputs\":[1,0,1,0],\"biases\":[-0.3367470978680244,0.06790617634208432,0.07349701171051082,0.23692048232366197],\"weights\":[[0.033534812371026596,-0.09713506679647266,0.14274040805382004,-0.1880167570606689],[0.050649330441195115,0.13754429486913283,0.046209870224163965,-0.22533030258542586],[0.148609570712755,-0.267650995254768,0.34914958517758843,0.14838645406453602],[-0.06949489447501547,-0.2868267218567363,-0.26176209238438425,0.00013246573477721478],[0.2725132463646747,-0.01886962751679866,0.08614749624610168,0.1113104919668933],[-0.072903576762919,0.41661729772725353,0.20197981634179457,-0.1960415084378667]]}]}"
*/
