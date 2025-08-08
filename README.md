# 🔐 SafeLens: Your Silent Guardian  
![SafeLens Shield](https://svgshare.com/i/186m.svg)

**SafeLens is a discreet, AI-ready emergency alert app that hides in plain sight behind a fully functional calculator.** It's built for high-risk situations like domestic abuse, kidnapping, or harassment—where using a visible safety tool can make things worse.

---

## 💡 The Problem

In high-risk emergencies, pulling out a phone and using an obvious safety app can escalate danger. Victims need a silent way to ask for help that doesn’t expose them.  

---

## ✅ The Solution: Safety in Disguise

SafeLens acts like a calculator—but has life-saving power beneath it.

### 🧩 Core Features

- **📱 Calculator Disguise**  
  Looks and functions exactly like a normal calculator. Total plausible deniability.

- **🆘 Panic Trigger**  
  Typing a secret code (`222` + `=`) triggers an emergency sequence:
  - Gets the user’s live GPS location.
  - Opens a pre-filled SMS with custom emergency text and map link to their location.
  - User just taps **Send**—and the screen resets instantly to hide everything.

- **🔓 Secure Unlock Code**  
  Entering a different code (`1111` + `=`) opens the full SafeLens interface.

- **🛡️ Support Hub**  
  Users can set their emergency contact, customize alert messages, get guidance on:
  - **Immediate action**
  - **Long-term safety planning**
  - **Professional help & helplines**

- **📁 Audio Vault** *(Coming Soon)*  
  Automatic audio evidence capture during alert. Stored securely on backend.

- **🎙️ AI Voice Analysis** *(Next Phase)*  
  Detects signs of distress in recorded audio using machine learning.

---

## 👤 User Journey

1. **Open the App** – It’s just a calculator.
2. **Feel Unsafe?** – Type `222` and tap `=`.
3. **Emergency Triggered**:
   - GPS is captured.
   - SMS opens, ready to send to a trusted contact.
   - Calculator resets—no one knows.
4. **Need Help Later?** – Enter `1111` to access SafeLens tools.

---

## 🧪 Tech Stack

| Layer       | Tech                          |
|-------------|-------------------------------|
| **Frontend**| HTML, CSS, Vanilla JS         |
| **Backend** | Python, FastAPI               |
| **Alerting**| Native SMS protocol (`sms:`)  |
| **AI (Planned)** | Librosa + Scikit-learn for audio distress analysis |

---

## 🛠️ Developer Guide

### Prerequisites
- Python 3.8+
- [ngrok](https://ngrok.com/download)
- (Optional) [Twilio](https://www.twilio.com/try-twilio)

### 1. Clone Repo
bash
git clone https://github.com/your-username/safelens.git
cd safelens/backend



### 2. Set Up Environment
bash
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install fastapi "uvicorn[standard]" python-dotenv

### 3. Run Backend
bash
uvicorn main:app --reload

### 4. Open Public Tunnel
bash
ngrok http 8000
