export default class Controls {
  constructor(type) {
    this.forward = false;
    this.left = false;
    this.right = false;
    this.reverse = false;

    switch (type) {
      case "KEYS":
        this.#keyBoardListener();
        break;
      case "DUMMY":
        this.forward = true;
        break;
    }
  }

  #keyBoardListener() {
    document.onkeydown = (e) => {
      switch (e.key) {
        case "ArrowLeft":
          this.left = true;
          break;
        case "ArrowRight":
          this.right = true;
          break;
        case "ArrowUp":
          this.forward = true;
          break;
        case "ArrowDown":
          this.reverse = true;
          break;
        case "w":
          this.forward = true;
          break;
        case "a":
          this.left = true;
          break;
        case "s":
          this.reverse = true;
          break;
        case "d":
          this.right = true;
          break;
        default:
          break;
      }
      //console.table(this);
    };
    document.onkeyup = (e) => {
      switch (e.key) {
        case "ArrowLeft":
          this.left = false;
          break;
        case "ArrowRight":
          this.right = false;
          break;
        case "ArrowUp":
          this.forward = false;
          break;
        case "ArrowDown":
          this.reverse = false;
          break;
        case "w":
          this.forward = false;
          break;
        case "a":
          this.left = false;
          break;
        case "s":
          this.reverse = false;
          break;
        case "d":
          this.right = false;
          break;
        default:
          break;
      }
      //console.table(this);
    };
  }
}
