window.gallery = {
  name: 'gallery',
  props: {
    images: Array,
    page: {
      type: Number,
      default: 1
    },
    highlightIndex: {
      type: Number,
      default: -1
    }
  },
  emits: ['update:page', 'start-screensaver'],
  computed: {
    totalPages() {
      return Math.ceil(this.images.length / PAGE_SIZE);
    },
    pageImages() {
      const start = (this.page - 1) * PAGE_SIZE;
      const end = Math.min(start + PAGE_SIZE, this.images.length);
      return this.images.slice(start, end);
    },
    pageNumbers() {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }
  },
  watch: {
    page(newPage) {
      // When parent changes page, update internal page
      this.internalPage = newPage;
    }
  },
  data() {
    return {
      internalPage: this.page,
      _lgInstance: null,
      _lgAfterOpenHandler: null
    };
  },
  methods: {
    setPage(newPage) {
      this.internalPage = newPage;
      this.$emit('update:page', newPage);
    },
    shouldShowPageNumber(num) {
      // Always show first and last pages
      if (num === 1 || num === this.totalPages) return true;
      // Always show current page and one page before and after
      if (Math.abs(this.internalPage - num) <= 1) return true;
      return false;
    },
    shouldShowEllipsis(num) {
      // Show ellipsis if there's a gap in sequence
      if (num === 1 || num === this.totalPages) return false;
      return !this.shouldShowPageNumber(num) && 
             (this.shouldShowPageNumber(num - 1) || this.shouldShowPageNumber(num + 1));
    },
    initLightGallery() {
      if (this._lgInstance && typeof this._lgInstance.destroy === 'function') {
        this._lgInstance.destroy();
        this._lgInstance = null;
      }
      
      // Remove old event listener if it exists
      const galleryEl = this.$el.querySelector('#gallery');
      if (this._lgAfterOpenHandler && galleryEl) {
        galleryEl.removeEventListener('lgAfterOpen', this._lgAfterOpenHandler);
      }
      
      if (galleryEl && window.lightGallery) {
        const self = this;
        const plugins = [lgZoom];
        // Add fullscreen plugin if available
        if (typeof lgFullscreen !== 'undefined') {
          plugins.push(lgFullscreen);
        }
        
        this._lgInstance = window.lightGallery(galleryEl, {
          selector: '.gallery-item',
          plugins: plugins,
          licenseKey: '0000-0000-000-0000',
          fullScreen: true,
          speed: 250,
          preload: 2,
          backdropDuration: 200,
          mode: 'lg-slide',
          easing: 'ease',
          download: false,
          closeOnTap: true,
          startAnimationDuration: 200,
          enableSwipe: true,
          enableDrag: true,
          swipeToClose: true,
          thumbnail: false,
          zoomFromOrigin: false,
          addClass: 'lg-mobile-optimized',
          allowMediaOverlap: true,
          preloadHeight: window.innerHeight,
          preloadAfterLoad: true,
          getCaptionFromTitleOrAlt: false,
          loadOnlyVisible: true,
          showAfterLoad: false,
          hideControlOnEnd: true,
          hideBarsDelay: 3000,
          controls: true,
          mobileSettings: {
            controls: true,
            showCloseIcon: true,
            download: false,
            rotate: false
          },
          appendSubHtmlTo: '.lg-item'
        });
        
        // Add screensaver button by listening on gallery element
        this._lgAfterOpenHandler = function() {
          setTimeout(function() {
            const toolbar = document.querySelector('.lg-toolbar');
            if (toolbar) {
              // Remove old button if it exists
              const oldBtn = toolbar.querySelector('.lg-screensaver');
              if (oldBtn) {
                oldBtn.remove();
              }
              
              // Add new button
              const btn = document.createElement('button');
              btn.type = 'button';
              btn.className = 'lg-icon lg-screensaver';
              btn.setAttribute('aria-label', 'Start Screensaver');
              btn.title = 'Start Screensaver from here';
              btn.innerHTML = '▶';
              toolbar.appendChild(btn);
              
              btn.addEventListener('click', function() {
                const currentIndex = self._lgInstance.index;
                const imagePath = self.pageImages[currentIndex];
                self._lgInstance.closeGallery();
                self.$emit('start-screensaver', imagePath);
              });
            }
          }, 50);
        };
        
        galleryEl.addEventListener('lgAfterOpen', this._lgAfterOpenHandler);
      }
    },
    cleanupLightGallery() {
      const galleryEl = this.$el?.querySelector('#gallery');
      if (this._lgAfterOpenHandler && galleryEl) {
        galleryEl.removeEventListener('lgAfterOpen', this._lgAfterOpenHandler);
        this._lgAfterOpenHandler = null;
      }
      if (this._lgInstance && typeof this._lgInstance.destroy === 'function') {
        this._lgInstance.destroy();
        this._lgInstance = null;
      }
    }
  },
  mounted() { this.initLightGallery(); },
  updated() { this.initLightGallery(); },
  beforeUnmount() { this.cleanupLightGallery(); },
  template: `
    <div class="gallery-container">
      <div class="gallery-grid" id="gallery">
        <a
          v-for="(path, idx) in pageImages"
          :key="idx"
          :href="'images/' + path"
          class="gallery-item"
          :data-src="'images/' + path"
          :data-responsive="'images/' + path"
          :data-sub-html="path"
        >
          <div class="card gallery-card" :class="{ 'highlight-card': idx === highlightIndex }">
            <img 
              :src="'images/' + path" 
              class="card-img-top" 
              :alt="path"
              loading="lazy"
              decoding="async"
            >
            <div class="gallery-card-overlay">
              <span class="gallery-card-icon">⊕</span>
            </div>
          </div>
        </a>
      </div>
      <nav id="pagination" aria-label="Gallery page navigation" v-if="totalPages > 1">
        <ul class="pagination">
          <li class="page-item" :class="{disabled: internalPage === 1}">
            <button class="page-link" @click="internalPage > 1 && setPage(internalPage - 1)" :disabled="internalPage === 1" aria-label="Previous page">
              <span aria-hidden="true">←</span>
            </button>
          </li>
          <template v-for="num in pageNumbers" :key="num">
            <li v-if="shouldShowPageNumber(num)" class="page-item" :class="{active: num === internalPage}">
              <button class="page-link" @click="setPage(num)">{{ num }}</button>
            </li>
            <li v-else-if="shouldShowEllipsis(num)" class="page-item disabled" key="ellipsis">
              <span class="page-link">...</span>
            </li>
          </template>
          <li class="page-item" :class="{disabled: internalPage === totalPages}">
            <button class="page-link" @click="internalPage < totalPages && setPage(internalPage + 1)" :disabled="internalPage === totalPages" aria-label="Next page">
              <span aria-hidden="true">→</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  `
};