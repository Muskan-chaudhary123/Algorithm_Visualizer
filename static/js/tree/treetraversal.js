const canvas = document.getElementById("treeCanvas");
const ctx = canvas.getContext("2d");
const explain = document.getElementById("explain");
const traversalBox = document.getElementById("traversal");

const PADDING = 40;
const MIN_RADIUS = 6;
const MAX_RADIUS = 26;

let NODE_RADIUS = MAX_RADIUS;
let LEVEL_GAP = NODE_RADIUS * 3;

const COLORS = {
  normal: "#00a86b",
  highlight: "#ffcc33",
  edge: "#ffffff",
  text: "#ffffff"
};

class Node {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
    this.x = 0;
    this.y = 0;
  }
}

let root = null;
let traversal = [];

function delay() {
  return Number(document.getElementById("speed").value);
}
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
function explainText(t) {
  explain.innerHTML = t;
}

function depth(node) {
  if (!node) return 0;
  return 1 + Math.max(depth(node.left), depth(node.right));
}

function countNodes(node) {
  if (!node) return 0;
  return 1 + countNodes(node.left) + countNodes(node.right);
}

function updateNodeSize() {
  const d = depth(root) || 1;
  const maxNodes = Math.pow(2, d - 1);
  const usableWidth = canvas.width - 2 * PADDING;

  let r = usableWidth / (maxNodes * 3);
  NODE_RADIUS = Math.min(MAX_RADIUS, Math.max(MIN_RADIUS, r));
  LEVEL_GAP = NODE_RADIUS * 3;
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
}

function assignXYInorder() {
  if (!root) return;

  resizeCanvas();
  updateNodeSize();

  let idx = 0;
  const total = countNodes(root);
  const gap = (canvas.width - 2 * PADDING) / (total + 1);

  function inorder(node, d = 0) {
    if (!node) return;

    inorder(node.left, d + 1);

    idx++;
    node.x = PADDING + idx * gap;
    node.y = NODE_RADIUS + 40 + d * LEVEL_GAP;

    inorder(node.right, d + 1);
  }

  inorder(root);

  canvas.height = Math.max(
    500,
    depth(root) * LEVEL_GAP + 120
  );
}

function layoutTree() {
  assignXYInorder();
}

function draw(highlight = null) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!root) return;

  drawEdges(root);
  drawNodes(root, highlight);
}

function drawEdges(node) {
  if (!node) return;

  ctx.strokeStyle = COLORS.edge;
  ctx.lineWidth = 2;

  if (node.left) {
    ctx.beginPath();
    ctx.moveTo(node.x, node.y);
    ctx.lineTo(node.left.x, node.left.y);
    ctx.stroke();
    drawEdges(node.left);
  }

  if (node.right) {
    ctx.beginPath();
    ctx.moveTo(node.x, node.y);
    ctx.lineTo(node.right.x, node.right.y);
    ctx.stroke();
    drawEdges(node.right);
  }
}

function drawNode(node, color) {
  const r = NODE_RADIUS;

  ctx.beginPath();
  ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = COLORS.edge;
  ctx.stroke();

  ctx.fillStyle = COLORS.text;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (r >= 14) {
    ctx.font = `${Math.max(10, r)}px Arial`;
    ctx.fillText(node.val, node.x, node.y);
  } else {
    ctx.font = "12px Arial";
    ctx.fillText(node.val, node.x, node.y + r + 14);
  }
}

function drawNodes(node, highlight) {
  if (!node) return;
  drawNodes(node.left, highlight);
  drawNode(node, highlight === node ? COLORS.highlight : COLORS.normal);
  drawNodes(node.right, highlight);
}

function insertNode() {
  const v = parseInt(value.value);
  if (isNaN(v)) return;

  if (!root) {
    root = new Node(v);
  } else {
    const q = [root];
    while (q.length) {
      const n = q.shift();
      if (!n.left) {
        n.left = new Node(v);
        break;
      }
      if (!n.right) {
        n.right = new Node(v);
        break;
      }
      q.push(n.left, n.right);
    }
  }
  explainText(`Inserted ${v} into the tree`);

  layoutTree();
  draw();
}

async function visit(node) {
  traversal.push(node.val);
  traversalBox.innerHTML = "Traversal: " + traversal.join(" → ");
  draw(node);
  await sleep(delay());
}

async function inorder() {
  traversal = [];
  traversalBox.innerHTML = "";
  explainText("Inorder: Left → Root → Right");
  await inorderRec(root);
}
async function inorderRec(node) {
  if (!node) return;
  await inorderRec(node.left);
  await visit(node);
  await inorderRec(node.right);
}

async function preorder() {
  traversal = [];
  traversalBox.innerHTML = "";
  explainText("Preorder: Root → Left → Right");
  await preorderRec(root);
}
async function preorderRec(node) {
  if (!node) return;
  await visit(node);
  await preorderRec(node.left);
  await preorderRec(node.right);
}

async function postorder() {
  traversal = [];
  traversalBox.innerHTML = "";
  explainText("Postorder: Left → Right → Root");
  await postorderRec(root);
}
async function postorderRec(node) {
  if (!node) return;
  await postorderRec(node.left);
  await postorderRec(node.right);
  await visit(node);
}

function resetTree() {
  root = null;
  traversal = [];
  explainText("Tree reset");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  traversalBox.innerHTML = "";
  
}

window.addEventListener("resize", () => {
  layoutTree();
  draw();
});
draw();

function goHome() {
      window.location.href = "/";
    }

    function goRead() {
      window.location.href = "/read/treetraversal"; 
}