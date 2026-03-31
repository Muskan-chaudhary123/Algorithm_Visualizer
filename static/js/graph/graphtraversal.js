const canvas = document.getElementById("graph-canvas");
const ctx = canvas.getContext("2d");

let nodes = [], edges = [], adj = {};
const NODE_RADIUS = 20, GRID = 40;

let startNode = null, dragging = false, mx = 0, my = 0;

let traversalState = {
  type: null,
  queue: [],
  stack: [],
  visited: new Set(),
  discovered: new Set(),
  current: null,
  parent: {},
  order: [],   
  started: false
};

function snap(v){ return Math.round(v / GRID) * GRID; }

function drawGrid(){
  ctx.strokeStyle = "#222";
  for(let x=0;x<=canvas.width;x+=GRID){
    ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke();
  }
  for(let y=0;y<=canvas.height;y+=GRID){
    ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke();
  }
}

canvas.addEventListener("contextmenu",e=>{
  e.preventDefault();
  const {x,y}=pos(e);
  const n=nodeAt(x,y);
  if(n) deleteNode(n.id);
});

canvas.addEventListener("mousedown",e=>{
  const {x,y}=pos(e);
  const n=nodeAt(x,y);
  if(n){ startNode=n; dragging=true; }
  else addNode(x,y);
});

canvas.addEventListener("mousemove",e=>{
  if(!dragging||!startNode) return;
  const {x,y}=pos(e); mx=x; my=y; draw();
});

canvas.addEventListener("mouseup",e=>{
  if(!dragging||!startNode) return;
  const {x,y}=pos(e);
  const end=nodeAt(x,y);
  if(end && end.id!==startNode.id){
    addEdge(startNode.id,end.id);
  }
  startNode=null; dragging=false; draw();
});

function pos(e){
  const r=canvas.getBoundingClientRect();
  return {x:e.clientX-r.left,y:e.clientY-r.top};
}

function nodeAt(x,y){
  return nodes.find(n=>Math.hypot(x-n.x,y-n.y)<=NODE_RADIUS);
}

function addNode(x,y){
  const id=nodes.length;
  nodes.push({id,x:snap(x),y:snap(y)});
  adj[id]=[];
  draw();
}

function addEdge(from,to){
  if(edges.some(e=>e.from===from&&e.to===to)) return;
  edges.push({from,to});
  adj[from].push(to);
  draw();
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawGrid();

  edges.forEach(e=>{
    const a=nodes[e.from], b=nodes[e.to];

    ctx.beginPath();
    ctx.moveTo(a.x,a.y);
    ctx.lineTo(b.x,b.y);

    if(traversalState.parent[e.to] === e.from){
      ctx.strokeStyle = "#ffff00"; 
    } else {
      ctx.strokeStyle = "#ffffff";
    }

    ctx.lineWidth=2;
    ctx.stroke();
    arrow(a.x,a.y,b.x,b.y);
  });

  if(dragging && startNode){
    ctx.setLineDash([5,5]);
    ctx.beginPath();
    ctx.moveTo(startNode.x,startNode.y);
    ctx.lineTo(mx,my);
    ctx.strokeStyle="#f80";
    ctx.stroke();
    ctx.setLineDash([]);
  }

  nodes.forEach(n=>{
    ctx.beginPath();
    ctx.arc(n.x,n.y,NODE_RADIUS,0,Math.PI*2);

    if(n.id === traversalState.current){
  ctx.fillStyle = "#00ff00"; 
}
else if(traversalState.visited.has(n.id)){
  ctx.fillStyle = "#ffff00"; 
}
else if(traversalState.discovered.has(n.id)){
  ctx.fillStyle = "#ffa500";
}
else{
  ctx.fillStyle = "#00ffff"; 
}
    ctx.fill();
    ctx.strokeStyle="#fff";
    ctx.stroke();

    ctx.fillStyle="#000";
    ctx.font="16px Arial";
    ctx.textAlign="center";
    ctx.textBaseline="middle";
    ctx.fillText(n.id,n.x,n.y);
  });
}

function arrow(x1,y1,x2,y2){
  const h=10, ang=Math.atan2(y2-y1,x2-x1);
  ctx.beginPath();
  ctx.moveTo(x2,y2);
  ctx.lineTo(x2-h*Math.cos(ang-Math.PI/6),y2-h*Math.sin(ang-Math.PI/6));
  ctx.lineTo(x2-h*Math.cos(ang+Math.PI/6),y2-h*Math.sin(ang+Math.PI/6));
  ctx.fillStyle="#fff";
  ctx.fill();
}

function deleteNode(id){
  nodes=nodes.filter(n=>n.id!==id);
  edges=edges.filter(e=>e.from!==id&&e.to!==id);
  adj={};
  nodes.forEach(n=>adj[n.id]=[]);
  edges.forEach(e=>adj[e.from].push(e.to));
  draw();
}

function resetGraph(){
  nodes=[]; edges=[]; adj={};

  traversalState = {
    type: null,
    queue: [],
    stack: [],
    visited: new Set(),
    discovered: new Set(),
    current: null,
    parent: {},
    order: [],
    started: false
  };

  document.getElementById("path-result").innerHTML="";
  document.getElementById("ds-box").innerHTML="";
  document.getElementById("ds-title").innerText="Data Structure";

  draw();
}

function startTraversal(){
  const algo=document.getElementById("algorithm").value;
  const src=parseInt(prompt("Source node:"));

  if(isNaN(src)||!adj[src]) return;

  traversalState = {
    type: algo,
    queue: [],
    stack: [],
    visited: new Set(),
    discovered: new Set(),
    current: null,
    parent: {},
    order: [],   
    started: true
  };

  if(algo==="bfs"){
    traversalState.queue.push(src);
  } else {
    traversalState.stack.push(src);
  }

  traversalState.discovered.add(src);
  updateDSBox(); 
  draw();
}
function nextStep(){
  if(!traversalState.started) return;

  traversalState.current = null;

  if(traversalState.type==="bfs"){
    if(!traversalState.queue.length) return;

    const u = traversalState.queue.shift();

    traversalState.current = u;
    draw();

    setTimeout(() => {
      traversalState.visited.add(u);
      traversalState.order.push(u);

      adj[u].forEach(v=>{
        if(!traversalState.discovered.has(v)){
          traversalState.discovered.add(v);
          traversalState.queue.push(v);
          traversalState.parent[v]=u;
        }
      });

      document.getElementById("path-result").innerHTML =
        `BFS visiting: ${u}`;

      if(traversalState.queue.length === 0){
        document.getElementById("path-result").innerHTML =
          `BFS Order: ` + traversalState.order.join(" → ");
      }

      updateDSBox();
      draw();

    }, 300);
  }

  else { 
    if(!traversalState.stack.length) return;

    const u = traversalState.stack.pop();

    if(traversalState.visited.has(u)){
      draw();
      return;
    }

    traversalState.current = u;
    draw();

    setTimeout(() => {
      traversalState.visited.add(u);
      traversalState.order.push(u);

      [...adj[u]].reverse().forEach(v=>{
        if(!traversalState.discovered.has(v)){
          traversalState.discovered.add(v);
          traversalState.stack.push(v);
          traversalState.parent[v]=u;
        }
      });

      document.getElementById("path-result").innerHTML =
        `DFS visiting: ${u}`;

      if(traversalState.stack.length === 0){
        document.getElementById("path-result").innerHTML =
          `DFS Order: ` + traversalState.order.join(" → ");
      }

      updateDSBox();
      draw();

    }, 300);
  }
}

function goHome() {
  window.location.href = "/";
}

function goRead() {
  window.location.href = "/read/graphtraversal";
}

function updateDSBox(){
  const box = document.getElementById("ds-box");
  const title = document.getElementById("ds-title");

  box.innerHTML = "";

  if(traversalState.type === "bfs"){
    title.innerText = "Queue (BFS)";

    traversalState.queue.forEach(val=>{
      const div = document.createElement("div");
      div.className = "ds-item";
      div.innerText = val;
      box.appendChild(div);
    });
  }

  else if(traversalState.type === "dfs"){
    title.innerText = "Stack (DFS)";

    traversalState.stack.slice().reverse().forEach(val=>{
      const div = document.createElement("div");
      div.className = "ds-item";
      div.innerText = val;
      box.appendChild(div);
    });
  }
}

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