const API_URL = ""; 
const UNLOCK_CODE = '1111';
const PANIC_CODE = '222';

const App = {
    state: { isUnlocked: false, trustedContacts: [], displayValue: '0' },
    elements: {},
    
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.cacheDOMElements();
            this.initCoreAppListeners();
            this.updateView();
        });
    },

    cacheDOMElements() {
        this.elements = {
            calculatorView: document.getElementById('calculator-view'),
            safelensView: document.getElementById('safelens-view'),
            calculatorDisplay: document.querySelector('.calculator-display'),
            calculatorKeys: document.querySelector('.calculator-keys'),
            navLinks: document.querySelectorAll('.nav-link'),
            pages: document.querySelectorAll('.page-content'),
            lockAppBtn: document.getElementById('lock-app-btn'),
            addContactBtn: document.getElementById('add-contact-btn'),
            contactsListDiv: document.getElementById('trusted-contacts-list'),
            newContactNameInput: document.getElementById('new-contact-name'),
            newContactPhoneInput: document.getElementById('new-contact-phone'),
            alertMessageInput: document.getElementById('alert-message'),
        };
    },
    
    initCoreAppListeners() {
        this.elements.navLinks.forEach(link => {
            link.addEventListener('click', e => { 
                e.preventDefault(); 
                this.showPage(link.getAttribute('href')); 
            });
        });

        this.elements.lockAppBtn.addEventListener('click', e => { 
            e.preventDefault(); 
            this.lockApp(); 
        });

        this.initContactManagement();
        this.initSupportHubTabs();
        this.initCalculator();
    },
    
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
    },


    initSupportHubTabs() {
        setTimeout(() => {
            console.log("Attempting to initialize Support Hub tabs..."); 
            
            const tabs = document.querySelectorAll('.action-tab');
            const panels = document.querySelectorAll('.action-panel');

            console.log(`Found ${tabs.length} tabs and ${panels.length} panels.`);

            if (tabs.length === 0) return;

            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const targetId = tab.dataset.target;
                    console.log(`Tab clicked! Target: ${targetId}`); 

                    const targetPanel = document.querySelector(targetId);
                    if (!targetPanel) {
                        console.error(`Error: Could not find panel with ID: ${targetId}`);
                        return;
                    }
                    
                    tabs.forEach(t => t.classList.remove('active'));
                    panels.forEach(p => p.classList.remove('active'));

                    tab.classList.add('active');
                    targetPanel.classList.add('active');
                });
            });
        }, 100);
    },

    initContactManagement() {
        const savedContacts = JSON.parse(localStorage.getItem('safelens_contacts') || '[]');
        this.state.trustedContacts = savedContacts;
        this.renderContacts();

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
    },
    
    renderContacts() {
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
            (error) => {
                this.openSmsLink("Location could not be found.");
            },
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
    
    initCalculator() {
        // We only want ONE listener on the keys container.
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
    resetCalculator() {
        this.state.displayValue = '0';
        this.updateCalculatorDisplay();
    },
    updateCalculatorDisplay() {
        if(this.elements.calculatorDisplay) {
            this.elements.calculatorDisplay.textContent = this.state.displayValue;
        }
    },
};

App.init();