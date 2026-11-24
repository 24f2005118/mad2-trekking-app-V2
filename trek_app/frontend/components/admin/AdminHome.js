const AdminHome = {
    data() {
        return {
            stats: null,
            loading: false,
            error: ''
        };
    },

    mounted() {
        this.loadStats();
    },

    methods: {
        async loadStats() {
            this.loading = true;
            this.error   = '';
            try {
                const response = await apiFetch('/admin/stats');
                const data     = await response.json();
                if (!response.ok) {
                    this.error = data.error || 'Failed to load stats';
                    return;
                }
                this.stats = data;
            } catch (err) {
                this.error = 'Cannot connect to server.';
            } finally {
                this.loading = false;
            }
        }
    },

    template: `
        <div>
            <h4 class="mb-4">Dashboard Overview</h4>
            <div v-if="loading" class="text-muted">Loading...</div>
            <div v-if="error" class="alert alert-danger">{{ error }}</div>
            <div v-if="stats" class="row g-3">
                <div class="col-md-3">
                    <div class="card text-center border-0 shadow-sm">
                        <div class="card-body">
                            <h2 class="fw-bold">{{ stats.total_treks }}</h2>
                            <p class="text-muted mb-0">Total Treks</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center border-0 shadow-sm">
                        <div class="card-body">
                            <h2 class="fw-bold">{{ stats.total_users }}</h2>
                            <p class="text-muted mb-0">Total Trekkers</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center border-0 shadow-sm">
                        <div class="card-body">
                            <h2 class="fw-bold">{{ stats.total_staff }}</h2>
                            <p class="text-muted mb-0">Total Staff</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center border-0 shadow-sm">
                        <div class="card-body">
                            <h2 class="fw-bold">{{ stats.total_bookings }}</h2>
                            <p class="text-muted mb-0">Total Bookings</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
};
