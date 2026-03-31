const container = document.getElementById("linkedlist-container");
let linkedList = [];
const delay = ms => new Promise(res => setTimeout(res, ms));

function explainText(msg) {
    document.getElementById("explain-text").innerText = msg;
}

function render(highlightIndex = null, className = "") {
  container.innerHTML = "";

  linkedList.forEach((val, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "node-wrapper";

    const node = document.createElement("div");
    node.className = "node";
    node.textContent = val;

    if (index === highlightIndex) node.classList.add(className);

    wrapper.appendChild(node);

    if (index < linkedList.length - 1) {
      const arrow = document.createElement("div");
      arrow.className = "arrow";
      arrow.innerHTML = "→";
      wrapper.appendChild(arrow);
    }

    container.appendChild(wrapper);
  });
  if (linkedList.length > 0) {
    const nullWrap = document.createElement("div");
    nullWrap.className = "node-wrapper";

    const nullNode = document.createElement("div");
    nullNode.className = "node null-node";
    nullNode.innerText = "NULL";

    nullWrap.appendChild(nullNode);
    container.appendChild(nullWrap);
  }
}

/* ---------------------------- INSERT ---------------------------- */
async function insertAtBeginning() {
  const val = value.value;
  if (val === "") return explainText("Enter value");

  linkedList.unshift(val);
  render(0, "inserted");
  explainText(`Inserted ${val} at the beginning`);
}

async function insertAtEnd() {
  const val = value.value;
  if (val === "") return explainText("Enter value");

  linkedList.push(val);
  render(linkedList.length - 1, "inserted");
  explainText(`Inserted ${val} at the end`);
}

async function insertAtPosition() {
  const val = value.value;
  const pos = parseInt(position.value);

  if (val === "" || isNaN(pos)) return explainText("Enter value & position");
  if (pos < 1 || pos > linkedList.length + 1) return explainText("Invalid position");

  if (pos === 1) {
    linkedList.unshift(val);
    render(0, "inserted");
    explainText(`Inserted ${val} at position 1`);
    return;
  }

  for (let i = 0; i < pos - 1; i++) {
    render(i, "active");
    await delay(600);
  }

  explainText("Inserting node and updating pointers");

  linkedList.splice(pos - 1, 0, val);
  render(pos - 1, "inserted");
  explainText(`Inserted ${val} at position ${pos}`);
}

/* ---------------------------- DELETE ---------------------------- */
async function deleteFromBeginning() {
  if (!linkedList.length) return explainText("List empty");

  render(0, "deleted");
  explainText(`Deleting node ${linkedList[0]} from beginning`);
  await delay(600);
  linkedList.shift();
  render();
}

async function deleteFromEnd() {
  if (linkedList.length === 0) {
    return explainText("List is empty");
  }

  if (linkedList.length === 1) {
    render(0, "deleted");
    await delay(800);
    linkedList.pop();
    render();
    return;
  }

  
  for (let i = 0; i < linkedList.length - 1; i++) {
    render(i, "active"); 
    await delay(600);
  }

  render(linkedList.length - 1, "deleted");
  explainText(`Deleting node ${linkedList[linkedList.length - 1]} from end`);
  await delay(800);

  linkedList.pop();
  render();
}

async function deleteFromPosition() {
  const pos = parseInt(position.value);
  if (isNaN(pos)) return explainText("Enter position");
  if (pos < 1 || pos > linkedList.length) return explainText("Invalid position");

  for (let i = 0; i < pos - 1; i++) {
    render(i, "active");
    await delay(600);
  }

  render(pos - 1, "deleted");
  explainText(`Deleting node ${linkedList[pos - 1]} at position ${pos}`);
  await delay(600);
  linkedList.splice(pos - 1, 1);
  render();
}

/* ---------------------------- REVERSE ---------------------------- */
async function reverseList() {
  let prev = null;
  let curr = 0;

  while (curr < linkedList.length) {
    render(curr, "active"); 
    await delay(600);

    if (prev !== null) {
      render(prev, "inserted"); 
      await delay(400);
    }

    prev = curr;
    curr++;
  }

  explainText("Reversing links");

  linkedList.reverse();
  render();
  explainText("Linked list reversed");
}

function showMessage(msg) {
  const box = document.createElement("div");
  box.innerText = msg;
  box.style.position = "fixed";
  box.style.bottom = "20px";
  box.style.right = "20px";
  box.style.background = "#1f1f1f";
  box.style.border = "2px solid #00ffff";
  box.style.padding = "10px";
  box.style.borderRadius = "8px";
  document.body.appendChild(box);

  setTimeout(() => box.remove(), 2000);
}

function goHome() {
  window.location.href = "/";
}

function goRead() {
  window.location.href = "/read/linkedlist";
}
