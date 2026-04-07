// ===== Multi-step Admission Form JS =====
const steps = document.querySelectorAll(".form-step");
const nextBtns = document.querySelectorAll(".next-btn");
const prevBtns = document.querySelectorAll(".prev-btn");
const progress = document.querySelector(".progress");
const form = document.getElementById("multiStepForm");
const summaryDiv = document.getElementById("summary");

let currentStep = 0;

// Map input names to readable labels for summary
const labels = {
    fullname: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    dob: "Date of Birth",
    school: "School Name",
    qualification: "Qualification",
    year: "Year of Graduation",
    guardian: "Guardian Name",
    guardianPhone: "Guardian Phone"
};

// Show Step 
function showStep(step) {
    steps.forEach((s, i) => s.classList.remove("active"));
    steps[step].classList.add("active");
    updateProgress();
    saveToLocalStorage();

    // If confirmation step, fill summary
    if (step === steps.length - 1) displaySummary();
}

//  Update Progress
function updateProgress() {
    const percent = (currentStep / (steps.length - 1)) * 100;
    progress.style.width = percent + "%";
}

// Validate Step 
function validateStep(step) {
    const inputs = steps[step].querySelectorAll("input");
    let valid = true;
    inputs.forEach(input => {
        const value = input.value.trim();
        const errorDiv = steps[step].querySelector(".error-message");
        if (!value) {
            input.classList.add("error");
            if (errorDiv) errorDiv.textContent = "This field is required";
            valid = false;
            return;
        }

        // Email validation
        if (input.type === "email") {
            const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!pattern.test(value)) {
                input.classList.add("error");
                if (errorDiv) errorDiv.textContent = input.title || "Invalid email";
                valid = false;
            } else input.classList.remove("error");
        }

        // Number validation
        else if (input.type === "number") {
            if (isNaN(value) || value <= 0) {
                input.classList.add("error");
                if (errorDiv) errorDiv.textContent = "Enter a valid number";
                valid = false;
            } else input.classList.remove("error");
        }

        // Date of Birth: no future date
        else if (input.type === "date") {
            const today = new Date();
            const dob = new Date(value);
            if (dob > today) {
                input.classList.add("error");
                if (errorDiv) errorDiv.textContent = "Date cannot be in the future";
                valid = false;
            } else input.classList.remove("error");
        }

        else {
            input.classList.remove("error");
            if (errorDiv) errorDiv.textContent = "";
        }
    });
    return valid;
}

//  Next & Previous Buttons 
nextBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        if (validateStep(currentStep) && currentStep < steps.length - 1) {
            currentStep++;
            showStep(currentStep);
        }
    });
});

prevBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        if (currentStep > 0) {
            currentStep--;
            showStep(currentStep);
        }
    });
});

// Remove Error on Typing
document.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", () => {
        input.classList.remove("error");
        saveToLocalStorage();
    });
});

// ---------------- Phone Input Restriction ----------------
document.querySelectorAll('input[name="phone"], input[name="guardianPhone"]').forEach(input => {
    input.addEventListener("input", () => {
        let value = input.value;
        if (value.startsWith("+")) {
            value = "+" + value.slice(1).replace(/\D/g, "");
        } else {
            value = value.replace(/\D/g, "");
        }
        input.value = value.slice(0, 16);
    });
});

// Local Storage
function saveToLocalStorage() {
    const data = {};
    document.querySelectorAll("input").forEach(input => {
        data[input.name] = input.value;
    });
    localStorage.setItem("admissionFormData", JSON.stringify(data));
}

function loadFromLocalStorage() {
    const data = JSON.parse(localStorage.getItem("admissionFormData") || "{}");
    document.querySelectorAll("input").forEach(input => {
        if (data[input.name]) input.value = data[input.name];
    });
}

// Display Summary
function displaySummary() {
    const data = JSON.parse(localStorage.getItem("admissionFormData") || "{}");
    let html = "<ul>";
    for (const key in data) {
        if (labels[key]) {
            html += `<li><strong>${labels[key]}:</strong> ${data[key]}</li>`;
        }
    }
    html += "</ul>";
    summaryDiv.innerHTML = html;
}

//  Form Submission
form.addEventListener("submit", (e) => {
    e.preventDefault();

    let allValid = true;
    for (let i = 0; i < steps.length - 1; i++) {
        if (!validateStep(i)) {
            allValid = false;
            currentStep = i;
            showStep(currentStep);
            break;
        }
    }

    if (allValid) {
        alert("Form submitted successfully!");

        // Clear local storage
        localStorage.removeItem("admissionFormData");

        // Reset form fields
        form.reset();

        // Reset step to first page
        currentStep = 0;
        showStep(currentStep);
    }
});

// Initialize
loadFromLocalStorage();
showStep(currentStep);