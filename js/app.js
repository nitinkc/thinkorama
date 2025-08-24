// Make sure to load Gallery.js, Screensaver.js, and QuickView.js before this file in your HTML!
Vue.createApp({
  components: { Gallery, Screensaver, QuickView },
  data() {
    return {
      images: [],
      screensaver: false,
      quickView: false,
      galleryPage: 1
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
    },
    goToGalleryIndex(idx) {
    this.galleryPage = Math.floor(idx / PAGE_SIZE) + 1;
      this.quickView = false;
    }
  }
}).mount('#app');
