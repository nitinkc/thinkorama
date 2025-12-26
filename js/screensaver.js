window.screensaver = {
  name: 'screensaver',
  props: ['images'],
  emits: ['exit'],
  data() {
    return {
      index: 0,
      shuffled: [],
      intervalId: null,
      progressIntervalId: null,
      progress: 0,
      duration: 300000, // 5 minutes default
      showControls: false
    };
  },
  mounted() {
    this.shuffled = this.images.slice().sort(() => Math.random() - 0.5);
    this.index = 0;
    this.$nextTick(() => {
      const el = document.getElementById('screensaver');
      if (el && el.requestFullscreen) el.requestFullscreen();
    });
    this.startTimer();
    window.addEventListener('keydown', this.handleKey);
    window.addEventListener('mousemove', this.showControlsTemporarily);
  },
  beforeUnmount() {
    this.stopTimer();
    window.removeEventListener('keydown', this.handleKey);
    window.removeEventListener('mousemove', this.showControlsTemporarily);
    if (document.fullscreenElement) document.exitFullscreen();
  },
  methods: {
    startTimer() {
      this.stopTimer();
      this.progress = 0;
      
      // Main interval to change image
      this.intervalId = setInterval(() => {
        this.index = (this.index + 1) % this.shuffled.length;
        this.progress = 0;
      }, this.duration);
      
      // Progress bar update (every 100ms)
      this.progressIntervalId = setInterval(() => {
        this.progress += (100 / this.duration) * 100;
        if (this.progress > 100) this.progress = 100;
      }, 100);
    },
    stopTimer() {
      if (this.intervalId) clearInterval(this.intervalId);
      if (this.progressIntervalId) clearInterval(this.progressIntervalId);
    },
    setDuration(seconds) {
      this.duration = seconds * 1000;
      this.startTimer();
    },
    showControlsTemporarily() {
      this.showControls = true;
      clearTimeout(this._hideControlsTimeout);
      this._hideControlsTimeout = setTimeout(() => {
        this.showControls = false;
      }, 3000);
    },
    startFrom(imageIndex) {
      // Find the image in shuffled array and jump to it
      const imagePath = this.images[imageIndex];
      const shuffledIndex = this.shuffled.indexOf(imagePath);
      if (shuffledIndex !== -1) {
        this.index = shuffledIndex;
      }
      this.progress = 0;
    },
    handleKey(e) {
      if (e.key === 'ArrowRight') {
        this.index = (this.index + 1) % this.shuffled.length;
        this.progress = 0;
      }
      if (e.key === 'ArrowLeft') {
        this.index = (this.index - 1 + this.shuffled.length) % this.shuffled.length;
        this.progress = 0;
      }
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
      
      <!-- Progress bar -->
      <div style="position:fixed;bottom:0;left:0;right:0;height:4px;background:rgba(255,255,255,0.2);z-index:10000">
        <div style="height:100%;background:#0d6efd;transition:width 0.1s linear" :style="{width: progress + '%'}"></div>
      </div>
      
      <!-- Speed controls -->
      <div v-show="showControls" @click.stop style="position:fixed;top:20px;right:20px;background:rgba(0,0,0,0.8);padding:15px;border-radius:8px;z-index:10001;color:white;font-size:14px">
        <div style="margin-bottom:10px;font-weight:bold">Speed</div>
        <button @click="setDuration(30)" style="padding:8px 12px;margin:2px;border:none;border-radius:4px;cursor:pointer;background:#333;color:white" :style="duration === 30000 ? 'background:#0d6efd' : ''">30s</button>
        <button @click="setDuration(60)" style="padding:8px 12px;margin:2px;border:none;border-radius:4px;cursor:pointer;background:#333;color:white" :style="duration === 60000 ? 'background:#0d6efd' : ''">1m</button>
        <button @click="setDuration(120)" style="padding:8px 12px;margin:2px;border:none;border-radius:4px;cursor:pointer;background:#333;color:white" :style="duration === 120000 ? 'background:#0d6efd' : ''">2m</button>
        <button @click="setDuration(180)" style="padding:8px 12px;margin:2px;border:none;border-radius:4px;cursor:pointer;background:#333;color:white" :style="duration === 180000 ? 'background:#0d6efd' : ''">3m</button>
        <button @click="setDuration(300)" style="padding:8px 12px;margin:2px;border:none;border-radius:4px;cursor:pointer;background:#333;color:white" :style="duration === 300000 ? 'background:#0d6efd' : ''">5m</button>
        <button @click="setDuration(600)" style="padding:8px 12px;margin:2px;border:none;border-radius:4px;cursor:pointer;background:#333;color:white" :style="duration === 600000 ? 'background:#0d6efd' : ''">10m</button>
      </div>
    </div>
  `
};