const button = document.querySelector("nav button");
const menu = document.querySelector("nav ul");

if (button && menu) {
  button.addEventListener("click", () => {
    menu.classList.toggle("open");
  });
}
