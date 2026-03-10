
        // ================= PASSWORD PATTERN =================

        const passwordPattern =
            /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\S+$).{8,20}$/;

        const password = document.getElementById("password");
        const confirmPassword = document.getElementById("confirmPassword");

        const passwordError = document.getElementById("passwordError");
        const confirmError = document.getElementById("confirmError");

        
        // ================= PASSWORD VALIDATION =================

        password.addEventListener("input", () => {

            const value = password.value;

            if (!passwordPattern.test(value)) {

                passwordError.textContent =
                    "Password must be 8–20 chars, include uppercase, lowercase, number, special character, and no spaces.";

            } else {

                passwordError.textContent = "";

            }

            validateConfirmPassword();

        });


        // ================= CONFIRM PASSWORD MATCH =================

        confirmPassword.addEventListener("input", validateConfirmPassword);


        function validateConfirmPassword() {

            if (confirmPassword.value === "") {

                confirmError.textContent = "";

                return;

            }

            if (password.value !== confirmPassword.value) {

                confirmError.textContent = "Passwords do not match";

            } else {

                confirmError.textContent = "";

            }

        }


        // ================= FORM VALIDATION =================
        const form = document.getElementById("registerForm");
        const messageDiv = document.getElementById("message");
        const registerBtn = document.getElementById("registerBtn");

        form.addEventListener("submit", async function (e) {

            e.preventDefault();

            messageDiv.innerHTML = "";

            // ================= PASSWORD VALIDATION =================

            if (!passwordPattern.test(password.value)) {

                passwordError.textContent = "Invalid password format";
                password.focus();
                return;

            }

            if (password.value !== confirmPassword.value) {

                confirmError.textContent = "Passwords do not match";
                confirmPassword.focus();
                return;

            }

            // ================= DISABLE BUTTON =================

            registerBtn.disabled = true;
            registerBtn.innerHTML =
                `<span class="spinner-border spinner-border-sm"></span> Registering...`;

            // ================= CREATE USER OBJECT =================

            const employee = {

                fullname: fullName.value.trim(),
                username: username.value.trim(),
                email: email.value.trim(),
                password: password.value.trim(),
                phone: phone.value.trim(),
                role: "JOB_SEEKER"

            };

            // ================= CALL API =================
            const result = await registerUser(employee);

            if (result.ok) {

                messageDiv.innerHTML =
                    `<div class="alert alert-success">
        Registration successful
    </div>`;

            }
            else {

                messageDiv.innerHTML =
                    `<div class="alert alert-danger">
        ${result.message}
    </div>`;

            }
            // ================= ENABLE BUTTON AGAIN =================

            registerBtn.disabled = false;
            registerBtn.innerHTML = "Register";

        });
