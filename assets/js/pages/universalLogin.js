// ===============================
// UNIVERSAL LOGIN SCRIPT
// ===============================

const API_BASE = "http://192.168.1.3:8080/api";

// ================= CHECK IF ALREADY LOGGED IN =================

function checkAlreadyLoggedIn() {

    const user = JSON.parse(localStorage.getItem("user"));

    if (user && user.role) {
        redirectByRole(user.role);
    }
}
// ================= EXPECTED ROLE =================

function getExpectedRole() {

    const path = window.location.pathname;

    if (path.includes("recruiter")) return "RECRUITER";
    if (path.includes("admin")) return "ADMIN";

    return "JOB_SEEKER"; // default login page
}
// ================= REDIRECT BASED ON ROLE =================

function redirectByRole(role) {

    switch (role) {

        case "JOB_SEEKER":
            window.location.href = "/user/userDashboard.html";
            break;

        case "RECRUITER":
            window.location.href = "/recruiter/recruiterDashboard/recruiterDashboard.html";
            break;

        case "ADMIN":
            window.location.href = "/admin/adminDashboard.html";
            break;

        default:
            localStorage.clear();
            window.location.href = "/login.html";
    }
}

// ================= LOGIN USER FUNCTION =================

async function loginUser(loginData) {

    try {

        const response = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(loginData)
        });

        const result = await response.json();

        if (response.ok) {

            // Save auth data
            localStorage.setItem("accessToken", result.accessToken);
            localStorage.setItem("refreshToken", result.refreshToken);

            const user = {
                userId: result.userId,
                fullName: result.fullName,
                username: result.username,
                email: result.email,
                role: result.role
            };

            localStorage.setItem("user", JSON.stringify(user));

            return { ok: true, role: result.role };

        } else {

            return { ok: false, message: result.message || "Invalid credentials" };

        }

    } catch (error) {

        return { ok: false, message: "Server error. Try again." };

    }
}

document.addEventListener("DOMContentLoaded", function () {

    document.querySelectorAll(".toggle-password").forEach(toggle => {

        toggle.addEventListener("click", function () {

            const targetId = this.getAttribute("data-target");
            const input = document.getElementById(targetId);
            const icon = this.querySelector("i");

            if (!input) return;

            if (input.type === "password") {
                input.type = "text";
                icon.classList.remove("bi-eye-slash");
                icon.classList.add("bi-eye");
            } else {
                input.type = "password";
                icon.classList.remove("bi-eye");
                icon.classList.add("bi-eye-slash");
            }

        });

    });

});
// ================= LOGIN FORM SUBMIT =================

document.addEventListener("DOMContentLoaded", () => {

    checkAlreadyLoggedIn();

    const loginForm = document.getElementById("loginForm");
    const errorDiv = document.getElementById("errorLoginMessage");

    if (!loginForm) return;

    loginForm.addEventListener("submit", async function (e) {

        e.preventDefault();
        errorDiv.innerHTML = "";

        const loginBtn = document.getElementById("loginBtn");

        const loginData = {
            usernameOrEmail: document.getElementById("username").value.trim(),
            password: document.getElementById("password").value.trim()
        };

        // Disable button
        if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.innerHTML =
                `<span class="spinner-border spinner-border-sm"></span> Logging in...`;
        }

        const result = await loginUser(loginData);

        if (result.ok) {

            const expectedRole = getExpectedRole();

            if (result.role !== expectedRole) {

                // Wrong role login attempt
                localStorage.clear();

                errorDiv.innerHTML =
                    `<div class="alert alert-danger">
                Please use the correct login page for your role.
            </div>`;

                if (loginBtn) {
                    loginBtn.disabled = false;
                    loginBtn.innerHTML = "Login";
                }

                return;
            }

            // Correct role → proceed
            redirectByRole(result.role);
        }
        else {

            errorDiv.innerHTML =
                `<div class="alert alert-danger">
                    ${result.message}
                </div>`;

            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.innerHTML = "Login";
            }
        }

    });

});