const PAGE_SIZE = 20;

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
    shuffledImages() {
      // Shuffle on each page render
      const arr = this.images.slice();
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    },
    pageImages() {
      const start = (this.page - 1) * PAGE_SIZE;
      const end = Math.min(start + PAGE_SIZE, this.shuffledImages.length);
      return this.shuffledImages.slice(start, end);
    },
    pageNumbers() {
      let start = Math.max(1, this.page - 2);
      let end = Math.min(this.totalPages, this.page + 2);
      if (this.page <= 3) end = Math.min(5, this.totalPages);
      if (this.page >= this.totalPages - 2) start = Math.max(1, this.totalPages - 4);
      const nums = [];
      for (let i = start; i <= end; i++) nums.push(i);
      return nums;
    }
  },
  template: `
    <div>
      <div class="row" id="gallery">
        <div v-for="(path, idx) in pageImages" :key="idx" class="col-12 col-sm-6 col-md-3 mb-4">
          <div class="card">
            <a :href="'images/' + path" target="_blank">
              <img :src="'images/' + path" class="card-img-top" :alt="path">
            </a>
          </div>
        </div>
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

Vue.createApp({
  components: { Gallery, Screensaver },
  data() {
    return {
      images: [],
      screensaver: false
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
