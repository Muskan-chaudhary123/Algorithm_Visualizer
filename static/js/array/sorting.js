let isSorting = false;
let stopRequested = false;

const descriptions = {
  bubble: "Bubble Sort repeatedly swaps adjacent elements if they are in wrong order.",
  selection: "Selection Sort selects the minimum element and places it at the correct position.",
  insertion: "Insertion Sort builds the sorted array one item at a time.",
  merge: "Merge Sort divides the array into halves and merges them in sorted order.",
  quick: "Quick Sort selects a pivot and partitions the array around the pivot."
};

let currentArray = [];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getSpeed() {
  return parseInt(document.getElementById("speed").value);
}

function visualizeArray(arr, highlightIndex = -1, swapIndex = -1) {
  document.getElementById("array-display").innerText =
    `Array: [ ${arr.join(", ")} ]`;

  const container = document.getElementById("array-container");
  container.innerHTML = "";

  arr.forEach((val, i) => {
    const bar = document.createElement("div");
    bar.style.height = `${val * 5}px`;
    bar.className = "bar";

    if (i === highlightIndex) bar.style.backgroundColor = "red";
    if (i === swapIndex) bar.style.backgroundColor = "orange";

    container.appendChild(bar);
  });
}

//  ---------------- Sorting Algorithms ----------------
async function bubbleSort(arr) {
  let delay = getSpeed();
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (stopRequested) return;

      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        visualizeArray(arr, j, j + 1);
        await sleep(delay);
      }
    }
  }
}

async function selectionSort(arr) {
  let delay = getSpeed();
  for (let i = 0; i < arr.length; i++) {
    if (stopRequested) return;

    let min = i;
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[min]) min = j;
    }

    if (min !== i) {
      [arr[i], arr[min]] = [arr[min], arr[i]];
      visualizeArray(arr, i, min);
      await sleep(delay);
    }
  }
}

async function insertionSort(arr) {
  let delay = getSpeed();
  for (let i = 1; i < arr.length; i++) {
    if (stopRequested) return;

    let key = arr[i];
    let j = i - 1;

    while (j >= 0 && arr[j] > key) {
      if (stopRequested) return;

      arr[j + 1] = arr[j];
      j--;
      visualizeArray(arr, j + 1);
      await sleep(delay);
    }
    arr[j + 1] = key;
    visualizeArray(arr);
    await sleep(delay);
  }
}

async function mergeSort(arr) {
  let delay = getSpeed();

  async function merge(start, mid, end) {
    let temp = [];
    let i = start, j = mid + 1;

    while (i <= mid && j <= end) {
      if (stopRequested) return;
      temp.push(arr[i] < arr[j] ? arr[i++] : arr[j++]);
    }

    while (i <= mid) temp.push(arr[i++]);
    while (j <= end) temp.push(arr[j++]);

    for (let k = start; k <= end; k++) {
      if (stopRequested) return;
      arr[k] = temp[k - start];
      visualizeArray(arr, k);
      await sleep(delay);
    }
  }

  async function mergeHelper(start, end) {
    if (start >= end || stopRequested) return;
    let mid = Math.floor((start + end) / 2);
    await mergeHelper(start, mid);
    await mergeHelper(mid + 1, end);
    await merge(start, mid, end);
  }

  await mergeHelper(0, arr.length - 1);
}

async function quickSort(arr) {
  let delay = getSpeed();

  async function partition(low, high) {
    let pivot = arr[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      if (stopRequested) return high;

      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        visualizeArray(arr, i, j);
        await sleep(delay);
      }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    visualizeArray(arr, i + 1, high);
    await sleep(delay);
    return i + 1;
  }

  async function quickHelper(low, high) {
    if (low < high && !stopRequested) {
      let pi = await partition(low, high);
      await quickHelper(low, pi - 1);
      await quickHelper(pi + 1, high);
    }
  }

  await quickHelper(0, arr.length - 1);
}

function useUserArray() {
  const input = document.getElementById("custom-array").value.trim();
  if (!input) return alert("Enter a valid array");

  const arr = input.split(",").map(Number);
  if (arr.some(isNaN)) return alert("Invalid numbers");

  currentArray = arr;
  visualizeArray(arr);
  document.getElementById("start-button").disabled = false;
}

async function startSorting() {
  if (isSorting) return;

  const algo = document.getElementById("sort-algo").value;
  if (!algo || currentArray.length < 2) return;

  stopRequested = false;
  isSorting = true;

  document.getElementById("algo-info").innerText = descriptions[algo];
  const copy = [...currentArray];

  if (algo === "bubble") await bubbleSort(copy);
  else if (algo === "selection") await selectionSort(copy);
  else if (algo === "insertion") await insertionSort(copy);
  else if (algo === "merge") await mergeSort(copy);
  else if (algo === "quick") await quickSort(copy);

  isSorting = false;
}

function resetSortingVisualizer() {
  stopRequested = true;
  isSorting = false;
  currentArray = [];

  document.getElementById("array-container").innerHTML =
    "<p style='color:white;'>Please enter an array and click 'Visualize'.</p>";
  document.getElementById("array-display").innerText = "";
  document.getElementById("algo-info").innerText = "";

  document.getElementById("custom-array").value = "";
  document.getElementById("sort-algo").selectedIndex = 0;
  document.getElementById("start-button").disabled = true;
}

function goHome() {
      window.location.href = "/";
    }
    function goRead() {
      window.location.href = "/read/sort"; 
}
