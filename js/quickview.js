const quickview = {
  name: 'quick-view',
  props: ['images'],
  emits: ['close', 'goto'],
  methods: {
    openInGallery(idx) {
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
    },
    goToGallery(idx) {
      this.$emit('goto', idx);
      this.$emit('close');
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
                  @click="goToGallery(idx)"
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