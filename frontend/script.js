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
     * Finds all important HTML elements and saves them for easy access.
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
            saveForm: document.getElementById('save-form'),
            recordingNoteInput: document.getElementById('recording-note'),
            saveToVaultBtn: document.getElementById('save-to-vault-btn'),
            vaultList: document.getElementById('vault-list'),
        };
    },

    /**
     * Attaches all the interactive event listeners (clicks, etc.).
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

    // --- 4. CORE APP LOGIC & VIEW MANAGEMENT ---

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

    lockApp() {
        this.state.isUnlocked = false;
        this.updateView();
    },

    showPage(pageId) {
        if (!pageId || !pageId.startsWith('#')) return;
        this.elements.pages.forEach(page => page.classList.remove('active'));
        this.elements.navLinks.forEach(link => link.classList.remove('active'));
        const targetPage = document.querySelector(pageId);
        if (targetPage) targetPage.classList.add('active');
        const targetLink = document.querySelector(`a[href="${pageId}"]`);
        if (targetLink) targetLink.classList.add('active');
        if (pageId === '#vault') { this.renderVault(); }
    },
    
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
            (error) => { this.openSmsLink("Location could not be found."); },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
        this.resetCalculator();
    },

    openSmsLink(locationDetails) {
        const primaryContact = this.state.trustedContacts[0].phone;
        const customMessage = this.elements.alertMessageInput.value || "I'm in danger, please help!";
        const messageBody = `${customMessage}\n\nMy current location: ${locationDetails}`;
        const smsLink = `sms:${primaryContact}?body=${encodeURIComponent(messageBody)}`;
        window.location.href = smsLink;
    },
    
    initVoiceAnalysis() {
        if (!this.elements.recordBtn) return;
        this.elements.recordBtn.addEventListener('click', () => {
            if (!this.state.isRecording) {
                navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
                    this.state.isRecording = true;
                    this.elements.recordBtn.classList.add('recording');
                    this.elements.voiceStatus.textContent = "Recording... Tap again to stop.";
                    this.elements.saveForm.classList.add('hidden');
                    this.state.audioChunks = [];
                    this.state.mediaRecorder = new MediaRecorder(stream);
                    this.state.mediaRecorder.start();
                    this.state.mediaRecorder.addEventListener("dataavailable", event => { this.state.audioChunks.push(event.data); });
                    this.state.mediaRecorder.addEventListener("stop", () => { stream.getTracks().forEach(track => track.stop()); });
                }).catch(err => { this.elements.voiceStatus.textContent = "Microphone access denied."; });
            } else {
                if (this.state.mediaRecorder) this.state.mediaRecorder.stop();
                this.state.isRecording = false;
                this.elements.recordBtn.classList.remove('recording');
                this.elements.voiceStatus.textContent = "Recording stopped. Add a note and save.";
                this.elements.saveForm.classList.remove('hidden');
            }
        });
        this.elements.saveToVaultBtn.addEventListener('click', () => this.saveToVault());
    },

    saveToVault() {
        const note = this.elements.recordingNoteInput.value;
        const audioBlob = new Blob(this.state.audioChunks, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
            const audioDataUrl = reader.result;
            const vault = JSON.parse(localStorage.getItem('safelens_vault') || '[]');
            const newEntry = { id: new Date().getTime(), timestamp: new Date().toLocaleString(), note: note || 'No note added', audioDataUrl: audioDataUrl };
            vault.unshift(newEntry);
            localStorage.setItem('safelens_vault', JSON.stringify(vault));
            this.elements.voiceStatus.textContent = "Saved to Vault!";
            this.elements.saveForm.classList.add('hidden');
            this.elements.recordingNoteInput.value = '';
            setTimeout(() => { this.elements.voiceStatus.textContent = "Idle"; }, 2000);
        };
    },

    renderVault() {
        if (!this.elements.vaultList) return;
        const vault = JSON.parse(localStorage.getItem('safelens_vault') || '[]');
        this.elements.vaultList.innerHTML = '';
        if (vault.length === 0) {
            this.elements.vaultList.innerHTML = '<p>Your vault is empty. Record audio from the "Record Evidence" page to add items.</p>';
            return;
        }
        vault.forEach(entry => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'vault-entry';
            entryDiv.innerHTML = `<div class="vault-entry-header">${entry.timestamp}</div><p>"${entry.note}"</p><div class="vault-controls"><button class="play-btn" data-id="${entry.id}">Play</button><button class="delete-btn" data-id="${entry.id}">Delete</button></div>`;
            this.elements.vaultList.appendChild(entryDiv);
        });
        this.elements.vaultList.querySelectorAll('.play-btn').forEach(btn => { btn.addEventListener('click', (e) => this.playFromVault(e.target.dataset.id)); });
        this.elements.vaultList.querySelectorAll('.delete-btn').forEach(btn => { btn.addEventListener('click', (e) => this.deleteFromVault(e.target.dataset.id)); });
    },

    playFromVault(id) {
        const vault = JSON.parse(localStorage.getItem('safelens_vault') || '[]');
        const entry = vault.find(item => item.id == id);
        if (entry) { const audio = new Audio(entry.audioDataUrl); audio.play(); }
    },

    deleteFromVault(id) {
        if (!confirm("Are you sure you want to permanently delete this recording?")) return;
        let vault = JSON.parse(localStorage.getItem('safelens_vault') || '[]');
        vault = vault.filter(item => item.id != id);
        localStorage.setItem('safelens_vault', JSON.stringify(vault));
        this.renderVault();
    },

    initCalculator() {
        if (this.elements.calculatorKeys.dataset.listenerAttached) return;
        this.elements.calculatorKeys.addEventListener('click', e => {
            const { key } = e.target.dataset;
            if (!key || !e.target.closest('.calculator-keys')) return;
            if (['add', 'subtract', 'multiply', 'divide', 'sign', 'percent', '.'].includes(key)) return;
            if (key === 'clear') { this.resetCalculator(); }
            else if (key === '=') {
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

    resetCalculator() { this.state.displayValue = '0'; this.updateCalculatorDisplay(); },
    updateCalculatorDisplay() { if (this.elements.calculatorDisplay) { this.elements.calculatorDisplay.textContent = this.state.displayValue; } },
};

App.init();