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
  /**
   *
   * @param {BST} bst
   * @param {Object} options
   * @param {number} options.radius
   * @param {Object} options.startingPoint
   * @param {number} options.startingPoint.x
   * @param {number} options.startingPoint.y
   */
  constructor(bst, options = { radius: 30, startingPoint: { x: 960, y: 50 } }) {
    this.bst = bst;

    this.startingPoint = {
      x: options.startingPoint.x || 960,
      y: options.startingPoint.y || 50,
    };

    this.radius = options.radius || 30;

    this.goesOnX = 3.3333 * this.radius;

    this.goesOnY = 3.3333 * this.radius;

    this.drawedNode = new Set();
  }

  bstDraw() {
    const startingPointX = this.startingPoint.x;
    const startingPointY = this.startingPoint.y;

    const calculateX = this.calculateX.bind(this);
    const calculateY = this.calculateY.bind(this);

    const bstDrawer = (node, map = []) => {
      if (node.data !== null) {
        if (!this.drawedNode.has(node.data)) {
          if (map.length === 0) {
            this.drawNode(startingPointX, startingPointY, node.data, {
              noLeftLine: true,
              noRightLine: true,
            });
          } else {
            const currentLocation = map[map.length - 1];

            this.drawNode(
              calculateX(startingPointX, map),
              calculateY(startingPointY, map),
              node.data,
              {
                noLeftLine: currentLocation === "left",
                noRightLine: currentLocation === "right",
              }
            );
          }

          this.drawedNode.add(node.data);
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
    const radius = options.radius || this.radius;

    ctx.beginPath();

    ctx.fillStyle = "#fff";

    ctx.arc(x, y, radius, 0, 2 * Math.PI);

    ctx.fill();

    ctx.strokeStyle = "#000";

    ctx.stroke();

    ctx.closePath();

    ctx.beginPath();

    ctx.font = "bold 30px Arial";

    ctx.fillStyle = "#000";

    ctx.fillText(data.toLocaleString(), x - 2 * 8, y + 10, radius);

    ctx.closePath();

    const speed = 4;

    if (!options.noRightLine) {
      const moveToX = x + (this.goesOnX / 100) * 80;
      const moveToY = y - (this.goesOnY / 100) * 80;
      const lineToX = x + radius / 1.5;
      const lineToY = y - radius / 2;

      let increaseLineToX = moveToX;
      let increaseLineToY = moveToY;

      const animate = () => {
        increaseLineToX -= speed;
        increaseLineToY += speed;

        this.drawLine(
          { x: moveToX, y: moveToY },
          {
            x: increaseLineToX,
            y: increaseLineToY,
          }
        );

        if (increaseLineToX > lineToX && increaseLineToY < lineToY)
          requestAnimationFrame(animate);
      };
      animate();
    }

    if (!options.noLeftLine) {
      const moveToX = x - (this.goesOnX / 100) * 80;
      const moveToY = y - (this.goesOnY / 100) * 80;
      const lineToX = x - radius / 1.5;
      const lineToY = y - radius / 2;

      let increaseLineToX = moveToX;
      let increaseLineToY = moveToY;

      const animate = () => {
        increaseLineToX += speed;
        increaseLineToY += speed;

        this.drawLine(
          { x: moveToX, y: moveToY },
          {
            x: increaseLineToX,
            y: increaseLineToY,
          }
        );
        if (increaseLineToX < lineToX && increaseLineToY < lineToY)
          requestAnimationFrame(animate);
      };
      animate();
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
  drawLine(moveTo = { x, y }, lineTo = { x, y }, right) {
    ctx.beginPath();
    ctx.moveTo(moveTo.x, moveTo.y);
    ctx.lineTo(lineTo.x, lineTo.y);
    ctx.strokeStyle = "green";
    ctx.stroke();
    ctx.closePath();
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
