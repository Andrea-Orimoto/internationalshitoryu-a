fetch("./data/photos.json")
  .then(res => res.json())
  .then(items => {
    const container = document.getElementById("gallery");
    items.forEach(item => {
      const figure = document.createElement("figure");
      figure.innerHTML = `
        <img src="${item.image}" alt="${item.title}" loading="lazy">
        <figcaption>${item.caption}</figcaption>
      `;
      container.appendChild(figure);
    });
  });
