const API_BASE = "http://192.168.1.3:8080/api";
const token = localStorage.getItem("accessToken");

if (!token) {
    window.location.href = "/login.html";
}
document.addEventListener("DOMContentLoaded", () => {

    loadUser();
    loadDashboard();
    loadJobCounts(); 
    setupLogout();

});

function loadUser() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
        document.getElementById("recruiterName").innerText = user.fullName;
    }
}

let currentPage = 0;
const pageSize = 5;

async function loadDashboard(page = 0) {
    try {

        const response = await fetch(
            `${API_BASE}/jobs?page=${page}&size=${pageSize}`,
            {
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        if (!response.ok) throw new Error("Failed to fetch jobs");

        const data = await response.json();

        

        const jobs = data.content;

        loadRecentJobs(jobs);
        generateChart(jobs);

        renderPagination(data.totalPages, data.number);

        currentPage = data.number;

    } catch (error) {
        console.error("Dashboard Error:", error);
    }
}

function updateKPIs(jobs) {

    const activeJobs = jobs.filter(j => j.status === "OPEN").length;
    const closedJobs = jobs.filter(j => j.status === "CLOSED").length;
    const totalJobs = jobs.length;

    const currentMonth = new Date().getMonth();

    const monthlyJobs = jobs.filter(j =>
        new Date(j.createdAt).getMonth() === currentMonth
    ).length;

    document.getElementById("activeJobsCount").innerText = activeJobs;
    document.getElementById("closedJobsCount").innerText = closedJobs;
    document.getElementById("totalJobsCount").innerText = totalJobs;
    document.getElementById("monthlyJobsCount").innerText = monthlyJobs;
}

function loadRecentJobs(jobs) {

    const tbody = document.getElementById("recentJobsBody");
    tbody.innerHTML = "";

    jobs.slice(0, 5).forEach(job => {
        tbody.innerHTML += `
            <tr>
                <td>${job.title}</td>
                <td>${job.categoryName}</td>
                <td>${job.location}</td>
                <td>
                    <span class="badge ${job.status === "OPEN" ? "bg-success" : "bg-secondary"}">
                        ${job.status}
                    </span>
                </td>
                <td>${new Date(job.createdAt).toLocaleDateString()}</td>
            </tr>
        `;
    });
}
// ============================
// LOAD JOB COUNTS
// ============================
async function loadJobCounts() {

    try {

        const response = await fetch(`${API_BASE}/jobs/jobcount`, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!response.ok) throw new Error("Failed to fetch job counts");

        const data = await response.json();
console.log(data);
        document.getElementById("totalJobsCount").innerText = data.totalJobs || 0;
        document.getElementById("activeJobsCount").innerText = data.openJobs || 0;
        document.getElementById("closedJobsCount").innerText = data.closedJobs || 0;
        document.getElementById("monthlyJobsCount").innerText = data.monthlyJobs || 0;

    } catch (error) {
        console.error("Job count error:", error);
    }
}
let jobChartInstance;

function generateChart(jobs) {

    const ctx = document.getElementById("jobChart").getContext("2d");

    if (jobChartInstance) {
        jobChartInstance.destroy();
    }

    const labels = jobs.map(j => j.title);
    const data = jobs.map((_, index) => index + 1);

    jobChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Jobs Posted",
                data: data,
                backgroundColor: "#18a99c"
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

function setupLogout() {
    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/recruiter/recruiterLoginForm.html";
    });
}