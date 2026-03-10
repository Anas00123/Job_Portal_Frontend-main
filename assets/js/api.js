const BASE_URL = "https://malcom-isopentyl-malvina.ngrok-free.dev";

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

    // If session expired
    if (response.status === 401 || response.status === 403) {
        alert("Session expired. Please login again.");
        window.location.href = "login.html";
        return;
    }

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "API request failed");
    }

    return response.json();
}