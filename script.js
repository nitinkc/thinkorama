fetch('images.json')
  .then(response => response.json())
  .then(images => {
    const gallery = document.getElementById('gallery');
    images.forEach(path => {
      const fullPath = 'images/' + path;
      const col = document.createElement('div');
      col.className = 'col-md-3 mb-4';
      col.innerHTML = `
        <div class="card">
          <a href="${fullPath}" target="_blank">
            <img src="${fullPath}" class="card-img-top" alt="${path}">
          </a>
        </div>`;
      gallery.appendChild(col);
    });

    document.getElementById('startScreensaver').addEventListener('click', () => {
      document.body.innerHTML = '<div id="screensaver"></div>';
      const container = document.getElementById('screensaver');
      let index = 0;

      // Shuffle images for random order
      const shuffled = images.slice().sort(() => Math.random() - 0.5);

      function showImage() {
        const img = document.createElement('img');
        img.src = 'images/' + shuffled[index];
        container.innerHTML = '';
        container.appendChild(img);
        index = (index + 1) % shuffled.length;
      }

      showImage();

      // Change image every 3 seconds
      const intervalId = setInterval(showImage, 900000);

      // Optional: stop screensaver on click (remove interval)
      container.addEventListener('click', () => {
        clearInterval(intervalId);
        // Optionally, reload the page or restore the gallery here
        window.location.reload(); // This will reload the page and restore the gallery
      });
    });
  });
