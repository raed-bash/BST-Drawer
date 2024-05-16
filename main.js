import BST from "./bst.js";
import TreeDrawer from "./tree-drawer.js";

const bst = new BST();

const defaultValues = [50, 68, 65, 47, 30, 10, 8, 9, 15];

if (bst.root === null) {
  defaultValues.forEach((value) => {
    bst.add(value);
  });
}

export const treeDrawer = new TreeDrawer(bst);

treeDrawer.update();

document.getElementById("node-insert-form").onsubmit = function (e) {
  e.preventDefault();

  const input = e.target[0];

  const value = input.value;

  if (!value || (typeof value !== "string" && typeof value !== "number"))
    return alert("please enter the number");

  bst.add(parseInt(value));

  treeDrawer.update();

  input.value = "";
};

document.getElementById("node-remove-form").onsubmit = function (e) {
  e.preventDefault();
  const input = e.target[0];

  const value = input.value;

  if (!value || (typeof value !== "string" && typeof value !== "number"))
    return alert("please enter the number");

  bst.remove(parseInt(value));

  treeDrawer.update();

  input.value = "";
};

document.getElementById("reset").onclick = function () {
  bst.reset();
  treeDrawer.update();
};
