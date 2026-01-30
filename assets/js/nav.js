const toggle = document.querySelector("nav button");
const menu = document.querySelector("nav ul");

toggle?.addEventListener("click", () => {
  menu.classList.toggle("open");
});
