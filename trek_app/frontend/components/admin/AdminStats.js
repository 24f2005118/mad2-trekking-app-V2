const AdminStats = {
    data() {
        return {
            stats:   null,
            loading: false,
            error:   ''
        };
    },

    mounted() {
        this.loadStats();
    },

    methods: {
        async loadStats() {
            this.loading = true;
            this.error   = '';
            const response = await apiFetch('/admin/statistics');
            const data     = await response.json();
            if (response.ok) {
                this.stats = data;
            } else {
                this.error = data.error || 'Failed to load statistics';
            }
            this.loading = false;
        }
    },

    template: `
        <div>
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="mb-0">Statistics</h4>
                <button class="btn btn-outline-dark btn-sm" @click="loadStats">Refresh</button>
            </div>

            <div v-if="loading" class="text-muted">Loading...</div>
            <div v-if="error"   class="alert alert-danger">{{ error }}</div>

            <div v-if="stats" class="row g-4">

                <div class="col-md-4">
                    <div class="card shadow-sm">
                        <div class="card-header bg-dark text-white">Treks by Status</div>
                        <div class="card-body p-0">
                            <table class="table table-sm mb-0">
                                <thead><tr><th>Status</th><th>Count</th></tr></thead>
                                <tbody>
                                    <tr v-for="(count, status) in stats.treks_by_status" :key="status">
                                        <td>{{ status }}</td>
                                        <td><strong>{{ count }}</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="card shadow-sm">
                        <div class="card-header bg-dark text-white">Bookings by Status</div>
                        <div class="card-body p-0">
                            <table class="table table-sm mb-0">
                                <thead><tr><th>Status</th><th>Count</th></tr></thead>
                                <tbody>
                                    <tr v-for="(count, status) in stats.bookings_by_status" :key="status">
                                        <td>{{ status }}</td>
                                        <td><strong>{{ count }}</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="card shadow-sm">
                        <div class="card-header bg-dark text-white">Bookings per Trek (Top 10)</div>
                        <div class="card-body p-0">
                            <table class="table table-sm mb-0">
                                <thead><tr><th>Trek</th><th>Bookings</th></tr></thead>
                                <tbody>
                                    <tr v-if="stats.bookings_per_trek.length === 0">
                                        <td colspan="2" class="text-muted text-center">No data</td>
                                    </tr>
                                    <tr v-for="item in stats.bookings_per_trek" :key="item.trek_name">
                                        <td>{{ item.trek_name }}</td>
                                        <td><strong>{{ item.count }}</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `
};
