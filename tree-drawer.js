import BST from "./bst.js";
import { debounce } from "./debounce.js";
import { treeDrawer } from "./main.js";
import Node from "./node.js";

/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById("canvas");

const ctx = canvas.getContext("2d");

function canvasResize(width = 0, height = 0) {
  if (width) {
    canvas.width = width;
  }
  if (height) {
    canvas.height = height;
  }
}

const reDrawDebounce = debounce(() => {
  treeDrawer.redraw();
}, 1000);

window.onresize = function () {
  canvasResize(
    window.innerWidth - 5.0000000000001,
    window.innerHeight - 5.0000000000001
  );

  reDrawDebounce();
};

canvasResize(
  window.innerWidth - 5.0000000000001,
  window.innerHeight - 5.0000000000001
);

export default class TreeDrawer {
  /**
   *
   * @param {BST} bst
   * @param {Object} options
   * @param {number} options.radius
   * @param {Object} options.startingPoint
   * @param {number} options.startingPoint.x
   * @param {number} options.startingPoint.y
   */
  constructor(
    bst,
    options = {
      radius: 30,
      startingPoint: { x: canvas.width / 2, y: (canvas.height / 10) * 1 },
    }
  ) {
    this.bst = bst;

    this.startingPoint = {
      x: options.startingPoint.x || canvas.width / 2,
      y: options.startingPoint.y || (canvas.height / 10) * 1,
    };

    this.radius = options.radius || 30;

    this.goesOnX = 3.3333 * this.radius;

    this.goesOnY = 3.3333 * this.radius;

    this.max = { x: this.startingPoint.x, y: this.startingPoint.y };

    this.min = { x: this.startingPoint.x, y: this.startingPoint.y };

    /**
     * @type {DrawedNode[]}
     */
    this.drawedNode = [];

    /**
     * @type {{ data: number; parentNodeData: number; map: ('left'|'right')[]}[]}
     */
    this.nodes = [];

    this.posisiton = new Map();
  }

  draw(nodeData, map, parentNodeData) {
    const startingPointX = this.startingPoint.x;
    const startingPointY = this.startingPoint.y;

    if (map.length === 0) {
      const lineColor = randomColor();

      this.drawNode(
        startingPointX,
        startingPointY,
        nodeData,
        {},
        {
          color: lineColor,
        }
      );

      this.drawedNode.push(
        new DrawedNode(
          { data: nodeData },
          { x: startingPointX, y: startingPointY },
          null,
          lineColor
        )
      );
    } else {
      const lineDir = map[map.length - 1];

      const swapLine = lineDir === "left" ? "right" : "left";

      let x = this.calculateX(startingPointX, map);
      let y = this.calculateY(startingPointY, map);
      let moveTo = [];
      let lineTo = [];

      const prevDrawedNode = this.drawedNode.find(
        ({ data }) => data === parentNodeData
      );

      const [uniqueX, uniqueY] = this.recursiveMassWithOtherNodesDrawed(x, y);

      const lineColor = this.recursiveUniqueColor(randomColor());

      moveTo = [prevDrawedNode.posisiton.x, prevDrawedNode.posisiton.y];

      lineTo = [uniqueX, uniqueY];

      if (this.checkNodeOutOfFrame(uniqueX, uniqueY)) return false;

      this.drawNode(
        uniqueX,
        uniqueY,
        nodeData,
        {
          lineType: swapLine,
        },
        { moveTo: moveTo, lineTo: lineTo, color: lineColor }
      );

      this.drawedNode.push(
        new DrawedNode(
          {
            data: nodeData,
            left: lineDir === "right",
            right: lineDir === "left",
          },
          { x: uniqueX, y: uniqueY },
          parentNodeData,
          lineColor
        )
      );
    }
    return true;
  }

  update() {
    if (!this.bst.root) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      return;
    }

    const draw = this.draw.bind(this);

    const bstReader = (node, map = [], prevNodeData) => {
      if (node.data !== null) {
        const nodeData = node.data;
        if (!this.nodes.some(({ data }) => data === nodeData)) {
          this.nodes.push({
            data: nodeData,
            map: map,
            parentNodeData: prevNodeData,
          });
        }

        if (node.right !== null) {
          bstReader(node.right, [...map, "right"], node.data);
        }

        if (node.left !== null) {
          bstReader(node.left, [...map, "left"], node.data);
        }
      }
    };

    bstReader(this.bst.root);

    const nodes = this.nodes;
    const drawedNode = this.drawedNode;

    for (const node of nodes) {
      const nodeData = node.data;

      if (drawedNode.some(({ data }) => data === nodeData)) {
        continue;
      }

      if (draw(nodeData, node.map, node.parentNodeData) === false) {
        break;
      }
    }
  }

  checkNodeOutOfFrame(x, y) {
    const greaterThanWidth = x + this.radius > canvas.width;
    const greaterThanHeight = y + this.radius > canvas.height;

    const xLessThanZero = x - this.radius < 0;

    const yLessThanZero = y - this.radius < 0;

    const massWidthEdges = greaterThanWidth || xLessThanZero;

    const massHeightEdges = greaterThanHeight || yLessThanZero;

    if (massWidthEdges || massHeightEdges) {
      this.drawedNode = [];

      canvasResize(
        massWidthEdges
          ? xLessThanZero
            ? canvas.width + this.radius + 200
            : x + this.radius + 50
          : 0,
        massHeightEdges ? y + this.radius + 50 : 0
      );

      if (xLessThanZero) {
        this.startingPoint.x = canvas.width / 2;
        this.startingPoint.y = (canvas.height / 10) * 1;
      }

      this.update();

      return true;
    } else {
      return false;
    }
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} data
   * @param {Object} options
   * @param {number} options.radius
   * @param { 'left' | 'right' | null} options.lineType
   * @param {Object} lineOptions
   * @param { [number, number] } lineOptions.moveTo
   * @param { [number, number] } lineOptions.lineTo
   * @param { string } lineOptions.color
   */
  drawNode(
    x = 95,
    y = 50,
    data = "0",
    options = {
      lineType: null,
    },
    lineOptions = {}
  ) {
    const radius = options.radius || this.radius;

    ctx.beginPath();

    ctx.fillStyle = "#fff";

    ctx.arc(x, y, radius, 0, 2 * Math.PI);

    ctx.fill();

    ctx.strokeStyle = "#000";

    ctx.stroke();

    ctx.font = "bold 30px Arial";

    ctx.fillStyle = "#000";

    ctx.fillText(data.toLocaleString(), x - 2 * 8, y + 10, radius);

    ctx.closePath();

    const speed = 1;

    if (data === 68) {
      console.log(data, options, lineOptions.moveTo);
    }
    if (options.lineType === "right") {
      const moveToX = lineOptions.moveTo[0] - this.radius / 1.5;
      const moveToY = lineOptions.moveTo[1] + this.radius / 1.5;
      const lineToX = lineOptions.lineTo[0] + this.radius / 1.5;
      const lineToY = lineOptions.lineTo[1] - this.radius / 1.3;

      let increaseLineToX = moveToX;
      let increaseLineToY = moveToY;

      const animate = () => {
        if (increaseLineToX > lineToX) {
          increaseLineToX -= speed;
        }

        if (increaseLineToY < lineToY) {
          increaseLineToY += speed;
        }

        this.drawLine(
          { x: moveToX, y: moveToY },
          {
            x: lineToX,
            y: lineToY,
          },
          { color: lineOptions.color }
        );

        // if (increaseLineToX > lineToX || increaseLineToY < lineToY)
        //   requestAnimationFrame(animate);
      };

      animate();
    }

    if (options.lineType === "left") {
      const moveToX = lineOptions.moveTo[0] + this.radius / 1.5;
      const moveToY = lineOptions.moveTo[1] + this.radius / 1.5;
      const lineToX = lineOptions.lineTo[0] - this.radius / 1.5;
      const lineToY = lineOptions.lineTo[1] - this.radius / 1.3;

      let increaseLineToX = moveToX;
      let increaseLineToY = moveToY;

      const animate = () => {
        if (increaseLineToX < lineToX) {
          increaseLineToX += speed;
        }

        if (increaseLineToY < lineToY) {
          increaseLineToY += speed;
        }

        this.drawLine(
          { x: moveToX, y: moveToY },
          {
            x: lineToX,
            y: lineToY,
          },
          { color: lineOptions.color }
        );
        // if (increaseLineToX < lineToX || increaseLineToY < lineToY)
        //   requestAnimationFrame(animate);
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
  drawLine(moveTo = { x, y }, lineTo = { x, y }, options) {
    ctx.beginPath();
    ctx.moveTo(moveTo.x, moveTo.y);
    ctx.lineTo(lineTo.x, lineTo.y);
    ctx.lineWidth = 3;
    ctx.strokeStyle = options.color || "green";
    ctx.stroke();
    ctx.closePath();
  }

  /**
   * @param {number} startingPoint
   * @param { ("right" | "left")[] } map
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
   */
  calculateY(startingPoint, map) {
    return this.goesOnY * map.length + startingPoint;
  }

  /**
   * @param {number} value1
   * @param {number} value2
   */
  getMinValue(value1, value2) {
    return value1 < value2 ? value1 : value2;
  }

  /**
   * @param {number} value1
   * @param {number} value2
   */
  getMaxValue(value1, value2) {
    return value1 > value2 ? value1 : value2;
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  setMax(x, y) {
    const max = this.max;

    max.x = this.getMaxValue(x, max.x);

    max.y = this.getMaxValue(y, max.y);
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  setMin(x, y) {
    const min = this.min;

    min.x = this.getMinValue(x, min.x);

    min.y = this.getMinValue(y, min.y);
  }

  resetMaxAndMin() {
    this.max.x = this.startingPoint.x;
    this.max.y = this.startingPoint.y;

    this.min.x = this.startingPoint.x;
    this.min.y = this.startingPoint.y;
  }

  redraw() {
    treeDrawer.drawedNode = [];
    treeDrawer.update();
  }

  /**
   *
   * @param {*} x
   * @param {*} y
   * @returns {DrawedNode}
   */
  massWithOtherNodesDrawed(x, y) {
    const massNode = this.drawedNode.find(
      ({ posisiton }) =>
        distance(x, y, posisiton.x, posisiton.y) - this.radius * 2 < 0
    );

    return massNode;
  }

  someColorWithOtherNodesDrawed(color) {
    const isSomeColor = this.drawedNode.some(
      (drawedNode) => drawedNode.lineColor === color
    );

    return isSomeColor;
  }

  recursiveMassWithOtherNodesDrawed(x, y) {
    const massWithOtherNodesDrawed = this.massWithOtherNodesDrawed.bind(this);

    let uniqueX = x;
    let uniqueY = y;

    // console.log("-----------------");
    // console.log("before", x, y);
    while (true) {
      /**
       * @type {DrawedNode}
       */
      const massWithOtherNodes = massWithOtherNodesDrawed(uniqueX, uniqueY);

      if (massWithOtherNodes) {
        const posisiton = massWithOtherNodes;
        // posisiton.x += 100;

        // uniqueX -= this.radius * 2 + 2;
        uniqueY -= this.radius * 2 + 30;
      } else {
        // console.log("after", x, uniqueY);

        return [uniqueX, uniqueY];
      }
    }
  }

  recursiveUniqueColor(color) {
    if (this.someColorWithOtherNodesDrawed(color)) {
      const newColor = randomColor();

      return this.recursiveUniqueColor(newColor);
    } else {
      return color;
    }
  }
}

function distance(x1, y1, x2, y2) {
  const xDist = x2 - x1;
  const yDist = y2 - y1;

  return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
}

function randomColor() {
  const HEX = "A1B2C3D4E5F67890";

  let color = "#";

  for (let i = 0; i <= 5; i++) {
    color += HEX[Math.floor(Math.random() * HEX.length)];
  }

  return color;
}

class DrawedNode {
  /**
   *
   * @param {{ data: number; left:boolean; right:boolean; }} node
   * @param {{ x: number; y: number;}} posisiton
   * @param {number} parentNodeData
   * @param {number} lineColor
   */
  constructor(node, posisiton, parentNodeData = null, lineColor) {
    this.data = node.data;
    this.left = node.left || null;
    this.right = node.right || null;
    this.posisiton = posisiton;
    this.parentNodeData = parentNodeData;
    this.lineColor = lineColor;
  }
}
