// =======================================
// PROFILE PAGE SCRIPT (FINAL)
// =======================================

const API_BASE = "http://192.168.1.3:8080/api";
let addressId = null;
let currentAddress = null;
// =======================================
// AUTH HELPERS
// =======================================

function getToken() {
    return localStorage.getItem("accessToken");
}

function getUser() {
    return JSON.parse(localStorage.getItem("user"));
}

function authHeader() {
    return {
        Authorization: "Bearer " + getToken()
    };
}

function protectDashboard(role) {

    const token = getToken();
    const user = getUser();

    if (!token || !user || user.role !== role) {
        window.location.href = "/user/loginForm.html";
    }
}

// =======================================
// INITIALS
// =======================================

function getInitials(name) {

    if (!name) return "U";

    const parts = name.split(" ");
    return parts.length > 1
        ? parts[0][0] + parts[1][0]
        : parts[0][0];
}

// =======================================
// LOAD PROFILE
// =======================================

async function loadProfile() {

    const res = await fetch(`${API_BASE}/profile/me`, {
        headers: authHeader()
    });

    const profile = await res.json();


    const user = getUser();
    if (!user) return;

    document.getElementById("piName").innerText =
        user.fullName;

    document.getElementById("piEmail").innerText =
        user.email;

    document.getElementById("avatarBox").innerText =
        getInitials(user.fullName);

    renderAvatar(profile);
    renderResume(profile.resumeUrl);

    loadSkills();
    loadEducation();
    loadExperience();

    if (profile.address)
        document.getElementById("piAddress")
            .innerText = profile.address.addressLine;
}

// =======================================
// AVATAR
// =======================================

function renderAvatar(profile) {

    const box = document.getElementById("avatarBox");

    if (profile.profileImg) {

        box.innerHTML = `
            <img src="http://192.168.1.3:8080${profile.profileImg}"
            style="width:100%;height:100%;
            border-radius:50%;object-fit:cover">
        `;

    } else {

        const user = getUser();
        box.innerText =
            getInitials(user.fullName || user.username);
    }
}

// =======================================
// PROFILE IMAGE UPLOAD
// =======================================

document
    .getElementById("profileImageInput")
    ?.addEventListener("change", async function () {

        const file = this.files[0];
        if (!file) return;

        const fd = new FormData();
        fd.append("file", file);

        const res = await fetch(
            `${API_BASE}/profile/upload/profileimg`,
            {
                method: "POST",
                headers: authHeader(),
                body: fd
            }
        );

        if (res.ok) {
            loadProfile();
            alert("Profile photo updated");
        } else {
            alert("Upload failed");
        }
    });

// =======================================
// ADDRESS
// =======================================


async function loadAddress() {

    try {

        const res = await fetch(
            `${API_BASE}/profile/address`,
            { headers: authHeader() }
        );

        if (!res.ok) {
            document.getElementById("piAddress")
                .innerHTML = "Not Added";
            return;
        }

        const addr = await res.json();

        console.log(addr);
        addressId = addr.address_id;
        currentAddress = addr;

        document.getElementById("piAddress").innerHTML = `
            ${addr.address_line1 || ""}<br>
            ${addr.address_line2 || ""}<br>
            ${addr.city || ""}, ${addr.state || ""}<br>
            ${addr.country || ""} - ${addr.pincode || ""}
        `;

    } catch {
        document.getElementById("piAddress")
            .innerHTML = "Not Added";
    }
}

function openAddressModal() {

    if (!currentAddress) return;

    document.getElementById("addrLine1").value =
        currentAddress.address_line1 || "";

    document.getElementById("addrLine2").value =
        currentAddress.address_line2 || "";

    document.getElementById("addrCity").value =
        currentAddress.city || "";

    document.getElementById("addrState").value =
        currentAddress.state || "";

    document.getElementById("addrCountry").value =
        currentAddress.country || "";

    document.getElementById("addrPincode").value =
        currentAddress.pincode || "";

    new bootstrap.Modal(
        document.getElementById("addressModal")
    ).show();
}

async function saveAddress() {

    const address_line1 =
        document.getElementById("addrLine1").value;
    const address_line2 =
        document.getElementById("addrLine2").value;

    const city =
        document.getElementById("addrCity").value;

    const state =
        document.getElementById("addrState").value;

    const country =
        document.getElementById("addrCountry").value;

    const pincode =
        document.getElementById("addrPincode").value;

    if (!addressId) {
        alert("Address not loaded");
        return;
    }

    const payload = {
        address_line1,
        address_line2,
        city,
        state,
        country,
        pincode
    };

    await fetch(
        `${API_BASE}/profile/address`,
        {
            method: "POST",
            headers: {
                ...authHeader(),
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        }
    );

    bootstrap.Modal
        .getInstance(
            document.getElementById("addressModal")
        ).hide();

    loadAddress(addressId);
}



document.addEventListener("DOMContentLoaded", () => {

    const user = getUser();

    // assuming address id = user.addressId
    loadAddress(user.addressId);

});
// =======================================
// RESUME
// =======================================

function renderResume(path) {

    const nameEl = document.getElementById("resumeName");
    const download =
        document.getElementById("downloadResume");

    if (!path) {
        nameEl.innerText = "No Resume Uploaded";
        download.style.display = "none";
        return;
    }

    const file = path.split("/").pop()
        .replace(/^[a-f0-9-]{36}_/, '');

    nameEl.innerText = file;

    download.href =
        `http://192.168.1.3:8080${path}`;
}

document
    .getElementById("resumeInput")
    ?.addEventListener("change", async function () {

        const file = this.files[0];
        if (!file) return;

        const fd = new FormData();
        fd.append("file", file);

        const res = await fetch(
            `${API_BASE}/profile/upload/resume`,
            {
                method: "POST",
                headers: authHeader(),
                body: fd
            }
        );

        if (res.ok) {
            const data = await res.json();
            renderResume(data.resumeUrl);
            alert("Resume updated");
        } else {
            alert("Upload failed");
        }
    });

// =======================================
// SKILLS
// =======================================
// =======================================
// SAVE SKILL (ADD)
// =======================================

async function saveSkill() {

    const skillName =
        document.getElementById("skillName").value.trim();


    try {

        const response = await fetch(
            `${API_BASE}/profile/skills`,
            {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + getToken(),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    skill_name: skillName
                })
            }
        );

        if (!response.ok)
            throw new Error("Skill add failed");

        // ✅ close modal
        bootstrap.Modal
            .getInstance(
                document.getElementById("skillModal")
            ).hide();

        document.getElementById("skillName").value = "";

        loadSkills(); // reload skills

    } catch (err) {
        console.error(err);
        alert("Unable to add skill");
    }
}
function openSkillModal() {
    new bootstrap.Modal(
        document.getElementById("skillModal")
    ).show();
}


async function loadSkills() {

    const res = await fetch(
        `${API_BASE}/profile/skills`,
        { headers: authHeader() }
    );

    const skills = await res.json();

    const container =
        document.getElementById("skillContainer");

    container.innerHTML = "";

    skills.forEach(skill => {

        container.innerHTML += `
    <span class="skill-badge">
        ${skill.skillName}
        <i class="bi bi-x ms-1"
           onclick="deleteSkill(${skill.skillId})">
        </i>
    </span>
`;
    });
}

async function deleteSkill(id) {

    const confirmDelete =
        confirm("Are you sure you want to delete this skill?");

    // ❌ User clicked Cancel
    if (!confirmDelete) return;

    try {

        const response = await fetch(
            `${API_BASE}/profile/skills/${id}`,
            {
                method: "DELETE",
                headers: authHeader()
            }
        );

        if (!response.ok)
            throw new Error("Delete failed");

        loadSkills();

    } catch (err) {
        console.error(err);
        alert("Unable to delete skill");
    }
}
// =======================================
// ADDRESS
// =======================================

function openAddressModal() {
    new bootstrap.Modal(
        document.getElementById("addressModal")
    ).show();
}

async function saveAddress() {

    const address =
        document.getElementById("addressInput").value;

    const profile =
        await (await fetch(
            `${API_BASE}/profile/me`,
            { headers: authHeader() }
        )).json();

    await fetch(
        `${API_BASE}/profile/address/${profile.address.addressId}`,
        {
            method: "PUT",
            headers: {
                ...authHeader(),
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                addressLine: address
            })
        }
    );

    loadProfile();
}

// =======================================
// EXPERIENCE
// =======================================


async function loadExperience() {

    const res = await fetch(
        `${API_BASE}/profile/experience`,
        { headers: authHeader() }
    );

    const list = await res.json();

    const container =
        document.getElementById("experienceContainer");

    container.innerHTML = "";

    if (!list || list.length === 0) {
        container.innerHTML =
            "<p class='text-muted'>No experience added</p>";
        return;
    }

    list.forEach(exp => {

        container.innerHTML += `
        <div class="dashboard-card mb-3">

            <div class="d-flex justify-content-between">

                <div>

                    <h6 class="mb-1">
                        ${exp.job_title || "-"}
                    </h6>

                    <div class="text-muted">
                        ${exp.company_name || "-"}
                    </div>

                    <small>
                        ${exp.employment_type || ""}
                    </small>
<div class="small text-muted mt-1">

    ${formatDate(exp.start_date)}
    -
    ${exp.isCurrentJob
                ? "Present"
                : formatDate(exp.end_date)
            }

    • 
    ${calculateExperienceDuration(
                exp.start_date,
                exp.end_date,
                exp.isCurrentJob
            )}

</div>
                </div>

                <div>
                    <button class="btn btn-sm btn-outline-teal"
                        onclick="editExperience(${exp.exp_id})">
                        Edit
                    </button>

                    <button class="btn btn-sm btn-outline-danger"
                        onclick="deleteExperience(${exp.exp_id})">
                        Delete
                    </button>
                </div>

            </div>

        </div>
        `;
    });
}
function openExperienceModal(exp = null) {

    const modal =
        new bootstrap.Modal(
            document.getElementById("experienceModal")
        );

    if (exp) {

        // EDIT MODE
        document.getElementById("expId").value =
            exp.exp_id;

        document.getElementById("jobTitle").value =
            exp.job_title || "";

        document.getElementById("companyName").value =
            exp.company_name || "";

        document.getElementById("employmentType").value =
            exp.employment_type || "FULL TIME";

        document.getElementById("startDate").value =
            exp.start_date || "";

        document.getElementById("endDate").value =
            exp.end_date || "";

        document.getElementById("currentJob").checked =
            exp.isCurrentJob || false;

    } else {

        document.getElementById("expId").value = "";
        document.getElementById("jobTitle").value = "";
        document.getElementById("companyName").value = "";
        document.getElementById("employmentType").value = "FULL TIME";
        document.getElementById("startDate").value = "";
        document.getElementById("endDate").value = "";
        document.getElementById("currentJob").checked = false;
    }

    modal.show();
}
function calculateExperienceDuration(startDate, endDate, isCurrent) {

    if (!startDate) return "";

    const start = new Date(startDate);
    const end = isCurrent || !endDate
        ? new Date()
        : new Date(endDate);

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();

    if (months < 0) {
        years--;
        months += 12;
    }

    let result = "";

    if (years > 0)
        result += `${years} yr${years > 1 ? "s" : ""} `;

    if (months > 0)
        result += `${months} month${months > 1 ? "s" : ""}`;

    return result.trim() || "Less than a month";
}
function formatDate(date) {

    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric"
    });
}
async function saveExperience() {

    const id =
        document.getElementById("expId").value;

    const payload = {

        job_title:
            document.getElementById("jobTitle").value,

        company_name:
            document.getElementById("companyName").value,

        employment_type:
            document.getElementById("employmentType").value,

        start_date:
            document.getElementById("startDate").value,

        end_date:
            document.getElementById("endDate").value,

        isCurrentJob:
            document.getElementById("currentJob").checked
    };

    const url = id
        ? `${API_BASE}/profile/experience/${id}`
        : `${API_BASE}/profile/experience`;

    const method = id ? "PUT" : "POST";

    await fetch(url, {
        method,
        headers: {
            ...authHeader(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    bootstrap.Modal
        .getInstance(
            document.getElementById("experienceModal")
        ).hide();

    loadExperience();
}
async function deleteExperience(id) {

    if (!confirm("Delete this experience?"))
        return;

    await fetch(
        `${API_BASE}/profile/experience/${id}`,
        {
            method: "DELETE",
            headers: authHeader()
        }
    );

    loadExperience();
}
async function editExperience(id) {

    try {

        const res = await fetch(
            `${API_BASE}/profile/experience`,
            { headers: authHeader() }
        );

        const list = await res.json();

        // find selected experience
        const exp =
            list.find(e => e.exp_id === id);

        if (!exp) {
            alert("Experience not found");
            return;
        }

        // ✅ open modal with data
        openExperienceModal(exp);

    } catch (err) {
        console.error(err);
        alert("Unable to load experience");
    }
}
// =======================================
// EDUCATION
// =======================================
function editEducation(edu) {
    openEducationModal(edu);
}
function openEducationModal(edu = null) {

    const modal =
        new bootstrap.Modal(
            document.getElementById("educationModal")
        );

    if (edu) {

        // ✅ EDIT MODE
        document.getElementById("educationId").value =
            edu.edu_id;

        document.getElementById("boardName").value =
            edu.board_name || "";

        document.getElementById("degree").value =
            edu.degree || "";

        document.getElementById("specialization").value =
            edu.specialization || "";

        document.getElementById("institute").value =
            edu.institute_name || "";

        document.getElementById("eduStart").value =
            edu.start_year || "";

        document.getElementById("eduEnd").value =
            edu.end_year || "";

        document.getElementById("percentage").value =
            edu.percentage || "";

    } else {

        // ✅ ADD MODE RESET
        document
            .querySelectorAll("#educationModal input")
            .forEach(i => i.value = "");

        document.getElementById("educationId").value = "";
    }

    modal.show();
}
async function saveEducation() {

    const id =
        document.getElementById("educationId").value;

    const payload = {

        board_name:
            document.getElementById("boardName").value,

        degree:
            document.getElementById("degree").value,

        specialization:
            document.getElementById("specialization").value,

        institute_name:
            document.getElementById("institute").value,

        start_year:
            document.getElementById("eduStart").value,

        end_year:
            document.getElementById("eduEnd").value,

        percentage:
            document.getElementById("percentage").value
    };

    const url = id
        ? `${API_BASE}/profile/education/${id}`
        : `${API_BASE}/profile/education`;

    const method = id ? "PUT" : "POST";

    await fetch(url, {
        method,
        headers: {
            ...authHeader(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    bootstrap.Modal
        .getInstance(
            document.getElementById("educationModal")
        ).hide();

    loadEducation();
}
async function deleteEducation(id) {

    if (!confirm("Delete this education?"))
        return;

    await fetch(
        `${API_BASE}/profile/education/${id}`,
        {
            method: "DELETE",
            headers: authHeader()
        }
    );

    loadEducation();
}

async function loadEducation() {

    const res = await fetch(
        `${API_BASE}/profile/education`,
        { headers: authHeader() }
    );

    const list = await res.json();

    const container =
        document.getElementById("educationContainer");

    container.innerHTML = "";

    if (!list || list.length === 0) {
        container.innerHTML =
            "<p class='text-muted'>No education added</p>";
        return;
    }

    list.forEach(edu => {

        container.innerHTML += `
        <div class="dashboard-card my-3">

            <div class="d-flex justify-content-between">

                <div>

                    <h6 class="mb-1">
                        ${edu.degree || "-"}
                        ${edu.specialization
                ? `(${edu.specialization})`
                : ""}
                    </h6>

                    <div class="text-muted">
                        ${edu.institute_name || "-"}
                    </div>

                    <small>
                        Board : ${edu.board_name || "-"}
                    </small>

                    <div class="small text-muted mt-1">
                        ${edu.start_year || "-"}
                        -
                        ${edu.end_year || "Present"}
                    </div>

                    <div class="mt-1">
                        Percentage : 
                        <b>${edu.percentage || "-"}</b>
                    </div>

                </div>

                <div>
                    <button class="btn btn-sm btn-outline-teal"
                        onclick='editEducation(${JSON.stringify(edu)})'>
                        Edit
                    </button>

                    <button class="btn btn-sm btn-outline-danger"
                        onclick="deleteEducation(${edu.edu_id})">
                        Delete
                    </button>
                </div>

            </div>

        </div>
        `;
    });
}
// =======================================
// INIT
// =======================================

document.addEventListener("DOMContentLoaded", () => {

    protectDashboard("JOB_SEEKER");
    loadProfile();

});