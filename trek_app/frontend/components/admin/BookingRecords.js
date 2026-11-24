const BookingRecords = {
    data() {
        return {
            bookings:  [],
            filterText: '',
            loading:   false
        };
    },

    mounted() {
        this.loadBookings();
    },

    computed: {
        filteredBookings() {
            if (!this.filterText.trim()) return this.bookings;
            const q = this.filterText.toLowerCase();
            return this.bookings.filter(b =>
                b.user_name.toLowerCase().includes(q) ||
                b.trek_name.toLowerCase().includes(q) ||
                b.booking_status.toLowerCase().includes(q)
            );
        }
    },

    methods: {
        async loadBookings() {
            this.loading   = true;
            const response = await apiFetch('/admin/bookings');
            const data     = await response.json();
            if (response.ok) this.bookings = data;
            this.loading = false;
        },

        statusClass(status) {
            if (status === 'Booked')    return 'badge bg-success';
            if (status === 'Cancelled') return 'badge bg-danger';
            if (status === 'Completed') return 'badge bg-dark';
            return 'badge bg-secondary';
        },

        paymentClass(status) {
            return status === 'Paid' ? 'badge bg-success' : 'badge bg-warning text-dark';
        }
    },

    template: `
        <div>
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="mb-0">Booking Records</h4>
                <input type="text" class="form-control form-control-sm"
                    style="width:220px" v-model="filterText" placeholder="Search by name or status...">
            </div>

            <div v-if="loading" class="text-muted">Loading...</div>

            <div class="table-responsive">
                <table class="table table-striped table-sm align-middle">
                    <thead class="table-dark">
                        <tr>
                            <th>ID</th><th>Trekker</th><th>Email</th><th>Trek</th>
                            <th>Date</th><th>Booking Status</th><th>Payment</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="filteredBookings.length === 0">
                            <td colspan="7" class="text-center text-muted">No bookings found.</td>
                        </tr>
                        <tr v-for="b in filteredBookings" :key="b.id">
                            <td>{{ b.id }}</td>
                            <td>{{ b.user_name }}</td>
                            <td>{{ b.user_email }}</td>
                            <td>{{ b.trek_name }}</td>
                            <td>{{ b.booking_date }}</td>
                            <td><span :class="statusClass(b.booking_status)">{{ b.booking_status }}</span></td>
                            <td><span :class="paymentClass(b.payment_status)">{{ b.payment_status }}</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p class="text-muted small">Showing {{ filteredBookings.length }} of {{ bookings.length }} records.</p>
        </div>
    `
};
