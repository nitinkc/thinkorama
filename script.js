fetch('images.json')
    .then(response => response.json())
    .then(images => {
      const gallery = document.getElementById('gallery');
      images.forEach(path => {
        const fullPath = 'images/' + path;
        const img = document.createElement('img');
        img.src = fullPath;
        img.alt = path;
        const link = document.createElement('a');
        link.href = fullPath;
        link.target = '_blank';
        link.appendChild(img);
        gallery.appendChild(link);
      });
    });