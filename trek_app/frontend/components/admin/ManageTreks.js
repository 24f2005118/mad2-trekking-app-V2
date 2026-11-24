const ManageTreks = {
    data() {
        return {
            treks:     [],
            staffList: [],
            showForm:  false,
            formMode:  'create',
            form: {
                id:               null,
                name:             '',
                location:         '',
                difficulty:       'Moderate',
                duration_days:    1,
                start_date:       '',
                total_slots:      10,
                price:            0,
                description:      '',
                status:           'Pending',
                assigned_staff_id: null
            },
            msg:     '',
            isError: false
        };
    },

    mounted() {
        this.loadTreks();
        this.loadStaff();
    },

    methods: {
        async loadTreks() {
            const response = await apiFetch('/admin/treks');
            const data     = await response.json();
            if (response.ok) {
                this.treks = data;
            }
        },

        async loadStaff() {
            const response = await apiFetch('/admin/staff');
            const data     = await response.json();
            if (response.ok) {
                this.staffList = data;
            }
        },

        openCreate() {
            this.resetForm();
            this.formMode = 'create';
            this.showForm = true;
        },

        openEdit(trek) {
            this.form.id               = trek.id;
            this.form.name             = trek.name;
            this.form.location         = trek.location;
            this.form.difficulty       = trek.difficulty;
            this.form.duration_days    = trek.duration_days;
            this.form.start_date       = trek.start_date;
            this.form.total_slots      = trek.total_slots;
            this.form.price            = trek.price;
            this.form.description      = trek.description || '';
            this.form.status           = trek.status;
            this.form.assigned_staff_id = trek.assigned_staff_id || null;
            this.formMode = 'edit';
            this.showForm = true;
        },

        resetForm() {
            this.form = {
                id: null, name: '', location: '', difficulty: 'Moderate',
                duration_days: 1, start_date: '', total_slots: 10, price: 0,
                description: '', status: 'Pending', assigned_staff_id: null
            };
        },

        async saveTrek() {
            this.msg     = '';
            this.isError = false;

            const payload = {
                name:              this.form.name,
                location:          this.form.location,
                difficulty:        this.form.difficulty,
                duration_days:     this.form.duration_days,
                start_date:        this.form.start_date,
                total_slots:       this.form.total_slots,
                price:             this.form.price,
                description:       this.form.description,
                status:            this.form.status,
                assigned_staff_id: this.form.assigned_staff_id || null
            };

            let response;
            if (this.formMode === 'create') {
                response = await apiFetch('/admin/treks', { method: 'POST', body: JSON.stringify(payload) });
            } else {
                response = await apiFetch('/admin/treks/' + this.form.id, { method: 'PUT', body: JSON.stringify(payload) });
            }

            const data = await response.json();
            if (!response.ok) {
                this.msg     = data.error || 'Save failed.';
                this.isError = true;
                return;
            }

            this.msg      = data.message;
            this.showForm = false;
            this.resetForm();
            this.loadTreks();
        },

        async deleteTrek(trekId) {
            if (!confirm('Delete this trek? This cannot be undone.')) return;
            const response = await apiFetch('/admin/treks/' + trekId, { method: 'DELETE' });
            const data     = await response.json();
            this.isError   = !response.ok;
            this.msg       = data.error || data.message;
            if (response.ok) this.loadTreks();
        },

        statusClass(status) {
            const map = {
                'Pending': 'badge bg-secondary', 'Approved': 'badge bg-info text-dark',
                'Open': 'badge bg-success', 'Closed': 'badge bg-warning text-dark',
                'Started': 'badge bg-primary', 'Ongoing': 'badge bg-primary',
                'Completed': 'badge bg-dark'
            };
            return map[status] || 'badge bg-secondary';
        }
    },

    template: `
        <div>
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="mb-0">Manage Treks</h4>
                <button class="btn btn-dark btn-sm" @click="openCreate">+ Add Trek</button>
            </div>

            <div v-if="msg" :class="isError ? 'alert alert-danger' : 'alert alert-success'" class="py-2">{{ msg }}</div>

            <div class="table-responsive">
                <table class="table table-striped table-sm align-middle">
                    <thead class="table-dark">
                        <tr>
                            <th>ID</th><th>Name</th><th>Location</th><th>Difficulty</th>
                            <th>Start Date</th><th>Slots</th><th>Status</th><th>Staff</th><th>Price</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="treks.length === 0">
                            <td colspan="10" class="text-center text-muted">No treks found.</td>
                        </tr>
                        <tr v-for="trek in treks" :key="trek.id">
                            <td>{{ trek.id }}</td>
                            <td>{{ trek.name }}</td>
                            <td>{{ trek.location }}</td>
                            <td>{{ trek.difficulty }}</td>
                            <td>{{ trek.start_date }}</td>
                            <td>{{ trek.available_slots }}/{{ trek.total_slots }}</td>
                            <td><span :class="statusClass(trek.status)">{{ trek.status }}</span></td>
                            <td>{{ trek.assigned_staff_name || 'Unassigned' }}</td>
                            <td>&#8377;{{ trek.price }}</td>
                            <td>
                                <button class="btn btn-sm btn-outline-dark me-1" @click="openEdit(trek)">Edit</button>
                                <button class="btn btn-sm btn-outline-danger"    @click="deleteTrek(trek.id)">Delete</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="showForm" class="card mt-3 shadow-sm">
                <div class="card-header bg-dark text-white d-flex justify-content-between">
                    <span>{{ formMode === 'create' ? 'Add New Trek' : 'Edit Trek' }}</span>
                    <button type="button" class="btn-close btn-close-white" @click="showForm = false"></button>
                </div>
                <div class="card-body">
                    <form @submit.prevent="saveTrek">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label">Trek Name *</label>
                                <input type="text" class="form-control" v-model="form.name" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Location *</label>
                                <input type="text" class="form-control" v-model="form.location" required>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Difficulty</label>
                                <select class="form-select" v-model="form.difficulty">
                                    <option>Easy</option>
                                    <option>Moderate</option>
                                    <option>Hard</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Duration (days) *</label>
                                <input type="number" class="form-control" v-model="form.duration_days" min="1" required>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Start Date *</label>
                                <input type="date" class="form-control" v-model="form.start_date" required>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Total Slots *</label>
                                <input type="number" class="form-control" v-model="form.total_slots" min="1" required>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Price (₹) *</label>
                                <input type="number" class="form-control" v-model="form.price" min="0" step="0.01" required>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Status</label>
                                <select class="form-select" v-model="form.status">
                                    <option>Pending</option>
                                    <option>Approved</option>
                                    <option>Open</option>
                                    <option>Closed</option>
                                    <option>Started</option>
                                    <option>Ongoing</option>
                                    <option>Completed</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Assigned Staff</label>
                                <select class="form-select" v-model="form.assigned_staff_id">
                                    <option :value="null">-- None (Unassigned) --</option>
                                    <option v-for="s in staffList" :key="s.id" :value="s.id">
                                        {{ s.name }} {{ s.designation ? '(' + s.designation + ')' : '' }}
                                    </option>
                                </select>
                            </div>
                            <div class="col-12">
                                <label class="form-label">Description</label>
                                <textarea class="form-control" v-model="form.description" rows="2"></textarea>
                            </div>
                        </div>
                        <div class="mt-3">
                            <button type="submit" class="btn btn-dark me-2">Save Trek</button>
                            <button type="button" class="btn btn-secondary" @click="showForm = false">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `
};
