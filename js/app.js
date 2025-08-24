const PAGE_SIZE = 21;

const Gallery = {
  props: ['images'],
  data() {
    return {
      page: 1
    };
  },
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
  mounted() {
    this.initLightGallery();
  },
  updated() {
    this.initLightGallery();
  },
  methods: {
    initLightGallery() {
      // Properly destroy previous instance if it exists
      if (this._lgInstance && typeof this._lgInstance.destroy === 'function') {
        this._lgInstance.destroy();
        this._lgInstance = null;
      }
      const galleryEl = this.$el.querySelector('#gallery');
      if (galleryEl && window.lightGallery) {
        this._lgInstance = window.lightGallery(galleryEl, {
          selector: '.gallery-item',
          plugins: [lgZoom, lgThumbnail],
          licenseKey: '0000-0000-000-0000', // Free for personal/non-commercial
          speed: 400
        });
      }
    }
  },
  template: `
    <div>
      <div class="row" id="gallery">
        <a
          v-for="(path, idx) in pageImages"
          :key="idx"
          :href="'images/' + path"
          class="col-12 col-sm-6 col-md-3 mb-4 gallery-item"
          :data-lg-size="'1406-1390'"
        >
          <div class="card">
            <img :src="'images/' + path" class="card-img-top" :alt="path">
          </div>
        </a>
      </div>
      <nav id="pagination" aria-label="Gallery page navigation">
        <ul class="pagination justify-content-center">
          <li class="page-item" :class="{disabled: page === 1}">
            <button class="page-link" @click="page > 1 && (page--)" :disabled="page === 1">Previous</button>
          </li>
          <li v-for="num in pageNumbers" :key="num" class="page-item" :class="{active: num === page}">
            <button class="page-link" @click="page = num">{{ num }}</button>
          </li>
          <li class="page-item" :class="{disabled: page === totalPages}">
            <button class="page-link" @click="page < totalPages && (page++)" :disabled="page === totalPages">Next</button>
          </li>
        </ul>
      </nav>
    </div>
  `
};

const Screensaver = {
  props: ['images'],
  emits: ['exit'],
  data() {
    return {
      index: 0,
      shuffled: [],
      intervalId: null
    };
  },
  mounted() {
    this.shuffled = this.images.slice().sort(() => Math.random() - 0.5);
    this.index = 0;
    // Fullscreen
    this.$nextTick(() => {
      const el = document.getElementById('screensaver');
      if (el && el.requestFullscreen) el.requestFullscreen();
    });
    // Change image every 15 minutes
    this.intervalId = setInterval(() => {
      this.index = (this.index + 1) % this.shuffled.length;
    }, 900000);
    // Arrow keys
    window.addEventListener('keydown', this.handleKey);
  },
  beforeUnmount() {
    clearInterval(this.intervalId);
    window.removeEventListener('keydown', this.handleKey);
    if (document.fullscreenElement) document.exitFullscreen();
  },
  methods: {
    handleKey(e) {
      if (e.key === 'ArrowRight') this.index = (this.index + 1) % this.shuffled.length;
      if (e.key === 'ArrowLeft') this.index = (this.index - 1 + this.shuffled.length) % this.shuffled.length;
      if (e.key === 'Escape') this.$emit('exit');
    }
  },
  template: `
    <div id="screensaver"
      style="width:100vw;height:100vh;background:#000;display:flex;align-items:center;justify-content:center;position:fixed;top:0;left:0;z-index:9999"
      @click="$emit('exit')"
    >
      <img
        :src="'images/' + shuffled[index]"
        style="max-width:100vw;max-height:100vh;object-fit:contain;display:block"
        alt=""
      />
    </div>
  `
};

const QuickView = {
  props: ['images'],
  emits: ['close'],
  methods: {
    openInGallery(idx) {
      // Open lightGallery at the clicked image
      if (window.lightGallery) {
        const galleryEl = this.$el.querySelector('.quickview-gallery');
        window.lightGallery(galleryEl, {
          dynamic: true,
          dynamicEl: this.images.map(path => ({
            src: 'images/' + path,
            thumb: 'images/' + path
          })),
          index: idx,
          plugins: [lgZoom, lgThumbnail],
          licenseKey: '0000-0000-000-0000',
          speed: 400
        });
      }
    }
  },
  template: `
    <div class="modal fade show" tabindex="-1" style="display:block; background:rgba(0,0,0,0.85);" @click.self="$emit('close')">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content bg-dark text-white">
          <div class="modal-header">
            <h5 class="modal-title">Quick View All Thumbnails</h5>
            <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
          </div>
          <div class="modal-body">
            <div class="row quickview-gallery" style="max-height:70vh;overflow:auto;">
              <div v-for="(path, idx) in images" :key="idx" class="col-3 col-sm-2 col-md-1 mb-2">
                <img
                  :src="'images/' + path"
                  class="img-thumbnail"
                  style="cursor:pointer;max-width:100%;"
                  @click="openInGallery(idx)"
                  :alt="path"
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
};

// Make sure to load Gallery.js, Screensaver.js, and QuickView.js before this file in your HTML!
Vue.createApp({
  components: { Gallery, Screensaver, QuickView },
  data() {
    return {
      images: [],
      screensaver: false,
      quickView: false
    };
  },
  mounted() {
    fetch('images.json')
      .then(res => res.json())
      .then(imgs => { this.images = imgs; });
  },
  methods: {
    startScreensaver() {
      this.screensaver = true;
    }
  }
}).mount('#app');
