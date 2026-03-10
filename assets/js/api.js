const BASE_URL = "https://malcom-isopentyl-malvina.ngrok-free.dev";

function getToken() {
    return localStorage.getItem("accessToken");
}

async function apiFetch(endpoint, options = {}) {
    const token = getToken();

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: options.method || "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            ...(token ? { "Authorization": "Bearer " + token } : {}),
            ...(options.headers || {})
        },
        body: options.body ? JSON.stringify(options.body) : undefined
    });

    if (response.status === 401 || response.status === 403) {
        alert("Session expired. Please login again.");
        localStorage.clear();
        window.location.href = "login.html";
        return;
    }

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "API request failed");
    }

    return response.json();
}

function isLoggedIn() {
    return !!localStorage.getItem("accessToken");
}

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

function getAdminName() {
    return localStorage.getItem("fullName") || "Admin";
}