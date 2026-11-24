const AdminSearch = {
    data() {
        return {
            query:      '',
            searchType: 'treks',
            results:    [],
            searched:   false,
            loading:    false,
            error:      ''
        };
    },

    methods: {
        async doSearch() {
            if (!this.query.trim()) return;
            this.loading  = true;
            this.error    = '';
            this.results  = [];
            this.searched = false;

            const params   = '?q=' + encodeURIComponent(this.query) + '&type=' + this.searchType;
            const response = await apiFetch('/admin/search' + params);
            const data     = await response.json();

            if (response.ok) {
                this.results  = data;
                this.searched = true;
            } else {
                this.error = data.error || 'Search failed';
            }
            this.loading = false;
        }
    },

    template: `
        <div>
            <h4 class="mb-3">Search</h4>

            <div class="row g-2 mb-3">
                <div class="col-md-5">
                    <input type="text" class="form-control" v-model="query"
                        placeholder="Search by name..." @keyup.enter="doSearch">
                </div>
                <div class="col-md-3">
                    <select class="form-select" v-model="searchType">
                        <option value="treks">Treks</option>
                        <option value="staff">Staff</option>
                        <option value="users">Trekkers</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <button class="btn btn-dark w-100" @click="doSearch" :disabled="loading">
                        {{ loading ? 'Searching...' : 'Search' }}
                    </button>
                </div>
            </div>

            <div v-if="error" class="alert alert-danger">{{ error }}</div>

            <div v-if="searched && results.length === 0" class="text-muted">
                No results found for "{{ query }}".
            </div>

            <div v-if="results.length > 0">
                <p class="text-muted small">{{ results.length }} result(s) for "{{ query }}"</p>

                <div v-if="searchType === 'treks'" class="table-responsive">
                    <table class="table table-striped table-sm">
                        <thead class="table-dark"><tr><th>ID</th><th>Name</th><th>Location</th><th>Difficulty</th><th>Status</th></tr></thead>
                        <tbody>
                            <tr v-for="item in results" :key="item.id">
                                <td>{{ item.id }}</td><td>{{ item.name }}</td>
                                <td>{{ item.location }}</td><td>{{ item.difficulty }}</td><td>{{ item.status }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-if="searchType !== 'treks'" class="table-responsive">
                    <table class="table table-striped table-sm">
                        <thead class="table-dark"><tr><th>ID</th><th>Name</th><th>Email</th><th>Status</th></tr></thead>
                        <tbody>
                            <tr v-for="item in results" :key="item.id">
                                <td>{{ item.id }}</td><td>{{ item.name }}</td>
                                <td>{{ item.email }}</td>
                                <td><span :class="item.is_active ? 'badge bg-success' : 'badge bg-danger'">{{ item.is_active ? 'Active' : 'Inactive' }}</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `
};
