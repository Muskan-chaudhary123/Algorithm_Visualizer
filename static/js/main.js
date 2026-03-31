function redirectToCategory() {
  const category = document.getElementById("category").value;
  if (category) {
    window.location.href = "/" + category;
  }
}
