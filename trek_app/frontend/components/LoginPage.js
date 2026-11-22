const LoginPage = {

    template: `
        <div class="container mt-5">
            <div class="row justify-content-center">
                <div class="col-md-4">
                    <div class="card shadow-sm">
                        <div class="card-header bg-dark text-white">
                            <h5 class="mb-0">Login</h5>
                        </div>
                        <div class="card-body">
                            <div v-if="errorMsg" class="alert alert-danger py-2">{{ errorMsg }}</div>
                            <form @submit.prevent="login">
                                <div class="mb-3">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-control" v-model="email" placeholder="you@example.com" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Password</label>
                                    <input type="password" class="form-control" v-model="password" placeholder="Enter your password" required>
                                </div>
                                <button type="submit" class="btn btn-dark w-100" :disabled="loading">
                                    {{ loading ? 'Logging in...' : 'Login' }}
                                </button>
                            </form>
                            <p class="mt-3 text-center mb-0">
                                No account? <router-link to="/register">Register here</router-link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    data() {
        return {
            email:    '',
            password: '',
            errorMsg: '',
            loading:  false
        };
    },

    methods: {
        async login() {
            this.errorMsg = '';
            this.loading  = true;

            try {
                const response = await apiFetch('/login', {
                    method: 'POST',
                    body: JSON.stringify({ email: this.email, password: this.password })
                });

                const data = await response.json();

                if (!response.ok) {
                    this.errorMsg = data.error || 'Login failed. Please try again.';
                    return;
                }

                localStorage.setItem('token', data.token);
                localStorage.setItem('role',  data.role);
                localStorage.setItem('name',  data.name);

                authState.token = data.token;
                authState.role  = data.role;
                authState.name  = data.name;

                if (data.role === 'admin') {
                    this.$router.push('/admin');
                } else if (data.role === 'staff') {
                    this.$router.push('/staff');
                } else {
                    this.$router.push('/trekker');
                }

            } catch (err) {
                this.errorMsg = 'Cannot connect to server. Is the backend running?';
            } finally {
                this.loading = false;
            }
        }
    }
};
