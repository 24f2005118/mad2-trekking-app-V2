const BASE_URL = 'http://127.0.0.1:5000/api';

const authState = Vue.reactive({
    token: localStorage.getItem('token') || '',
    role:  localStorage.getItem('role')  || '',
    name:  localStorage.getItem('name')  || ''
});


async function apiFetch(path, options) {
    if (!options) {
        options = {};
    }
    if (!options.headers) {
        options.headers = {};
    }

    options.headers['Content-Type'] = 'application/json';

    if (authState.token) {
        options.headers['Authorization'] = 'Bearer ' + authState.token;
    }

    const response = await fetch(BASE_URL + path, options);
    return response;
}
