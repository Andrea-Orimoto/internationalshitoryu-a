async function loadPhotos() {
    const res = await fetch('/data/photos.json');
    return res.json();
}

async function renderPhotoAlbums() {
    const data = await loadPhotos();
    const container = document.getElementById('albums');

    data.albums
        .sort((a, b) => (b.year || 0) - (a.year || 0))
        .forEach(album => {
            const cover = album.images[0];
            container.insertAdjacentHTML('beforeend', `
      <a class="album-card" href="/photos/album.html?id=${album.id}">
        <img src="${cover}" loading="lazy" alt="${album.title}">
        <h3>${album.title}</h3>
      </a>
    `);
        });

}

async function renderPhotoAlbum() {
    const id = new URLSearchParams(location.search).get('id');
    const data = await loadPhotos();
    const album = data.albums.find(a => a.id === id);

    if (!album) return;

    document.title = `${album.title} | Photo Gallery`;
    document.getElementById('album-title').textContent = album.title;

    const gallery = document.getElementById('gallery');

    album.images.forEach(img => {
        gallery.insertAdjacentHTML('beforeend', `
      <a href="${img}" class="glightbox" data-gallery="gallery">
        <img src="${img}" loading="lazy" alt="">
      </a>
    `);
    });

    GLightbox({ selector: '.glightbox' });
}
