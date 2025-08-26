const screensaver = {
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
    this.$nextTick(() => {
      const el = document.getElementById('screensaver');
      if (el && el.requestFullscreen) el.requestFullscreen();
    });
    this.intervalId = setInterval(() => {
      this.index = (this.index + 1) % this.shuffled.length;
    }, 900000);
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