// ================= CONFIG =================
const API_BASE_URL = "http://192.168.1.3:8080/api";

// ================= STORAGE =================
function saveAuthData(data) {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);

    const user = {
        userId: data.userId,
        fullName: data.fullName,
        email: data.email,
        role: data.role
    };

    localStorage.setItem("user", JSON.stringify(user));
}
async function clearAuthData() {

    try {

        const token = localStorage.getItem("accessToken");

        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            }
        });

        // Even if backend fails, clear local session
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

        window.location.href = "/";

    } catch (error) {

        console.error("Logout error:", error);

        // Force clear anyway
        localStorage.clear();
        window.location.href = "/";
    }
}

function getAccessToken() {
    return localStorage.getItem("accessToken");
}

function getUser() {
    return JSON.parse(localStorage.getItem("user"));
}

function isLoggedIn() {
    return !!getAccessToken();
}

// ================= ROLE GUARD =================
function protectPage(allowedRoles = []) {

    const token = getAccessToken();
    const user = getUser();

    // Not logged in
    if (!token || !user) {
        window.location.href = "/";
        return;
    }

    // Role mismatch

    if (!allowedRoles.includes(user.role)) {
        redirectDashboard(); // send to correct dashboard
        return;
    }
}

// ================= ROLE REDIRECT =================
function redirectDashboard() {

    const user = getUser();
    if (!user) return;

    switch (user.role) {

        case "RECRUITER":
            window.location.href = "/recruiter/recruiterDashboard/recruiterDashboard.html";
            break;

        case "JOB_SEEKER":
            window.location.href = "/user/userDashboard.html";
            break;

        case "ADMIN":
            window.location.href = "/admin/dashboard.html";
            break;

        default:
            clearAuthData();
            window.location.href = "/";
    }
}

// ================= AUTH FETCH =================
async function authFetch(url, options = {}) {

    const token = getAccessToken();

    if (!token) {
        window.location.href = "/loginForm.html";
        return;
    }

    options.headers = {
        ...(options.headers || {}),
        "Authorization": "Bearer " + token
    };

    const response = await fetch(url, options);

    if (response.status === 401) {
        clearAuthData();
        window.location.href = "/loginForm.html";
        return;
    }

    return response;
}

// ================= LOGOUT =================
function logout() {
    clearAuthData();
    alert("Logout Successful");
    window.location.href = "/";
}