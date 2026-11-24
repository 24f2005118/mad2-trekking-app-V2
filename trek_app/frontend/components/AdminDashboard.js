const AdminDashboard = {
    components: {
        AdminHome,
        ManageTreks,
        ManageStaff,
        ManageUsers,
        BookingRecords,
        AdminStats,
        AdminSearch
    },

    data() {
        return {
            currentTab: 'AdminHome'
        };
    },

    methods: {
        goTo(tab) {
            this.currentTab = tab;
        }
    },

    template: `
        <div class="d-flex">
            <div class="bg-dark text-white" style="width:210px; min-height:calc(100vh - 56px); flex-shrink:0">
                <div class="p-3">
                    <p class="text-uppercase text-muted small mb-2 mt-1">Admin Panel</p>
                    <div class="list-group list-group-flush">
                        <button @click="goTo('AdminHome')"
                            class="list-group-item list-group-item-action border-0 py-2"
                            :class="currentTab === 'AdminHome' ? 'active' : 'text-white bg-transparent'">
                            Dashboard
                        </button>
                        <button @click="goTo('ManageTreks')"
                            class="list-group-item list-group-item-action border-0 py-2"
                            :class="currentTab === 'ManageTreks' ? 'active' : 'text-white bg-transparent'">
                            Manage Treks
                        </button>
                        <button @click="goTo('ManageStaff')"
                            class="list-group-item list-group-item-action border-0 py-2"
                            :class="currentTab === 'ManageStaff' ? 'active' : 'text-white bg-transparent'">
                            Manage Staff
                        </button>
                        <button @click="goTo('ManageUsers')"
                            class="list-group-item list-group-item-action border-0 py-2"
                            :class="currentTab === 'ManageUsers' ? 'active' : 'text-white bg-transparent'">
                            Manage Users
                        </button>
                        <button @click="goTo('BookingRecords')"
                            class="list-group-item list-group-item-action border-0 py-2"
                            :class="currentTab === 'BookingRecords' ? 'active' : 'text-white bg-transparent'">
                            Booking Records
                        </button>
                        <button @click="goTo('AdminStats')"
                            class="list-group-item list-group-item-action border-0 py-2"
                            :class="currentTab === 'AdminStats' ? 'active' : 'text-white bg-transparent'">
                            Statistics
                        </button>
                        <button @click="goTo('AdminSearch')"
                            class="list-group-item list-group-item-action border-0 py-2"
                            :class="currentTab === 'AdminSearch' ? 'active' : 'text-white bg-transparent'">
                            Search
                        </button>
                    </div>
                </div>
            </div>

            <div class="flex-grow-1 p-4">
                <component :is="currentTab"></component>
            </div>
        </div>
    `
};
