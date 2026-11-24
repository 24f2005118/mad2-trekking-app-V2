const ManageUsers = {
    data() {
        return {
            users:      [],
            filterRole: 'all',
            msg:        '',
            isError:    false
        };
    },

    mounted() {
        this.loadUsers();
    },

    computed: {
        filteredUsers() {
            if (this.filterRole === 'all') return this.users;
            return this.users.filter(u => u.role === this.filterRole);
        }
    },

    methods: {
        async loadUsers() {
            const response = await apiFetch('/admin/users');
            const data     = await response.json();
            if (response.ok) this.users = data;
        },

        async toggleActive(userId) {
            const response = await apiFetch('/admin/users/' + userId + '/toggle-active', { method: 'PUT' });
            const data     = await response.json();
            this.isError   = !response.ok;
            this.msg       = data.error || data.message;
            if (response.ok) this.loadUsers();
        }
    },

    template: `
        <div>
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="mb-0">Manage Users</h4>
                <div class="d-flex align-items-center gap-2">
                    <label class="form-label mb-0">Filter:</label>
                    <select class="form-select form-select-sm" v-model="filterRole" style="width:140px">
                        <option value="all">All</option>
                        <option value="trekker">Trekkers</option>
                        <option value="staff">Staff</option>
                    </select>
                </div>
            </div>

            <div v-if="msg" :class="isError ? 'alert alert-danger' : 'alert alert-success'" class="py-2">{{ msg }}</div>

            <div class="table-responsive">
                <table class="table table-striped table-sm align-middle">
                    <thead class="table-dark">
                        <tr>
                            <th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="filteredUsers.length === 0">
                            <td colspan="7" class="text-center text-muted">No users found.</td>
                        </tr>
                        <tr v-for="user in filteredUsers" :key="user.id">
                            <td>{{ user.id }}</td>
                            <td>{{ user.name }}</td>
                            <td>{{ user.email }}</td>
                            <td>{{ user.phone || '-' }}</td>
                            <td><span class="badge bg-secondary">{{ user.role }}</span></td>
                            <td>
                                <span :class="user.is_active ? 'badge bg-success' : 'badge bg-danger'">
                                    {{ user.is_active ? 'Active' : 'Blacklisted' }}
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-sm"
                                    :class="user.is_active ? 'btn-outline-danger' : 'btn-outline-success'"
                                    @click="toggleActive(user.id)">
                                    {{ user.is_active ? 'Blacklist' : 'Activate' }}
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `
};
