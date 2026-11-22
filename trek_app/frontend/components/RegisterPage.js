const RegisterPage = {

    template: `
        <div class="container mt-5">
            <div class="row justify-content-center">
                <div class="col-md-4">
                    <div class="card shadow-sm">
                        <div class="card-header bg-dark text-white">
                            <h5 class="mb-0">Create Account</h5>
                        </div>
                        <div class="card-body">
                            <div v-if="errorMsg"   class="alert alert-danger  py-2">{{ errorMsg }}</div>
                            <div v-if="successMsg" class="alert alert-success py-2">{{ successMsg }}</div>
                            <form @submit.prevent="register">
                                <div class="mb-3">
                                    <label class="form-label">Full Name</label>
                                    <input type="text" class="form-control" v-model="name" placeholder="Your full name" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-control" v-model="email" placeholder="you@example.com" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Password</label>
                                    <input type="password" class="form-control" v-model="password" placeholder="Minimum 6 characters" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Phone <span class="text-muted">(optional)</span></label>
                                    <input type="tel" class="form-control" v-model="phone" placeholder="10-digit phone number">
                                </div>
                                <button type="submit" class="btn btn-dark w-100" :disabled="loading">
                                    {{ loading ? 'Creating account...' : 'Register' }}
                                </button>
                            </form>
                            <p class="mt-3 text-center mb-0">
                                Already have an account? <router-link to="/login">Login here</router-link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    data() {
        return {
            name:       '',
            email:      '',
            password:   '',
            phone:      '',
            errorMsg:   '',
            successMsg: '',
            loading:    false
        };
    },

    methods: {
        async register() {
            this.errorMsg   = '';
            this.successMsg = '';
            this.loading    = true;

            try {
                const response = await apiFetch('/register', {
                    method: 'POST',
                    body: JSON.stringify({
                        name:     this.name,
                        email:    this.email,
                        password: this.password,
                        phone:    this.phone
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    this.errorMsg = data.error || 'Registration failed. Please try again.';
                    return;
                }

                this.successMsg = 'Account created! Redirecting to login...';
                setTimeout(() => {
                    this.$router.push('/login');
                }, 1500);

            } catch (err) {
                this.errorMsg = 'Cannot connect to server. Is the backend running?';
            } finally {
                this.loading = false;
            }
        }
    }
};
