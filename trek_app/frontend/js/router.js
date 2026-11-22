const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes: [
        { path: '/', redirect: '/login' },
        { path: '/login',    component: LoginPage },
        { path: '/register', component: RegisterPage },
        { path: '/admin',   component: AdminDashboard,   meta: { requiresRole: 'admin' } },
        { path: '/staff',   component: StaffDashboard,   meta: { requiresRole: 'staff' } },
        { path: '/trekker', component: TrekkerDashboard, meta: { requiresRole: 'trekker' } }
    ]
});


router.beforeEach(function(to, from, next) {
    const token = localStorage.getItem('token');
    const role  = localStorage.getItem('role');

    if (to.meta.requiresRole) {
        if (!token) {
            next('/login');
            return;
        }
        if (role !== to.meta.requiresRole) {
            next('/' + role);
            return;
        }
    }

    if ((to.path === '/login' || to.path === '/register') && token) {
        next('/' + role);
        return;
    }

    next();
});
