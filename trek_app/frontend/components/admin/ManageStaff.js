const ManageStaff = {
    data() {
        return {
            staffList:      [],
            showCreateForm: false,
            createForm: {
                name: '', email: '', password: '', phone: '',
                designation: '', experience_years: 0
            },
            editingId:  null,
            editForm:   { name: '', phone: '', designation: '', experience_years: 0 },
            msg:        '',
            isError:    false
        };
    },

    mounted() {
        this.loadStaff();
    },

    methods: {
        async loadStaff() {
            const response = await apiFetch('/admin/staff');
            const data     = await response.json();
            if (response.ok) this.staffList = data;
        },

        async createStaff() {
            this.msg     = '';
            this.isError = false;
            const response = await apiFetch('/admin/staff', {
                method: 'POST',
                body:   JSON.stringify(this.createForm)
            });
            const data = await response.json();
            this.isError = !response.ok;
            this.msg     = data.error || data.message;
            if (response.ok) {
                this.showCreateForm = false;
                this.createForm = { name: '', email: '', password: '', phone: '', designation: '', experience_years: 0 };
                this.loadStaff();
            }
        },

        startEdit(staff) {
            this.editingId = staff.id;
            this.editForm  = {
                name:             staff.name,
                phone:            staff.phone || '',
                designation:      staff.designation || '',
                experience_years: staff.experience_years
            };
        },

        cancelEdit() {
            this.editingId = null;
        },

        async saveEdit(staffId) {
            this.msg     = '';
            this.isError = false;
            const response = await apiFetch('/admin/staff/' + staffId, {
                method: 'PUT',
                body:   JSON.stringify(this.editForm)
            });
            const data = await response.json();
            this.isError = !response.ok;
            this.msg     = data.error || data.message;
            if (response.ok) {
                this.editingId = null;
                this.loadStaff();
            }
        },

        async toggleActive(staffId) {
            const response = await apiFetch('/admin/users/' + staffId + '/toggle-active', { method: 'PUT' });
            const data     = await response.json();
            this.isError   = !response.ok;
            this.msg       = data.error || data.message;
            if (response.ok) this.loadStaff();
        }
    },

    template: `
        <div>
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="mb-0">Manage Staff</h4>
                <button class="btn btn-dark btn-sm" @click="showCreateForm = !showCreateForm">+ Add Staff</button>
            </div>

            <div v-if="msg" :class="isError ? 'alert alert-danger' : 'alert alert-success'" class="py-2">{{ msg }}</div>

            <div v-if="showCreateForm" class="card mb-3 shadow-sm">
                <div class="card-header bg-dark text-white d-flex justify-content-between">
                    <span>Create New Staff Account</span>
                    <button type="button" class="btn-close btn-close-white" @click="showCreateForm = false"></button>
                </div>
                <div class="card-body">
                    <form @submit.prevent="createStaff">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label">Full Name *</label>
                                <input type="text" class="form-control" v-model="createForm.name" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Email *</label>
                                <input type="email" class="form-control" v-model="createForm.email" required>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Password *</label>
                                <input type="password" class="form-control" v-model="createForm.password" placeholder="Min 6 chars" required>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Phone</label>
                                <input type="tel" class="form-control" v-model="createForm.phone">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Experience (years)</label>
                                <input type="number" class="form-control" v-model="createForm.experience_years" min="0">
                            </div>
                            <div class="col-12">
                                <label class="form-label">Designation</label>
                                <input type="text" class="form-control" v-model="createForm.designation" placeholder="e.g. Trek Leader">
                            </div>
                        </div>
                        <div class="mt-3">
                            <button type="submit" class="btn btn-dark me-2">Create Staff</button>
                            <button type="button" class="btn btn-secondary" @click="showCreateForm = false">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>

            <div class="table-responsive">
                <table class="table table-striped table-sm align-middle">
                    <thead class="table-dark">
                        <tr>
                            <th>ID</th><th>Name</th><th>Email</th><th>Phone</th>
                            <th>Designation</th><th>Exp (yrs)</th><th>Status</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="staffList.length === 0">
                            <td colspan="8" class="text-center text-muted">No staff found.</td>
                        </tr>
                        <template v-for="staff in staffList" :key="staff.id">
                            <tr>
                                <td>{{ staff.id }}</td>
                                <td>{{ staff.name }}</td>
                                <td>{{ staff.email }}</td>
                                <td>{{ staff.phone || '-' }}</td>
                                <td>{{ staff.designation || '-' }}</td>
                                <td>{{ staff.experience_years }}</td>
                                <td>
                                    <span :class="staff.is_active ? 'badge bg-success' : 'badge bg-danger'">
                                        {{ staff.is_active ? 'Active' : 'Inactive' }}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-outline-dark me-1" @click="startEdit(staff)">Edit</button>
                                    <button class="btn btn-sm"
                                        :class="staff.is_active ? 'btn-outline-danger' : 'btn-outline-success'"
                                        @click="toggleActive(staff.id)">
                                        {{ staff.is_active ? 'Deactivate' : 'Activate' }}
                                    </button>
                                </td>
                            </tr>
                            <tr v-if="editingId === staff.id">
                                <td colspan="8" class="bg-light">
                                    <div class="p-2">
                                        <div class="row g-2">
                                            <div class="col-md-3">
                                                <input type="text" class="form-control form-control-sm" v-model="editForm.name" placeholder="Name">
                                            </div>
                                            <div class="col-md-3">
                                                <input type="text" class="form-control form-control-sm" v-model="editForm.phone" placeholder="Phone">
                                            </div>
                                            <div class="col-md-3">
                                                <input type="text" class="form-control form-control-sm" v-model="editForm.designation" placeholder="Designation">
                                            </div>
                                            <div class="col-md-1">
                                                <input type="number" class="form-control form-control-sm" v-model="editForm.experience_years" placeholder="Exp" min="0">
                                            </div>
                                            <div class="col-md-2">
                                                <button class="btn btn-dark btn-sm me-1" @click="saveEdit(staff.id)">Save</button>
                                                <button class="btn btn-secondary btn-sm" @click="cancelEdit()">Cancel</button>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
        </div>
    `
};
