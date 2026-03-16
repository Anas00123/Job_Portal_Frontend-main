const BASE_URL = "https://malcom-isopentyl-malvina.ngrok-free.dev";

function isLoggedIn() {
    return localStorage.getItem("loggedIn") === "true";
}

async function apiFetch(endpoint, options = {}) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: options.method || "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
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
    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

function logout() {
    fetch(`${BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include"
    }).finally(() => {
        localStorage.clear();
        window.location.href = "login.html";
    });
}

function getAdminName() {
    return localStorage.getItem("fullName") || "Admin";
}

function getToken() {
    return null; // token is in HttpOnly cookie, not accessible via JS
}