// Make sure to load Gallery.js, Screensaver.js, QuickView.js, and Search.js before this file in your HTML!
const PAGE_SIZE = 12; // Number of images per page

Vue.createApp({
  components: { 
    gallery: window.gallery,
    screensaver: window.screensaver,
    'quick-view': window.quickview,
    'search-bar': window.searchbar
  },
  computed: {
    isMobile() {
      return window.innerWidth <= 768;
    },
    filteredImages() {
      if (!this.searchQuery && !this.searchFolder) {
        return this.allImages;
      }
      
      if (!this.metadata || this.metadata.length === 0) {
        return this.allImages;
      }
      
      return this.metadata
        .filter(item => {
          // Filter by folder
          if (this.searchFolder && item.folder !== this.searchFolder) {
            return false;
          }
          
          // Filter by search query
          if (this.searchQuery) {
            const searchIn = (item.text + ' ' + item.filename + ' ' + item.folder).toLowerCase();
            return searchIn.includes(this.searchQuery);
          }
          
          return true;
        })
        .map(item => item.path);
    }
  },
  data() {
    return {
      allImages: [],
      metadata: [],
      screensaver: false,
      quickView: false,
      galleryPage: 1,
      searchQuery: '',
      searchFolder: ''
    };
  },
  mounted() {
    // Load images list
    fetch('images.json')
      .then(res => res.json())
      .then(imgs => { 
        this.allImages = imgs;
      });
    
    // Try to load metadata for search
    fetch('images-metadata.json')
      .then(res => res.json())
      .then(meta => { 
        this.metadata = meta;
        console.log('Search metadata loaded:', meta.length, 'images');
      })
      .catch(() => {
        console.log('No search metadata found. Run gen_images_metadata.py to enable search.');
      });
  },
  methods: {
    startScreensaver() {
      this.screensaver = true;
    },
    startScreensaverAt(index) {
      // Start screensaver from specific image index
      this.screensaver = true;
      // Use nextTick to ensure screensaver component is mounted
      this.$nextTick(() => {
        // The screensaver component will handle starting from this index
        if (this.$refs.screensaver && this.$refs.screensaver.startFrom) {
          this.$refs.screensaver.startFrom(index);
        }
      });
    },
    goToGalleryIndex(idx) {
      // Find the actual index in allImages array
      const imagePath = this.filteredImages[idx];
      const actualIdx = this.allImages.indexOf(imagePath);
      this.galleryPage = Math.floor(actualIdx / PAGE_SIZE) + 1;
      this.clearSearch();
      this.quickView = false;
    },
    handleSearch({query, folder}) {
      this.searchQuery = query;
      this.searchFolder = folder;
      this.galleryPage = 1; // Reset to first page on search
    },
    clearSearch() {
      this.searchQuery = '';
      this.searchFolder = '';
    }
  }
}).mount('#app');
