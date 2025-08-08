const API_URL = ""; 
const UNLOCK_CODE = '1111';
const PANIC_CODE = '222';

// The main application object that holds all our logic.
const App = {
    // --- 2. STATE ---
    // This object holds all the data that can change during the app's use.
    state: {
        isUnlocked: false,
        trustedContacts: [],
        isRecording: false,
        mediaRecorder: null,
        audioChunks: [],
        displayValue: '0',
    },

    // This object will hold references to our HTML elements.
    elements: {},
    
    // --- 3. INITIALIZATION ---
    // This is the first function that runs when the app starts.
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.cacheDOMElements();
            this.initCoreAppListeners();
            this.updateView();
        });
    },
    
    /**
     * Finds all the important HTML elements on the page and saves them
     * in the `this.elements` object for easy access.
     */
    cacheDOMElements() {
        this.elements = {
            calculatorView: document.getElementById('calculator-view'),
            safelensView: document.getElementById('safelens-view'),
            calculatorDisplay: document.querySelector('.calculator-display'),
            calculatorKeys: document.querySelector('.calculator-keys'),
            navLinks: document.querySelectorAll('.nav-link'),
            pages: document.querySelectorAll('.page-content'),
            lockAppBtn: document.getElementById('lock-app-btn'),
            ctaButton: document.querySelector('.cta-button'),
            addContactBtn: document.getElementById('add-contact-btn'),
            contactsListDiv: document.getElementById('trusted-contacts-list'),
            newContactNameInput: document.getElementById('new-contact-name'),
            newContactPhoneInput: document.getElementById('new-contact-phone'),
            alertMessageInput: document.getElementById('alert-message'),
            recordBtn: document.getElementById('record-btn'),
            voiceStatus: document.getElementById('voice-status'),
        };
    },

    /**
     * Attaches all the interactive event listeners (clicks, etc.)
     * to the app's features.
     */
    initCoreAppListeners() {
        this.elements.navLinks.forEach(link => { link.addEventListener('click', e => { e.preventDefault(); this.showPage(link.getAttribute('href')); }); });
        this.elements.ctaButton?.addEventListener('click', () => { this.showPage('#' + this.elements.ctaButton.dataset.target); });
        this.elements.lockAppBtn.addEventListener('click', e => { e.preventDefault(); this.lockApp(); });
        
        this.initVoiceAnalysis();
        this.initContactManagement();
        this.initSupportHubTabs();
        this.initCalculator();
    },

    // --- 4. CORE APP LOGIC ---

    /**
     * Switches between the calculator disguise and the main app view.
     */
    updateView() {
        if (this.state.isUnlocked) {
            this.elements.calculatorView.classList.remove('active');
            this.elements.safelensView.classList.add('active');
            document.body.style.backgroundColor = 'var(--bg-color)';
            this.showPage('#home');
        } else {
            this.elements.safelensView.classList.remove('active');
            this.elements.calculatorView.classList.add('active');
            document.body.style.backgroundColor = '#333';
            this.resetCalculator();
        }
    },

    /**
     * Locks the app and returns to the calculator disguise.
     */
    lockApp() {
        this.state.isUnlocked = false;
        this.updateView();
    },

    /**
     * Handles navigation between the pages (Home, Voice Scan, etc.).
     * @param {string} pageId - The ID of the page to show (e.g., '#home').
     */
    showPage(pageId) {
        if (!pageId || !pageId.startsWith('#')) return;
        this.elements.pages.forEach(page => page.classList.remove('active'));
        this.elements.navLinks.forEach(link => link.classList.remove('active'));
        const targetPage = document.querySelector(pageId);
        if (targetPage) targetPage.classList.add('active');
        const targetLink = document.querySelector(`a[href="${pageId}"]`);
        if (targetLink) targetLink.classList.add('active');
    },

    /**
     * Powers the interactive tabs in the Support Hub.
     */
    initSupportHubTabs() {
        setTimeout(() => {
            const tabs = document.querySelectorAll('.action-tab');
            const panels = document.querySelectorAll('.action-panel');
            if (tabs.length === 0) return;
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const targetId = tab.dataset.target;
                    const targetPanel = document.querySelector(targetId);
                    if (!targetPanel) return;
                    tabs.forEach(t => t.classList.remove('active'));
                    panels.forEach(p => p.classList.remove('active'));
                    tab.classList.add('active');
                    targetPanel.classList.add('active');
                });
            });
        }, 100);
    },

    // --- 5. FEATURE MODULES ---

    /**
     * Handles adding and displaying the trusted contact.
     */
    initContactManagement() {
        const savedContacts = JSON.parse(localStorage.getItem('safelens_contacts') || '[]');
        this.state.trustedContacts = savedContacts;
        this.renderContacts();

        if (this.elements.addContactBtn) {
            this.elements.addContactBtn.addEventListener('click', () => {
                const name = this.elements.newContactNameInput.value.trim();
                const phone = this.elements.newContactPhoneInput.value.trim();
                if (name && phone) {
                    this.state.trustedContacts = [{ name, phone }];
                    localStorage.setItem('safelens_contacts', JSON.stringify(this.state.trustedContacts));
                    this.elements.newContactNameInput.value = '';
                    this.elements.newContactPhoneInput.value = '';
                    this.renderContacts();
                } else {
                    alert('Please provide both a name and a phone number.');
                }
            });
        }
    },

    renderContacts() {
        if (!this.elements.contactsListDiv) return;
        this.elements.contactsListDiv.innerHTML = '';
        if (this.state.trustedContacts.length > 0) {
            const contact = this.state.trustedContacts[0];
            const div = document.createElement('div');
            div.className = 'contact-entry';
            div.innerHTML = `<span>Main Contact: ${contact.name} (${contact.phone})</span>`;
            this.elements.contactsListDiv.appendChild(div);
        } else {
            this.elements.contactsListDiv.innerHTML = '<p>Please add one emergency contact.</p>';
        }
    },

    /**
     * The main panic trigger. Gets location and opens the SMS app.
     */
    triggerEmergency() {
        if (this.state.trustedContacts.length === 0) {
            alert("Please unlock the app (1111) and add an emergency contact first!");
            this.resetCalculator();
            return;
        }
        alert("Getting location to prepare your emergency message...");
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
                this.openSmsLink(locationUrl);
            },
            (error) => {
                this.openSmsLink("Location could not be found.");
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
        this.resetCalculator();
    },

    /**
     * Creates the special sms: link and opens the user's default messaging app.
     * @param {string} locationDetails - The Google Maps URL or an error message.
     */
    openSmsLink(locationDetails) {
        const primaryContact = this.state.trustedContacts[0].phone;
        const customMessage = this.elements.alertMessageInput.value || "I'm in danger, please help!";
        const messageBody = `${customMessage}\n\nMy current location: ${locationDetails}`;
        const smsLink = `sms:${primaryContact}?body=${encodeURIComponent(messageBody)}`;
        window.location.href = smsLink;
    },
    
    /**
     * Handles the manual voice recording and saves the file to the user's device.
     */
    initVoiceAnalysis() {
        if (!this.elements.recordBtn) return;
        this.elements.recordBtn.addEventListener('click', () => {
            if (!this.state.isRecording) {
                navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
                    this.state.isRecording = true;
                    this.elements.recordBtn.classList.add('recording');
                    this.elements.voiceStatus.textContent = "Recording... Tap again to stop.";
                    this.state.audioChunks = [];
                    this.state.mediaRecorder = new MediaRecorder(stream);
                    this.state.mediaRecorder.start();
                    this.state.mediaRecorder.addEventListener("dataavailable", event => { this.state.audioChunks.push(event.data); });
                    this.state.mediaRecorder.addEventListener("stop", () => { stream.getTracks().forEach(track => track.stop()); this.saveRecordingToDevice(); });
                }).catch(err => { this.elements.voiceStatus.textContent = "Microphone access denied."; });
            } else {
                if (this.state.mediaRecorder) {
                    this.state.mediaRecorder.stop();
                }
                this.state.isRecording = false;
                this.elements.recordBtn.classList.remove('recording');
                this.elements.voiceStatus.textContent = "Preparing download...";
            }
        });
    },

    /**
     * This is the 100% reliable save feature. It creates a downloadable link
     * for the recorded audio and triggers a download in the browser.
     */
    saveRecordingToDevice() {
        const audioBlob = new Blob(this.state.audioChunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.download = `SafeLens_Recording_${new Date().getTime()}.wav`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        this.elements.voiceStatus.textContent = "Recording Downloaded!";
        setTimeout(() => { if (!this.state.isRecording) { this.elements.voiceStatus.textContent = "Idle"; } }, 3000);
    },
    
    /**
     * Handles all the logic for the calculator interface.
     */
    initCalculator() {
        if (this.elements.calculatorKeys.dataset.listenerAttached) return;
        this.elements.calculatorKeys.addEventListener('click', e => {
            const { key } = e.target.dataset;
            if (!key || !e.target.closest('.calculator-keys')) return;
            if (['add', 'subtract', 'multiply', 'divide', 'sign', 'percent', '.'].includes(key)) return;
            if (key === 'clear') {
                this.resetCalculator();
            } else if (key === '=') {
                if (this.state.displayValue === UNLOCK_CODE) { this.state.isUnlocked = true; this.updateView(); return; }
                if (this.state.displayValue === PANIC_CODE) { this.triggerEmergency(); return; }
                this.resetCalculator();
            } else {
                this.state.displayValue = this.state.displayValue === '0' ? key : this.state.displayValue + key;
                this.updateCalculatorDisplay();
            }
        });
        this.elements.calculatorKeys.dataset.listenerAttached = 'true';
    },

    resetCalculator() {
        this.state.displayValue = '0';
        this.updateCalculatorDisplay();
    },
    
    updateCalculatorDisplay() {
        if (this.elements.calculatorDisplay) {
            this.elements.calculatorDisplay.textContent = this.state.displayValue;
        }
    },
};

// Start the entire application.
App.init();