const App = {

    data() {
        return {
            authState: authState
        };
    },

    methods: {
        logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('name');

            authState.token = '';
            authState.role  = '';
            authState.name  = '';

            this.$router.push('/login');
        }
    },

    template: `
        <div>
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark px-4">
                <span class="navbar-brand fw-bold">🏔️ Trek App</span>
                <div class="ms-auto d-flex align-items-center gap-3">
                    <template v-if="!authState.token">
                        <router-link class="btn btn-outline-light btn-sm" to="/login">Login</router-link>
                        <router-link class="btn btn-outline-light btn-sm" to="/register">Register</router-link>
                    </template>
                    <template v-else>
                        <span class="text-white">👤 {{ authState.name }}</span>
                        <button class="btn btn-outline-light btn-sm" @click="logout">Logout</button>
                    </template>
                </div>
            </nav>
            <router-view></router-view>
        </div>
    `
};

const app = Vue.createApp(App);
app.use(router);
app.mount('#app');
