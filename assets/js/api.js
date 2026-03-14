// ✅ Use loggedIn flag instead of accessToken
function isLoggedIn() {
    return localStorage.getItem("loggedIn") === "true";
}

// ✅ Remove Authorization header — cookie is sent automatically
async function apiFetch(endpoint, options = {}) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: options.method || "GET",
        credentials: "include",          // ← sends HttpOnly cookie automatically
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

// ✅ Proper logout that clears the server-side cookie too
function logout() {
    fetch(`${BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include"
    }).finally(() => {
        localStorage.clear();
        window.location.href = "login.html";
    });
}