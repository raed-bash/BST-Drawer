import Node from "./node.js";

export default class BST {
  constructor() {
    this.root = JSON.parse(localStorage.getItem("root"));
  }

  add(data) {
    const node = this.root;
    if (node === null) {
      this.root = new Node(data);
      return;
    } else {
      const searchTree = function (node) {
        if (data < node.data) {
          if (node.left === null) {
            node.left = new Node(data);
            return;
          } else if (node.left !== null) {
            return searchTree(node.left);
          }
        } else if (data > node.data) {
          if (node.right === null) {
            node.right = new Node(data);
            return;
          } else if (node.right !== null) {
            return searchTree(node.right);
          }
        } else {
          return null;
        }
      };
      searchTree(node);

      this.updateStorage(node);
    }
  }

  updateStorage(root) {
    localStorage.setItem("root", JSON.stringify(root));
  }
  reset() {
    this.root = null;

    this.updateStorage(null);
  }

  findMin() {
    let current = this.root;
    while (current.left !== null) {
      current = current.left;
    }
    return current;
  }

  findMax() {
    let current = this.root;
    while (current.right !== null) {
      current = current.right;
    }
    return current;
  }

  find(data) {
    let current = this.root;
    while (current.data !== data) {
      if (data < current.left) {
        current = current.left;
      } else {
        current = current.right;
      }
    }
    if (current == null) return null;
    return current;
  }

  isPresent(data) {
    let current = this.root;
    while (current) {
      if (data === current.data) {
        return true;
      }
      if (data < current.data) {
        current = current.left;
      } else {
        current = current.right;
      }
    }
    return false;
  }

  remove(data) {
    const removeNode = (node, data) => {
      if (node == null) return null;
      if (node.data == data) {
        if (node.left == null && node.right == null) {
          return null;
        } else if (node.left == null) {
          return node.right;
        } else if (node.right == null) {
          return node.left;
        }
        let tempNode = node.right;
        while (tempNode.left !== null) {
          tempNode = tempNode.left;
        }
        node.data = tempNode.data;
        node.right = removeNode(node.right, tempNode.data);
        return node;
      } else if (data < node.data) {
        node.left = removeNode(node.left, data);
        return node;
      } else {
        node.right = removeNode(node.right, data);
        return node;
      }
    };
    this.root = removeNode(this.root, data);

    this.updateStorage(this.root);
  }

  updateStorage(root) {
    localStorage.setItem("root", JSON.stringify(root));
  }
}
