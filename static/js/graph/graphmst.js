const canvas = document.getElementById("graph-canvas");
const ctx = canvas.getContext("2d");

let nodes = [];
let edges = [];
let adjacencyList = {};

const NODE_RADIUS = 20;
const GRID_SIZE = 40;

let startNode = null;
let isDragging = false;
let mouseX = 0;
let mouseY = 0;

let mstState = {
  running: false,
  algo: null,
  visited: new Set(),
  mstEdges: [],
  rejectedEdges: [],
  currentEdge: null,
  parent: [],
  sortedEdges: [],
  edgeIndex: 0,
  cost: 0
};

function resetMSTState() {
  mstState.running = false;
  mstState.visited.clear();
  mstState.mstEdges = [];
  mstState.rejectedEdges = [];
  mstState.currentEdge = null;
  mstState.parent = [];
  mstState.sortedEdges = [];
  mstState.edgeIndex = 0;
  mstState.cost = 0;
}

function snap(val) {
  return Math.round(val / GRID_SIZE) * GRID_SIZE;
}

function drawGrid() {
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 1;

  for (let x = 0; x <= canvas.width; x += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y <= canvas.height; y += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  const { x, y } = getMousePos(e);
  const node = getNodeAt(x, y);
  if (node) deleteNode(node.id);
});

canvas.addEventListener("mousedown", (e) => {
  const { x, y } = getMousePos(e);
  const node = getNodeAt(x, y);

  if (node) {
    startNode = node;
    isDragging = true;
  } else {
    addNodeAt(x, y);
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (!isDragging || !startNode) return;
  const pos = getMousePos(e);
  mouseX = pos.x;
  mouseY = pos.y;
  drawGraph();
});

canvas.addEventListener("mouseup", (e) => {
  if (!isDragging || !startNode) return;

  const { x, y } = getMousePos(e);
  const endNode = getNodeAt(x, y);

  if (endNode && endNode.id !== startNode.id) {
    const weight = parseInt(prompt("Enter edge weight:"));
    if (!isNaN(weight)) {
      createEdge(startNode.id, endNode.id, weight);
    }
  }

  startNode = null;
  isDragging = false;
  drawGraph();
});

function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

function getNodeAt(x, y) {
  return nodes.find(n => Math.hypot(x - n.x, y - n.y) <= NODE_RADIUS);
}

function addNodeAt(x, y) {
  const id = nodes.length;
  nodes.push({ id, x: snap(x), y: snap(y) });
  adjacencyList[id] = [];
  drawGraph();
}

function createEdge(from, to, weight) {
  if (edges.some(e =>
    (e.from === from && e.to === to) ||
    (e.from === to && e.to === from)
  )) return;

  edges.push({ from, to, weight });
  adjacencyList[from].push({ to, weight });
  adjacencyList[to].push({ to: from, weight });
  drawGraph();
}

function drawGraph() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();


  edges.forEach(edge => {
    const from = nodes[edge.from];
    const to = nodes[edge.to];

    let color = "#ffffff";

    if (mstState.currentEdge &&
        edge.from === mstState.currentEdge.from &&
        edge.to === mstState.currentEdge.to)
      color = "yellow";

    if (mstState.mstEdges.some(e =>
        (e.from === edge.from && e.to === edge.to) ||
        (e.from === edge.to && e.to === edge.from)))
      color = "red";

    if (mstState.rejectedEdges.some(e =>
        (e.from === edge.from && e.to === edge.to) ||
        (e.from === edge.to && e.to === edge.from)))
      color = "gray";

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "yellow";
    ctx.font = "14px Arial";
    ctx.fillText(edge.weight, (from.x + to.x)/2, (from.y + to.y)/2 - 5);
  });

  if (isDragging && startNode) {
    ctx.setLineDash([5,5]);
    ctx.beginPath();
    ctx.moveTo(startNode.x, startNode.y);
    ctx.lineTo(mouseX, mouseY);
    ctx.strokeStyle = "#ff8800";
    ctx.stroke();
    ctx.setLineDash([]);
  }

  nodes.forEach(node => {
    let color = "#ffff";

    if (mstState.visited.has(node.id))
      color = "green";

    if (mstState.mstEdges.some(e =>
        e.from === node.id || e.to === node.id))
      color = "yellow";

    ctx.beginPath();
    ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI*2);
    ctx.fillStyle = color;

    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.stroke();

    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node.id, node.x, node.y);
  });
}

function deleteNode(id) {
  nodes = nodes.filter(n => n.id !== id);
  edges = edges.filter(e => e.from !== id && e.to !== id);

  nodes.forEach((n,i)=> n.id=i);

  edges.forEach(e=>{
    if (e.from>id) e.from--;
    if (e.to>id) e.to--;
  });

  adjacencyList = {};
  nodes.forEach(n=> adjacencyList[n.id]=[]);
  edges.forEach(e=>{
    adjacencyList[e.from].push({to:e.to,weight:e.weight});
    adjacencyList[e.to].push({to:e.from,weight:e.weight});
  });

  drawGraph();
}

function resetGraph() {
  nodes = [];
  edges = [];
  adjacencyList = {};
  startNode = null;
  isDragging = false;
  resetMSTState();

  document.getElementById("mst-cost").innerText = 0;
  drawGraph();
}

function startStepMode() {
  const algo = document.getElementById("algorithm").value;
  if (!algo) return;

  resetMSTState();
  mstState.algo = algo;
  mstState.running = true;

  if (algo === "prim") {
    mstState.visited.add(0);
  }

  if (algo === "kruskal") {
    mstState.sortedEdges = [...edges].sort((a,b)=>a.weight-b.weight);
    mstState.parent = Array(nodes.length).fill(0).map((_,i)=>i);
  }

  drawGraph();
}

function nextStep() {
  if (!mstState.running) return;

  if (mstState.algo === "prim") nextPrim();
  else nextKruskal();
}

function nextPrim() {
  let candidates = [];

  mstState.visited.forEach(v=>{
    adjacencyList[v].forEach(e=>{
      if (!mstState.visited.has(e.to))
        candidates.push({from:v,to:e.to,weight:e.weight});
    });
  });

  if (!candidates.length) return;

  candidates.sort((a,b)=>a.weight-b.weight);
  const edge = candidates[0];
  mstState.currentEdge = edge;

  mstState.visited.add(edge.to);
  mstState.mstEdges.push(edge);
  mstState.cost += edge.weight;

  document.getElementById("mst-cost").innerText = mstState.cost;
  drawGraph();
}


function find(u){
  if (mstState.parent[u]===u) return u;
  return mstState.parent[u]=find(mstState.parent[u]);
}

function union(u,v){
  const pu=find(u), pv=find(v);
  if (pu===pv) return false;
  mstState.parent[pu]=pv;
  return true;
}

function nextKruskal() {
  if (mstState.edgeIndex >= mstState.sortedEdges.length) return;

  const edge = mstState.sortedEdges[mstState.edgeIndex++];
  mstState.currentEdge = edge;

  if (union(edge.from, edge.to)) {
    mstState.mstEdges.push(edge);
    mstState.cost += edge.weight;
  } else {
    mstState.rejectedEdges.push(edge);
  }

  document.getElementById("mst-cost").innerText = mstState.cost;
  drawGraph();
}

function goHome(){ window.location.href="/"; }
function goRead(){ window.location.href="/read/mst"; }

function showInstructions() {
    const msg = document.createElement("div");
    msg.innerHTML = `
        *  Left Click → Add Node <br>
        * Right Click → Delete Node <br>
        * Drag Nodes → Create Edge <br><br>
        
    `;

    msg.style.position = "fixed";
    msg.style.top = "20px";
    msg.style.right = "20px";
    msg.style.padding = "12px 18px";
    msg.style.background = "rgba(106, 134, 177, 0.8)";
    msg.style.color = "#fff";
    msg.style.borderRadius = "10px";
    msg.style.zIndex = "1000";
    msg.style.fontSize = "16px";

    document.body.appendChild(msg);

    setTimeout(() => {
        msg.remove();
    }, 5000); 
}

showInstructions();