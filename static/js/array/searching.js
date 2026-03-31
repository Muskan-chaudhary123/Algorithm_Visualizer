let array = [];
let currentIndex = 0;
let comparisons = 0;
let isSearching = false;
let searchInterval = null;

const searchDescriptions = {
      linear: "Linear Search checks each element one by one until it finds the target.",
      binary: "Binary Search repeatedly divides a sorted array in half to find the target."
    };

    let currentArray = [];
    let comparisonCount = 0;

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    function visualizeBoxes(arr, highlight = -1, found = -1, low = -1, high = -1) {
      const container = document.getElementById("array-container");
      container.innerHTML = "";

      arr.forEach((val, i) => {
        const bar = document.createElement("div");
        bar.className = "bar";
        bar.innerText = val;

        if (i === found) {
          bar.style.backgroundColor = "green";
        } else if (i === highlight) {
          bar.style.backgroundColor = "orange";
        } else if (i >= low && i <= high && low !== -1) {
          bar.style.backgroundColor = "#ddd";
        }

        container.appendChild(bar);
      });

      document.getElementById("comparison-count").innerText = ` Comparisons: ${comparisonCount}`;
    }

    async function linearSearch(arr, value) {
      comparisonCount = 0;
      for (let i = 0; i < arr.length; i++) {
        comparisonCount++;
        visualizeBoxes(arr, i);
        await sleep(300);
        if (arr[i] === value) {
          visualizeBoxes(arr, -1, i);
          return;
        }
      }
      alert("Value not found!");
    }

    async function binarySearch(arr, value) {
      comparisonCount = 0;
      arr.sort((a, b) => a - b);
      let low = 0, high = arr.length - 1;

      while (low <= high) {
        comparisonCount++;
        const mid = Math.floor((low + high) / 2);
        visualizeBoxes(arr, mid, -1, low, high);
        await sleep(500);

        if (arr[mid] === value) {
          visualizeBoxes(arr, -1, mid);
          return;
        } else if (arr[mid] < value) {
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      alert("Value not found!");
    }

    function updateSearchInfo(algo) {
      if (currentArray.length > 0) {
        document.getElementById("search-info").innerText = searchDescriptions[algo];
      }
    }

    function useUserArray() {
      const input = document.getElementById("user-array").value.trim();
      if (!input) { alert("Please enter a valid array."); return; }

      const values = input.split(",").map(x => parseInt(x.trim())).filter(x => !isNaN(x));
      if (values.length < 2) {
        alert("Please enter at least two valid numbers.");
        return;
      }

      currentArray = values;
      visualizeBoxes(currentArray);
      document.getElementById("comparison-count").innerText = "";
      updateSearchInfo(document.getElementById("search-algo").value);

      document.getElementById("start-search-button").disabled = false; // enable Start button
    }

    async function startSearch() {
      const algo = document.getElementById("search-algo").value;
      const value = parseInt(document.getElementById("search-value").value);

      if (isNaN(value)) {
        alert("Please enter a valid number to search.");
        return;
      }

      if (currentArray.length < 2) {
        alert("Please enter an array first.");
        return;
      }

      updateSearchInfo(algo);

      if (algo === "linear") {
        await linearSearch([...currentArray], value);
      } else if (algo === "binary") {
        await binarySearch([...currentArray], value);
      }
    }


function resetVisualizer() {

  document.getElementById("array-container").innerHTML = "";
  document.getElementById("search-info").innerHTML = "";
  document.getElementById("comparison-count").innerHTML = "";
 
  document.getElementById("user-array").value = "";
  document.getElementById("search-value").value = "";
  document.getElementById("search-algo").selectedIndex = 0;

  document.getElementById("start-search-button").disabled = true;

  array = [];
  currentIndex = 0;
  comparisons = 0;
  isSearching = false;

  if (searchInterval) {
    clearInterval(searchInterval);
    searchInterval = null;
  }
}

function goHome() {
      window.location.href = "/";
    }

    function goRead() {
      window.location.href = "/read/search"; // replace with your actual route for reading file
}