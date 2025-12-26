window.searchbar = {
  name: 'search-bar',
  props: ['metadata'],
  emits: ['search'],
  data() {
    return {
      query: '',
      showFilters: false,
      selectedFolder: ''
    };
  },
  computed: {
    folders() {
      if (!this.metadata || this.metadata.length === 0) return [];
      const folderSet = new Set(this.metadata.map(m => m.folder).filter(f => f));
      return ['', ...Array.from(folderSet).sort()];
    },
    hasMetadata() {
      return this.metadata && this.metadata.length > 0;
    }
  },
  watch: {
    query(newQuery) {
      this.performSearch();
    },
    selectedFolder() {
      this.performSearch();
    }
  },
  methods: {
    performSearch() {
      this.$emit('search', {
        query: this.query.toLowerCase().trim(),
        folder: this.selectedFolder
      });
    },
    clearSearch() {
      this.query = '';
      this.selectedFolder = '';
      this.performSearch();
    }
  },
  template: `
    <div v-if="hasMetadata" class="search-container">
      <div class="search-bar">
        <input 
          v-model="query"
          type="text" 
          class="form-control search-input" 
          placeholder="🔍 Search text in images..."
          @keyup.esc="clearSearch"
        >
        <button 
          v-if="query || selectedFolder" 
          @click="clearSearch" 
          class="btn btn-outline-secondary clear-btn"
          title="Clear search"
        >
          ✕
        </button>
        <button 
          @click="showFilters = !showFilters" 
          class="btn btn-outline-primary filter-btn"
          :class="{active: selectedFolder}"
        >
          <span class="button-icon">⚙</span>
          <span class="button-text">Filter</span>
        </button>
      </div>
      <div v-if="showFilters" class="filter-panel">
        <label class="filter-label">Category:</label>
        <select v-model="selectedFolder" class="form-select form-select-sm">
          <option value="">All Categories</option>
          <option v-for="folder in folders.slice(1)" :key="folder" :value="folder">
            {{ folder }}
          </option>
        </select>
      </div>
    </div>
  `
};
