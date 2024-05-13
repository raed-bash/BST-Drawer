import BST from "./bst.js";
import { nodeDrawer } from "./main.js";

/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById("canvas");

const ctx = canvas.getContext("2d");

function canvasResize() {
  canvas.width = window.innerWidth - 6;
  canvas.height = window.innerHeight - 6;
}

window.onresize = function () {
  canvasResize();
  nodeDrawer.bstDraw();
};

canvasResize();

export default class NodeDrawer {
  constructor(bst) {
    /**
     * @type {BST}
     */

    this.bst = bst;

    this.startingPoint = { x: 960, y: 50 };

    this.goesOnX = 100;

    this.goesOnY = 100;

    this.radius = 30;

    this.drawedNode = [];
  }

  bstDraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!this.bst.root) return;

    const startingPointX = this.startingPoint.x;
    const startingPointY = this.startingPoint.y;

    const calculateX = this.calculateX.bind(this);
    const calculateY = this.calculateY.bind(this);

    const bstDrawer = (node, map = []) => {
      if (node.data !== null) {
        if (map.length === 0) {
          this.drawNode(startingPointX, startingPointY, node.data);
        } else {
          this.drawNode(
            calculateX(startingPointX, map),
            calculateY(startingPointY, map),
            node.data,
            { noLeftLine: !node.left, noRightLine: !node.right }
          );
        }

        if (node.right !== null) {
          bstDrawer(node.right, [...map, "right"]);
        }

        if (node.left !== null) {
          bstDrawer(node.left, [...map, "left"]);
        }
      }
    };
    bstDrawer(this.bst.root);
  }
  /**
   *
   * @param {number} x
   * @param {number} y
   * @param {number} data
   * @param {Object} options
   * @param {number} options.radius
   * @param {boolean} options.noLeftLine
   * @param {boolean} options.noRightLine
   */
  drawNode(
    x = 95,
    y = 50,
    data = "0",
    options = { noLeftLine: false, noRightLine: false }
  ) {
    const radius = options.radius || this.radius || 30;

    ctx.beginPath();

    ctx.fillStyle = "#fff";

    ctx.arc(x, y, radius, 0, 2 * Math.PI);

    ctx.fill();

    ctx.stroke();

    ctx.closePath();

    ctx.beginPath();

    ctx.font = "bold 30px Arial";

    ctx.fillStyle = "#000";

    ctx.fillText(data.toLocaleString(), x - 2 * 8, y + 10, radius);

    ctx.closePath();

    if (!options.noRightLine) {
      this.drawLine(
        { x: x + radius / 1.2, y: y + radius / 2 },
        {
          x: x + (this.goesOnX / 100) * 80,
          y: y + (this.goesOnY / 100) * 80,
        }
      );
    }

    if (!options.noLeftLine) {
      this.drawLine(
        { x: x - radius / 1.2, y: y + radius / 2 },
        {
          x: x - (this.goesOnX / 100) * 80,
          y: y + (this.goesOnY / 100) * 80,
        }
      );
    }
  }

  /**
   * @param {Object} moveTo
   * @param {number} moveTo.x
   * @param {number} moveTo.y
   * @param {Object} lineTo
   * @param {number} lineTo.x
   * @param {number} lineTo.y
   */
  drawLine(moveTo = { x, y }, lineTo = { x, y }) {
    ctx.moveTo(moveTo.x, moveTo.y);
    ctx.lineTo(lineTo.x, lineTo.y);
    ctx.stroke();
  }

  /**
   * @param {number} startingPoint
   * @param { ("right" | "left")[] } map
   *
   */
  calculateX(startingPoint, map) {
    let x = startingPoint;

    const goesOnX = this.goesOnX;

    map.forEach((value) => {
      if (value === "left") {
        x -= goesOnX;
      } else {
        x += goesOnX;
      }
    });

    return x;
  }

  /**
   * @param {number} startingPoint
   * @param { ("right" | "left")[] } map
   *
   */
  calculateY(startingPoint, map) {
    return this.goesOnY * map.length + startingPoint;
  }
}
