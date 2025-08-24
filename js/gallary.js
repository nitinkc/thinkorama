const PAGE_SIZE = 21;

const Gallery = {
  props: {
    images: Array,
    page: {
      type: Number,
      default: 1
    }
  },
  emits: ['update:page'],
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
      internalPage: this.page
    };
  },
  methods: {
    setPage(newPage) {
      this.internalPage = newPage;
      this.$emit('update:page', newPage);
    },
    initLightGallery() {
      if (this._lgInstance && typeof this._lgInstance.destroy === 'function') {
        this._lgInstance.destroy();
        this._lgInstance = null;
      }
      const galleryEl = this.$el.querySelector('#gallery');
      if (galleryEl && window.lightGallery) {
        this._lgInstance = window.lightGallery(galleryEl, {
          selector: '.gallery-item',
          plugins: [lgZoom, lgThumbnail],
          licenseKey: '0000-0000-000-0000',
          speed: 400
        });
      }
    }
  },
  mounted() { this.initLightGallery(); },
  updated() { this.initLightGallery(); },
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
          <li class="page-item" :class="{disabled: internalPage === 1}">
            <button class="page-link" @click="internalPage > 1 && setPage(internalPage - 1)" :disabled="internalPage === 1">Previous</button>
          </li>
          <li v-for="num in pageNumbers" :key="num" class="page-item" :class="{active: num === internalPage}">
            <button class="page-link" @click="setPage(num)">{{ num }}</button>
          </li>
          <li class="page-item" :class="{disabled: internalPage === totalPages}">
            <button class="page-link" @click="internalPage < totalPages && setPage(internalPage + 1)" :disabled="internalPage === totalPages">Next</button>
          </li>
        </ul>
      </nav>
    </div>
  `
};