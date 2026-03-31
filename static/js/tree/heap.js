let heap = [];

const COLORS = {
  normal: "#00a86b",
  highlight: "#ffcc33",
  found: "#66cc66",
  notfound: "#ff6666",
  edge: "#ffffff",
  text: "#ffffff"
};

const svg = document.getElementById("heap");
const explain = document.getElementById("explain");
const valueInput = document.getElementById("value");
const container = svg.parentElement;

const PADDING = 20;
const MIN_RADIUS = 6;
const MAX_RADIUS = 30;
let NODE_RADIUS = MAX_RADIUS;
let LEVEL_GAP = NODE_RADIUS * 3;

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function delay() { return Number(document.getElementById("speed").value); }
function isMax() { return document.getElementById("type").value === "max"; }
function compare(a, b) { return isMax() ? a.value > b.value : a.value < b.value; }
function explainText(text) { 
  explain.innerHTML = text; 
  explain.style.color = "red";
  explain.style.fontSize = "20px"
}

function updateNodeSize() {
  if (!container) return;
  const maxWidth = container.clientWidth - 2 * PADDING;
  const depth = Math.floor(Math.log2(heap.length)) + 1 || 1;
  let nodesAtMaxLevel = Math.pow(2, depth - 1);

  let radius = maxWidth / (nodesAtMaxLevel * 3); 
  NODE_RADIUS = Math.min(MAX_RADIUS, Math.max(MIN_RADIUS, radius));
  LEVEL_GAP = NODE_RADIUS * 3;
}

async function insert() {
  const v = Number(valueInput.value);
  if (isNaN(v)) return;
  heap.push({ value: v, color: COLORS.normal });
  explainText(`Inserted ${v} at the end`);
  draw();
  await sleep(delay());
  await heapifyUp(heap.length - 1);
}

async function handleTypeChange() {
  if (heap.length === 0) return;

  explainText("Changing heap type... Rebuilding heap");

  await sleep(delay());

  await rebuildHeap();
}

async function rebuildHeap() {
  explainText("Rebuilding heap from scratch...");

  const values = heap.map(node => node.value);

  heap = [];
  draw();
  await sleep(delay());

  for (let v of values) {
    heap.push({ value: v, color: COLORS.normal });
    draw();

    explainText(`Inserting ${v} into new ${isMax() ? "Max" : "Min"} Heap`);
    await sleep(delay());

    await heapifyUp(heap.length - 1);
  }

  explainText("Heap successfully converted!");
}

// ---------- HEAPIFY UP ----------
async function heapifyUp(i) {
  while (i > 0) {
    const parent = Math.floor((i - 1) / 2);
    highlight(i, parent);
    explainText(`Comparing ${heap[i].value} with parent ${heap[parent].value}`);
    await sleep(delay());
    if (compare(heap[i], heap[parent])) {
      [heap[i], heap[parent]] = [heap[parent], heap[i]];
      draw();
      await sleep(delay());
      i = parent;
    } else break;
  }
  clearHighlight();
}

// ---------- EXTRACT ROOT ----------
async function extract() {
  if (heap.length === 0) { explainText("Heap is empty"); return; }
  const rootValue = heap[0].value;
  explainText(`Extracted root: ${rootValue}`);
  await sleep(delay());
  if (heap.length === 1) { heap.pop(); draw(); return rootValue; }
  heap[0] = heap.pop();
  draw();
  await sleep(delay());
  await heapifyDown(0);
  return rootValue;
}

// ---------- HEAPIFY DOWN ----------
async function heapifyDown(i) {
  while (true) {
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    let best = i;
    if (left < heap.length && compare(heap[left], heap[best])) best = left;
    if (right < heap.length && compare(heap[right], heap[best])) best = right;
    if (best !== i) {
      highlight(i, best);
      [heap[i], heap[best]] = [heap[best], heap[i]];
      draw();
      await sleep(delay());
      i = best;
    } else break;
  }
  clearHighlight();
}

function pos(i) {
  const level = Math.floor(Math.log2(i + 1));
  const levelStart = Math.pow(2, level) - 1;
  const indexInLevel = i - levelStart;
  const nodesInLevel = Math.pow(2, level);

  const availableWidth = container.clientWidth - 2 * PADDING;
  const gap = availableWidth / nodesInLevel;

  return {
    x: PADDING + gap / 2 + indexInLevel * gap,
    y: NODE_RADIUS + 20 + level * LEVEL_GAP
  };
}

function draw() {
  updateNodeSize();
  if (!svg) return;
  svg.innerHTML = "";
  if (heap.length === 0) return;

  let minX = Infinity, maxX = -Infinity, maxY = 0;
  heap.forEach((_, i) => {
    const { x, y } = pos(i);
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });

  const padding = NODE_RADIUS * 3;
  svg.setAttribute("viewBox", `${minX - padding} 0 ${maxX - minX + padding * 2} ${maxY + padding}`);

  heap.forEach((_, i) => drawEdges(i));
  heap.forEach((node, i) => drawNode(i, node));
}

function drawNode(i, node) {
  const { x, y } = pos(i);
  const r = NODE_RADIUS;

  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", x);
  circle.setAttribute("cy", y);
  circle.setAttribute("r", r);
  circle.setAttribute("fill", node.color);
  svg.appendChild(circle);

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", x);
  text.setAttribute("y", y + (r < 12 ? r + 12 : r * 0.35));
  text.setAttribute("font-size", Math.max(10, r * 0.8));
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("fill", COLORS.text);
  text.textContent = node.value;
  svg.appendChild(text);
}

function drawEdges(i) {
  if (i === 0) return;
  const p = Math.floor((i - 1) / 2);
  const a = pos(p);
  const b = pos(i);

  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", a.x);
  line.setAttribute("y1", a.y);
  line.setAttribute("x2", b.x);
  line.setAttribute("y2", b.y);
  line.setAttribute("stroke", COLORS.edge);
  line.setAttribute("stroke-width", 2);
  svg.appendChild(line);
}

function highlight(i, p) {
  heap.forEach(n => n.color = COLORS.normal);
  heap[i].color = COLORS.highlight;
  heap[p].color = COLORS.found;
  draw();
}

function clearHighlight() {
  heap.forEach(n => n.color = COLORS.normal);
  draw();
}

function resetHeap() {
  heap = [];
  svg.innerHTML = "";
  explainText("Heap reset");
}

window.addEventListener("resize", draw);
draw();

function goHome() {
      window.location.href = "/";
    }
    function goRead() {
      window.location.href = "/read/heap"; 
    }