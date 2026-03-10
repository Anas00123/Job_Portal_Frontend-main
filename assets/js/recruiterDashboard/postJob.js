
const API_BASE = "http://192.168.1.3:8080/api";
const token = localStorage.getItem("accessToken");

if (!token) {
    window.location.href = "/recruiter/recruiterLoginForm.html";
}


document.getElementById("postJobForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const submitBtn = document.getElementById("submitBtn");
    const messageBox = document.getElementById("jobMessage");

    submitBtn.disabled = true;
    submitBtn.innerHTML = "Publishing...";

    const jobData = {
        title: document.getElementById("title").value.trim(),
        description: document.getElementById("description").value.trim(),
        location: document.getElementById("location").value.trim(),
        salary: parseFloat(document.getElementById("salary").value),
        categoryId: parseInt(document.getElementById("categoryId").value)
    };

    try {
        const response = await fetch(`${API_BASE}/jobs`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("accessToken")
            },
            body: JSON.stringify(jobData)
        });

        if (!response.ok) {
            throw new Error("Failed to post job");
        }

        const result = await response.json();

        messageBox.innerHTML = `
            <div class="alert alert-success">
                ✅ Job Posted Successfully! <br>
                <strong>${result.title}</strong> is now ${result.status}
            </div>
        `;

        document.getElementById("postJobForm").reset();

    } catch (error) {

        messageBox.innerHTML = `
            <div class="alert alert-danger">
                ❌ Error posting job. Please try again.
            </div>
        `;

    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="bi bi-check-circle me-1"></i> Publish Job`;
    }

});