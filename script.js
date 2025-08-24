fetch('images.json')
  .then(response => response.json())
  .then(images => {
    const gallery = document.getElementById('gallery');
    images.forEach(path => {
      const fullPath = 'images/' + path;
      const col = document.createElement('div');
      col.className = 'col-12 col-sm-6 col-md-3 mb-4'; // 1 per row on xs, 2 on sm, 4 on md+
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

      // Request fullscreen
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) { // Safari
        container.webkitRequestFullscreen();
      } else if (container.msRequestFullscreen) { // IE11
        container.msRequestFullscreen();
      }

      let index = 0;

      // Shuffle images for random order
      const shuffled = images.slice().sort(() => Math.random() - 0.5);

      function showImage() {
        const img = document.createElement('img');
        img.src = 'images/' + shuffled[index];
        container.innerHTML = '';
        container.appendChild(img);
      }

      showImage();

      // Change image every 15 minutes
      const intervalId = setInterval(() => {
        index = (index + 1) % shuffled.length;
        showImage();
      }, 900000);

      // Arrow key navigation
      function handleKeydown(e) {
        if (e.key === 'ArrowRight') {
          index = (index + 1) % shuffled.length;
          showImage();
        } else if (e.key === 'ArrowLeft') {
          index = (index - 1 + shuffled.length) % shuffled.length;
          showImage();
        }
      }
      window.addEventListener('keydown', handleKeydown);

      // Stop screensaver on click
      container.addEventListener('click', () => {
        clearInterval(intervalId);
        window.removeEventListener('keydown', handleKeydown);
        window.location.reload();
      });
    });
  });
