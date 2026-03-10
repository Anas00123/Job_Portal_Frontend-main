// =======================================
// USER DASHBOARD DYNAMIC SCRIPT (FINAL)
// =======================================

const API_BASE = "http://192.168.1.3:8080/api";

// =======================================
// AUTH HELPERS
// =======================================

function getToken() {
    return localStorage.getItem("accessToken");
}

function getUser() {
    return JSON.parse(localStorage.getItem("user"));
}

function protectDashboard(expectedRole) {

    const token = localStorage.getItem("accessToken");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user || user.role !== expectedRole) {
        window.location.href = "/user/loginForm.html";
    }

}

// =======================================
// INITIALS GENERATOR
// =======================================

function getInitials(name) {

    if (!name) return "U";

    const parts = name.trim().split(" ");

    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }

    return (
        parts[0].charAt(0) +
        parts[parts.length - 1].charAt(0)
    ).toUpperCase();
}

// =======================================
// LOAD BASIC USER INFO
// =======================================

function loadBasicUserInfo() {

    const user = getUser();
    if (!user) return;

    const displayName = user.fullName || user.username;

    const navUsername = document.getElementById("navUsername");
    if (navUsername) navUsername.innerText = displayName;

    const profileName = document.querySelector(".profile-name");
    if (profileName) profileName.innerText = displayName;
}

// =======================================
// FETCH PROFILE DATA
// =======================================

async function loadProfileDetails() {

    try {

        const response = await fetch(`${API_BASE}/profile/me`, {
            headers: {
                "Authorization": "Bearer " + getToken()
            }
        });

        if (!response.ok) return;

        const profile = await response.json();

        renderAvatar(profile);
        renderExperience(profile.experience);
        renderEducation(profile.education);
        renderSkills(profile.skills);
        renderResume(profile.resumeUrl);

    } catch (err) {
        console.error("Profile load error:", err);
    }
}

// =======================================
// AVATAR RENDER (IMAGE OR INITIALS)
// =======================================

function renderAvatar(profile) {

    const user = getUser();
    if (!user) return;

    const displayName = user.fullName || user.username;
    const initials = getInitials(displayName);

    const avatars = [
        document.getElementById("profileAvatar"),
        document.getElementById("navAvatar"),
        document.getElementById("mobileAvatar")
    ];

    avatars.forEach(el => {

        if (!el) return;

        if (profile.profileImg) {

            el.innerHTML = `
                <img src="http://192.168.1.3:8080${profile.profileImg}"
                     alt="Profile"
                     style="width:100%; height:100%; object-fit:cover; border-radius:50%;">
            `;

        } else {

            el.innerText = initials;

        }

    });
}

// =======================================
// EXPERIENCE RENDER
// =======================================

function renderExperience(experiences) {

    const expElement = document.getElementById("profileExperience");
    if (!expElement) return;

    if (!experiences || experiences.length === 0) {
        expElement.innerText = "Fresher";
        return;
    }

    const { job_title, company_name } = experiences[0];

    expElement.innerText =
        job_title && company_name
            ? `${job_title} at ${company_name}`
            : job_title || company_name || "Fresher";
}

// =======================================
// EDUCATION RENDER
// =======================================

function renderEducation(educationList) {

    const eduElement = document.getElementById("profileEducation");
    if (!eduElement) return;

    if (!educationList || educationList.length === 0) {
        eduElement.innerText = "Add Education";
        return;
    }

    const { degree, specialization, institute_name } = educationList[0];

    eduElement.innerText =
        degree && specialization
            ? `${degree} (${specialization}) - ${institute_name}`
            : institute_name || degree || "Education Added";
}

// =======================================
// SKILLS RENDER
// =======================================

function renderSkills(skills) {

    const container = document.getElementById("profileSkillsContainer");
    if (!container) return;

    container.innerHTML = "";

    if (!skills || skills.length === 0) return;

    const wrapper = document.createElement("div");
    wrapper.className = "job-tags mt-2";

    skills.forEach(skill => {

        const span = document.createElement("span");
        span.className = "badge me-1";

        span.innerText = skill.skillName || skill;

        wrapper.appendChild(span);
    });

    container.appendChild(wrapper);
}

// ============================
// LOAD RECOMMENDED JOBS
// ============================
async function loadRecommendedJobs(page = 0, size = 5) {

    const container = document.getElementById("recommendedJobsContainer");
    const jobCount = document.getElementById("jobCount");

    if (!container) return;

    try {

        const response = await fetch(
            `${API_BASE}/jobs/openjobs?page=${page}&size=${size}`,
            {
                headers: {
                    "Authorization": "Bearer " + getToken()
                }
            }
        );

        if (!response.ok) {
            container.innerHTML = "<p>No jobs found</p>";
            return;
        }

        const data = await response.json();

        // 🔥 IMPORTANT CHANGE
        const jobs = data.content;
        const totalElements = data.totalElements;

        container.innerHTML = "";

        if (!jobs || jobs.length === 0) {
            container.innerHTML = "<p>No recommended jobs available</p>";
            if (jobCount) jobCount.innerText = 0;
            return;
        }

        if (jobCount) jobCount.innerText = totalElements;

        jobs.forEach(job => {

            const jobCard = document.createElement("div");
            jobCard.className = "job-card";

            jobCard.innerHTML = `
                <div class="job-title">
                    ${job.title || ''}
                </div>

                <div class="job-company">
                    ${job.companyName || ''} • ${job.location || ''}
                </div>

                <div class="job-tags mt-2">
                    <span>${job.categoryName || ''}</span>
                    <span class="${job.status === 'CLOSED'
                    ? 'bg-danger text-white'
                    : 'bg-success text-white'
                }">
                        ${job.status || ''}
                    </span>
                </div>

                <div class="mt-2 text-muted small">
                    Posted on ${job.createdAt ? formatDate(job.createdAt) : ''}
                </div>

                <div class="mt-3 d-flex justify-content-between align-items-center">
                    <div class="text-muted">
                        ₹ ${formatSalary(job.salary)}
                    </div>
                    
                    <button 
                        class="apply-btn"
                        ${job.status === 'CLOSED' ? 'disabled' : ''}
                        onclick="applyJob(${job.jobId})">
                        Apply
                    </button>
                </div>
            `;

            container.appendChild(jobCard);
        });

    } catch (error) {
        console.error("Recommended jobs error:", error);
        container.innerHTML = "<p>Something went wrong</p>";
    }
}

// Format Salary
function formatSalary(salary) {

    if (!salary) return "Not disclosed";

    return salary.toLocaleString("en-IN");
}


// Format Date
function formatDate(dateString) {

    const date = new Date(dateString);

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function cleanResumeFileName(fileName) {
    if (!fileName) return "";

    // Remove UUID (first 36 characters + underscore)
    return fileName.replace(/^[a-f0-9-]{36}_/, '');
}


function renderResume(resumePath) {

    const resumeNameEl = document.getElementById("resumeFileName");
    const downloadBtn = document.querySelector(".download-btn");
    const actionText = document.getElementById("resumeActionText");

    if (!resumeNameEl) return;

    // ❌ NO RESUME
    if (!resumePath) {

        resumeNameEl.innerText = "No Resume Uploaded";

        if (downloadBtn)
            downloadBtn.style.display = "none";

        if (actionText)
            actionText.innerText = "Upload Resume";

        return;
    }

    // ✅ RESUME EXISTS
    const fileName = resumePath.split("/").pop()
        .replace(/^[a-f0-9-]{36}_/, '');

    resumeNameEl.innerText = fileName;

    if (downloadBtn) {
        downloadBtn.href =
            `http://192.168.1.3:8080${resumePath}`;
    }

    if (actionText)
        actionText.innerText = "Update Resume";
}
// ============================
// RESUME UPLOAD
// ============================

document
    .getElementById("resumeInput")
    ?.addEventListener("change", async function () {

        const file = this.files[0];
        if (!file) return;

        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];

        if (!allowedTypes.includes(file.type)) {
            alert("Only PDF/DOC/DOCX allowed");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("Max file size 5MB");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        try {

            const response = await fetch(
                `${API_BASE}/profile/upload/resume`,
                {
                    method: "POST",   // backend replaces automatically
                    headers: {
                        Authorization: "Bearer " + getToken()
                    },
                    body: formData
                }
            );

            if (!response.ok)
                throw new Error("Upload failed");

            const data = await response.json();

            renderResume(data.resumeUrl);

            alert("Resume updated successfully");

            this.value = "";

        } catch (err) {
            console.error(err);
            alert("Upload failed");
        }
    });


async function applyJob(jobId) {

    try {

        const response = await fetch(`${API_BASE}/jobs/${jobId}`, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + getToken()
            }
        });

        if (response.ok) {
            alert("Applied Successfully!");
        }

    } catch (error) {
        console.error("Apply error:", error);
    }
}


// =======================================
// LOGOUT
// =======================================

function logout() {
    localStorage.clear();
    window.location.href = "/user/loginForm.html";
}

// =======================================
// INIT
// =======================================

document.addEventListener("DOMContentLoaded", () => {

    protectDashboard("JOB_SEEKER");
    loadBasicUserInfo();
    loadProfileDetails();
    loadRecommendedJobs();

});