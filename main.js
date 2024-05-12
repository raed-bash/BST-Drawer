import BST from "./bst.js";
import NodeDrawer from "./node-drawer.js";

const bst = new BST();

const defaultValues = [50, 68, 65, 47, 30, 10, 8, 9, 15];

defaultValues.forEach((value) => {
  bst.add(value);
});

export const nodeDrawer = new NodeDrawer(bst);

nodeDrawer.bstDraw();

document.getElementById("node-insert-form").onsubmit = function (e) {
  e.preventDefault();

  const input = e.target[0];

  const value = input.value;

  if (!value || (typeof value !== "string" && typeof value !== "number"))
    return alert("please enter the number");

  bst.add(parseInt(value));

  nodeDrawer.bstDraw();

  input.value = "";
};

document.getElementById("node-remove-form").onsubmit = function (e) {
  e.preventDefault();
  const input = e.target[0];

  const value = input.value;

  if (!value || (typeof value !== "string" && typeof value !== "number"))
    return alert("please enter the number");

  bst.remove(parseInt(value));

  nodeDrawer.bstDraw();

  input.value = "";
};

document.getElementById("reset").onclick = function () {
  bst.root = null;
  nodeDrawer.bstDraw();
};
