const API_BASE = "http://192.168.1.3:8080/api";
const token = localStorage.getItem("accessToken");

if (!token) {
    window.location.href = "/recruiter/recruiterLoginForm.html";
}


let currentPage = 0;
const pageSize = 5;

async function loadJobs(page = 0) {

    try {
        const response = await fetch(
            `${API_BASE}/jobs?page=${page}&size=${pageSize}`,
            {
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        if (!response.ok) throw new Error("Failed to fetch");

        const data = await response.json();

            

            document.getElementById("totalJobs").innerText = data.totalElements;

        const jobs = data.content;

        renderStats(jobs);
        renderTable(jobs);
        renderPagination(data.totalPages, page);

        currentPage = page;

    } catch (error) {
        console.error("Pagination error:", error);
    }
}
let totalPages = 0;

function renderPagination(total, page) {
    totalPages = total;
}

function nextPage() {
    if (currentPage < totalPages - 1) {
        loadJobs(currentPage + 1);
    }
}

function prevPage() {
    if (currentPage > 0) {
        loadJobs(currentPage - 1);
    }
}
document.addEventListener("DOMContentLoaded", () => {
    loadJobs(0);
});
function renderStats(jobs) {
    const active = jobs.filter(j => j.status === "OPEN").length;
    const closed = jobs.filter(j => j.status === "CLOSED").length;

    document.getElementById("activeJobs").innerText = active;
    document.getElementById("closedJobs").innerText = closed;
}

function renderTable(jobs) {
    const tbody = document.getElementById("jobsTableBody");
    tbody.innerHTML = "";

    jobs.forEach(job => {
        tbody.innerHTML += `
            <tr>
                <td>${job.title}</td>
                <td>${job.location}</td>
                <td>
                    <span class="badge ${job.status === "OPEN" ? "bg-success" : "bg-secondary"}">
                        ${job.status}
                    </span>
                </td>
                <td>
                    ${job.status === "OPEN"
                ? `<button class="btn btn-sm btn-outline-danger me-1"
                             onclick="closeJob(${job.jobId})">
                             Close
                           </button>`
                : `<button class="btn btn-sm btn-outline-success me-1"
                             onclick="reopenJob(${job.jobId})">
                             Reopen
                           </button>`
            }

                    <button class="btn btn-sm btn-outline-primary"
                        onclick="editJob(${job.jobId})">
                        Edit
                    </button>
                </td>
            </tr>
        `;
    });
}

async function closeJob(id) {
    if (!confirm("Are you sure you want to close this job?")) return;

    await fetch(`${API_BASE}/jobs/${id}/close`, {
        method: "PUT",
        headers: { "Authorization": "Bearer " + token }
    });

    loadJobs();
}

async function reopenJob(id) {
    await fetch(`${API_BASE}/jobs/${id}/reopen`, {
        method: "PUT",
        headers: { "Authorization": "Bearer " + token }
    });

    loadJobs();
}
async function editJob(id) {
    try {
        const response = await fetch(`${API_BASE}/jobs/${id}`, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!response.ok) throw new Error("Failed to fetch job");

        const job = await response.json();

        // Fill modal fields
        document.getElementById("editJobId").value = job.jobId;
        document.getElementById("editTitle").value = job.title;
        document.getElementById("editLocation").value = job.location;
        document.getElementById("editDescription").value = job.description;
        document.getElementById("editStatus").value = job.status;

        const modal = new bootstrap.Modal(document.getElementById("editJobModal"));
        modal.show();

    } catch (error) {
        console.error("Edit error:", error);
    }
}
async function updateJob() {

    const id = document.getElementById("editJobId").value;

    const updatedJob = {
        title: document.getElementById("editTitle").value,
        location: document.getElementById("editLocation").value,
        description: document.getElementById("editDescription").value,
        status: document.getElementById("editStatus").value
    };

    try {
        const response = await fetch(`${API_BASE}/jobs/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify(updatedJob)
        });

        if (!response.ok) throw new Error("Update failed");

        // Close modal
        bootstrap.Modal.getInstance(
            document.getElementById("editJobModal")
        ).hide();

        // Reload table
        loadJobs();

    } catch (error) {
        console.error("Update error:", error);
        alert("Failed to update job");
    }
}