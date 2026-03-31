const canvas = document.getElementById("bstCanvas");
const ctx = canvas.getContext("2d");
const explain = document.getElementById("explain");
const container = canvas.parentElement;

const PADDING = 40;
let deleteSteps = [];

const COLORS = {
  normal: "#00a86b",
  highlight: "#ffcc33",
  found: "#66cc66",
  notfound: "#ff6666",
  edge: "#ffffff",
  text: "#ffffff",
  delete: "#ff4444",
  successor: "#ff9933",
  promote: "#66ccff"

};

class Node {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.x = 0;
    this.y = 0;
    this.id = Node.nextId++;
  }
}
Node.nextId = 1;
let root = null;

function resetTree() {
  root = null;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function delay() {
  return Number(document.getElementById("speed").value);
}
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
function explainText(t) {
  explain.innerHTML = t;
  
}

function countNodes(n) {
  if (!n) return 0;
  return 1 + countNodes(n.left) + countNodes(n.right);
}

function depth(n) {
  if (!n) return 0;
  return 1 + Math.max(depth(n.left), depth(n.right));
}


function getNodeRadius() {
  const total = countNodes(root);
  if (total === 0) return 12;

  const gap = (canvas.width - 2 * PADDING) / (total + 1);
  const MAX = 30;
  const MIN = 6;
  let r = gap * 0.25;
  return Math.max(MIN, Math.min(MAX, r));
}

function getLevelGap() {
  return getNodeRadius() * 3;
}

function resizeCanvas() {
  canvas.width = Math.max(container.clientWidth, 800);
}

function assignPositions() {
  resizeCanvas();

  let idx = 0;
  const total = countNodes(root);
  const gap = (canvas.width - 2 * PADDING) / (total + 1);

  function inorder(node, d) {
    if (!node) return;
    inorder(node.left, d + 1);
    idx++;
    node.x = PADDING + idx * gap;
    node.y = 70 + d * getLevelGap();

    inorder(node.right, d + 1);
  }

  inorder(root, 0);
  canvas.height = Math.max(500, depth(root) * getLevelGap() + 140);
}

function drawNode(node, color = COLORS.normal) {
  const r = getNodeRadius();

  ctx.beginPath();
  ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = COLORS.edge;
  ctx.lineWidth = Math.max(1, r * 0.15);
  ctx.stroke();
  ctx.fillStyle = COLORS.text;
  ctx.textAlign = "center";

  if (r <= 10) {
    ctx.textBaseline = "top";
    ctx.font = "12px Arial";
    ctx.fillText(node.value, node.x, node.y + r + 4);
  } else {
    ctx.textBaseline = "middle";
    ctx.font = `${Math.max(12, r)}px Arial`;
    ctx.fillText(node.value, node.x, node.y);
  }
}

function drawEdges(node) {
  if (!node) return;

  ctx.strokeStyle = COLORS.edge;
  ctx.lineWidth = Math.max(1, getNodeRadius() * 0.12);

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

function draw(highlight = {}) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!root) return;

  assignPositions();
  drawEdges(root);

  (function dfs(n) {
    if (!n) return;
    dfs(n.left);
    drawNode(n, highlight[n.id] || COLORS.normal);
    dfs(n.right);
  })(root);
}

/* ---------- Insert ---------- */
async function insertNode() {
  const v = parseInt(value.value);
  if (isNaN(v)) return;

  explainText(`Inserting ${v}`);

  if (!root) {
    root = new Node(v);
    draw();
    return;
  }

  let cur = root;
  while (true) {
    draw({ [cur.id]: COLORS.highlight });
    await sleep(delay());

    if (v === cur.value) {
      explainText("Duplicate value not allowed");
      draw({ [cur.id]: COLORS.notfound });
      await sleep(delay());
      draw();
      return;
    }

    if (v < cur.value) {
      if (!cur.left) {
        cur.left = new Node(v);
        break;
      }
      cur = cur.left;
    } else {
      if (!cur.right) {
        cur.right = new Node(v);
        break;
      }
      cur = cur.right;
    }
  }
  draw();
}

/* ---------- Search ---------- */
async function searchNode() {
  const v = parseInt(value.value);
  if (isNaN(v)) return;

  explainText(`Searching ${v}`);
  let cur = root;

  while (cur) {
    draw({ [cur.id]: COLORS.highlight });
    await sleep(delay());

    if (cur.value === v) {
      explainText(`Value ${v} found`);
      draw({ [cur.id]: COLORS.found });
      await sleep(delay());
      draw();
      return;
    }
    cur = v < cur.value ? cur.left : cur.right;
  }

  explainText("Value not found");
}

async function playDeleteSteps() {
  for (let step of deleteSteps) {
    explainText(step.text);
    draw(step.highlight || {});
    await sleep(delay());

    if (step.action) step.action();
  }
  deleteSteps = [];
  draw();
}

/* ---------- Delete ---------- */
async function deleteNode() {
  const v = parseInt(value.value);
  if (isNaN(v)) return;

  deleteSteps = [];
  root = deleteRecVisual(root, v);
  await playDeleteSteps();
}

function deleteRecVisual(node, v) {
  if (!node) return null;

  if (v < node.value) {
    node.left = deleteRecVisual(node.left, v);
  } 
  else if (v > node.value) {
    node.right = deleteRecVisual(node.right, v);
  } 
  else {
    deleteSteps.push({
      highlight: { [node.id]: COLORS.delete },
      text: `Found node ${node.value} to delete`
    });

    if (!node.left && !node.right) {
      deleteSteps.push({
        text: "Node is a leaf. Removing it.",
        action: () => {}
      });
      return null;
    }

    if (!node.left || !node.right) {
      const child = node.left || node.right;
      deleteSteps.push({
        highlight: {
          [node.id]: COLORS.delete,
          [child.id]: COLORS.promote
        },
        text: `Node has one child. Promoting ${child.value}`
      });
      return child;
    }

    let succ = node.right;
    while (succ.left) succ = succ.left;

    deleteSteps.push({
      highlight: {
        [node.id]: COLORS.delete,
        [succ.id]: COLORS.successor
      },
      text: `Inorder successor is ${succ.value}`
    });

    deleteSteps.push({
      text: `Replacing ${node.value} with ${succ.value}`,
      action: () => { node.value = succ.value; }
    });

    node.right = deleteRecVisual(node.right, succ.value);
  }
  return node;
}

draw();
window.addEventListener("resize", draw);

function resetTree() {
  root = null;
  explainText("Tree reset");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  highlightedNode = null;
  animationQueue = [];
}

function goHome() {
      window.location.href = "/";
    }
    function goRead() {
      window.location.href = "/read/graphtraversal"; 
}