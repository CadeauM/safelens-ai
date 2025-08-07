// This is the address of our running backend server.
const API_URL = "http://127.0.0.1:8000";


document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page-content');
    const ctaButton = document.querySelector('.cta-button');

    function showPage(pageId) {
        pages.forEach(page => page.classList.remove('active'));
        navLinks.forEach(link => link.classList.remove('active'));
        document.querySelector(pageId)?.classList.add('active');
        document.querySelector(`a[href="${pageId}"]`)?.classList.add('active');
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(link.getAttribute('href'));
        });
    });

    ctaButton?.addEventListener('click', () => {
        showPage('#' + ctaButton.getAttribute('data-target'));
    });

    showPage('#home');
});



const textInput = document.getElementById('text-input');
const analyzeTextBtn = document.getElementById('analyze-text-btn');
const textResultArea = document.getElementById('text-result');

const emergencyBtn = document.getElementById('panic-btn');
const settingsTriggerPhrase = document.getElementById('trigger-phrase');
const settingsContactPhone = document.getElementById('trusted-contact');
const saveSettingsBtn = document.getElementById('save-settings-btn');

// Text Analysis Logic
analyzeTextBtn.addEventListener('click', async () => {
    const textToAnalyze = textInput.value;
    const triggerPhrase = settingsTriggerPhrase.value;
    const contactPhone = settingsContactPhone.value;

    // validation
    if (!textToAnalyze) {
        textResultArea.innerText = "Please enter some text to analyze.";
        return;
    }

    // Show a loading message
    textResultArea.innerText = "Analyzing...";
    textResultArea.className = 'analysis-result'; // Reset color

    //main of API
    try {
        const formData = new FormData();
        formData.append('text', textToAnalyze);
        
        const response = await fetch(`${API_URL}/analyze-text`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        
        if (triggerPhrase && textToAnalyze.toLowerCase().includes(triggerPhrase.toLowerCase())) {
        
            sendManualAlert(`Trigger phrase "${triggerPhrase}" detected.`);
            textResultArea.innerText = "TRIGGER PHRASE DETECTED! Sending alert...";
            textResultArea.className = 'analysis-result high-risk';
        } else {
            // Display the regular analysis result
            const analysis = result.analysis;
            displayAnalysisResult(textResultArea, analysis);
        }

    } catch (error) {
        console.error("Error analyzing text:", error);
        textResultArea.innerText = "Could not connect to the analysis service.";
    }
});

// Helper function to display results consistently
function displayAnalysisResult(element, analysis) {
    element.innerText = `Result: ${analysis.label} (Score: ${analysis.score})\nKeywords: ${analysis.keywords_detected}`;
    

    element.className = 'analysis-result';
    if (analysis.label === "High Risk") {
        element.classList.add('high-risk');
    } else if (analysis.label === "Warning") {
        element.classList.add('warning');
    } else {
        element.classList.add('safe');
    }
}

// Alert Logic
emergencyBtn.addEventListener('click', () => {
    sendManualAlert("Manual emergency button was pressed.");
});

async function sendManualAlert(triggerMessage) {
    const contactPhone = settingsContactPhone.value;
    
    // Basic validation
    if (!contactPhone) {
        alert("Please set a trusted contact's phone number in the Settings page first!");
        return;
    }
    
    console.log(`Sending alert to ${contactPhone} because: ${triggerMessage}`);


    try {
        const formData = new FormData();
        formData.append('contact_phone', contactPhone);
        formData.append('trigger_message', triggerMessage);

        const response = await fetch(`${API_URL}/send-alert`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Alert API response:", result);

        alert("Emergency Alert Sent! Your trusted contact has been notified.");

    } catch (error) {
        console.error("Error sending alert:", error);
        alert("Could not send the alert. Please check your connection or contact help directly.");
    }
}