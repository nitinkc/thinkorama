fetch('images.json')
  .then(response => response.json())
  .then(images => {
    const gallery = document.getElementById('gallery');
    const pageSize = 20; // Images per page
    let currentPage = 1;
    let modal, modalImg;

    // Shuffle ONCE
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }
    const shuffledImages = images.slice();
    shuffleArray(shuffledImages);

    const totalPages = Math.ceil(shuffledImages.length / pageSize);

    // Add this function to set up the modal if not already present
    function setupModal() {
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'imageModal';
        modal.style.cssText = `
          display:none;position:fixed;z-index:9999;top:0;left:0;width:100vw;height:100vh;
          background:rgba(0,0,0,0.85);align-items:center;justify-content:center;
        `;
        modal.innerHTML = `
          <span style="position:absolute;top:20px;right:40px;font-size:2rem;color:#fff;cursor:pointer;" id="closeModal">&times;</span>
          <img id="modalImg" style="max-width:90vw;max-height:90vh;display:block;margin:auto;border-radius:8px;">
        `;
        document.body.appendChild(modal);
        modalImg = document.getElementById('modalImg');
        document.getElementById('closeModal').onclick = () => { modal.style.display = 'none'; };
        modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
      }
    }

    function renderGallery(page) {
      gallery.innerHTML = '';
      setupModal();
      const start = (page - 1) * pageSize;
      const end = Math.min(start + pageSize, shuffledImages.length);
      for (let i = start; i < end; i++) {
        const path = shuffledImages[i];
        const fullPath = 'images/' + path;
        const col = document.createElement('div');
        col.className = 'col-12 col-sm-6 col-md-3 mb-4';
        col.innerHTML = `
          <div class="card">
            <a href="#" class="img-link">
              <img src="${fullPath}" class="card-img-top" alt="${path}">
            </a>
          </div>`;
        // Modal open logic
        col.querySelector('.img-link').onclick = (e) => {
          e.preventDefault();
          modalImg.src = fullPath;
          modal.style.display = 'flex';
        };
        gallery.appendChild(col);
      }
    }

    function renderPagination() {
      let pagination = document.getElementById('pagination');
      if (!pagination) {
        pagination = document.createElement('nav');
        pagination.id = 'pagination';
        pagination.setAttribute('aria-label', 'Gallery page navigation');
        gallery.parentNode.appendChild(pagination);
      }
      pagination.innerHTML = '';

      const ul = document.createElement('ul');
      ul.className = 'pagination justify-content-center';

      // Previous button
      const prevLi = document.createElement('li');
      prevLi.className = `page-item${currentPage === 1 ? ' disabled' : ''}`;
      const prevBtn = document.createElement('button');
      prevBtn.className = 'page-link';
      prevBtn.textContent = 'Previous';
      prevBtn.disabled = currentPage === 1;
      prevBtn.onclick = () => {
        if (currentPage > 1) {
          currentPage--;
          renderGallery(currentPage);
          renderPagination();
        }
      };
      prevLi.appendChild(prevBtn);
      ul.appendChild(prevLi);

      // Page numbers (show up to 5 pages for brevity)
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);
      if (currentPage <= 3) endPage = Math.min(5, totalPages);
      if (currentPage >= totalPages - 2) startPage = Math.max(1, totalPages - 4);

      for (let i = startPage; i <= endPage; i++) {
        const li = document.createElement('li');
        li.className = `page-item${i === currentPage ? ' active' : ''}`;
        const btn = document.createElement('button');
        btn.className = 'page-link';
        btn.textContent = i;
        btn.onclick = () => {
          currentPage = i;
          renderGallery(currentPage);
          renderPagination();
        };
        li.appendChild(btn);
        ul.appendChild(li);
      }

      // Next button
      const nextLi = document.createElement('li');
      nextLi.className = `page-item${currentPage === totalPages ? ' disabled' : ''}`;
      const nextBtn = document.createElement('button');
      nextBtn.className = 'page-link';
      nextBtn.textContent = 'Next';
      nextBtn.disabled = currentPage === totalPages;
      nextBtn.onclick = () => {
        if (currentPage < totalPages) {
          currentPage++;
          renderGallery(currentPage);
          renderPagination();
        }
      };
      nextLi.appendChild(nextBtn);
      ul.appendChild(nextLi);

      pagination.appendChild(ul);
    }

    renderGallery(currentPage);
    renderPagination();

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
