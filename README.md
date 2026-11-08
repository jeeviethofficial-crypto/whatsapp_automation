# ☕ Tamil Tea Shop — AI WhatsApp Bot & Automation

An intelligent, full-stack WhatsApp automation bot built for **தமிழ் டீ கடை (Tamil Tea Shop)**. Powered by **Google Gemini AI** and the **Meta WhatsApp Cloud API**, this system automates customer conversations, presents digital menus, takes orders, calculates bill totals, and communicates fluently in **Tamil, Tanglish, and English**.

---

## 🌟 Key Features

- 🤖 **Bilingual AI Concierge:** Communicates with a polite, authentic Tamil hospitality tone (*"வணக்கம்!", "வாங்க!"*). Understands queries in Tamil script, Tanglish, and English.
- 📜 **Digital Menu & Live Pricing:** Automatically serves pricing for tea varieties, filter coffees, hot snacks (vadais, samosas, bajjis), and bakery items.
- 🛒 **Automated Order Taking & Billing:** Tallies ordered quantities, computes itemized pricing and grand totals (in ₹), and handles Dine-in, Takeaway (பார்சல்), and Delivery requests.
- 🧠 **Contextual Conversation Memory:** Tracks multi-turn customer dialogues in memory so customers can add or remove items naturally without restarting their order.
- 🔄 **High-Availability Fallback:** Implements multi-model failover with auto-retry across Gemini models to bypass temporary quota or traffic spikes.
- ⚡ **Meta Cloud API Webhook Integration:** Implements instantaneous challenge verification (`GET /webhook`) and incoming message event listeners (`POST /webhook`).

---

## 🛠️ Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Runtime** | Node.js (v18+) | ES Modules (`"type": "module"`) |
| **Backend Framework** | Express.js (v5) | RESTful API & Webhook Handlers |
| **AI / LLM Engine** | Google Gemini API | Integrated via official `@google/genai` SDK |
| **Messaging Gateway** | Meta WhatsApp Cloud API | Graph API v20.0 for two-way WhatsApp interaction |
| **HTTP Client** | Axios | Outbound Graph API message dispatch |
| **Environment Config** | Dotenv | Secure environment variable management |

---

## 📂 Project Structure

```text
Ai/
├── .env                  # Private API credentials & secrets (ignored by git)
├── .gitignore            # Git exclusion rules
├── package.json          # Project metadata & npm dependencies
├── package-lock.json     # Lockfile
├── README.md             # Project documentation & setup guide
└── server.js             # Express server, WhatsApp Webhook & Gemini AI engine
```

---

## 📋 Prerequisites

Before running the project, ensure you have:

1. **Node.js** (v18.0.0 or higher) & **npm** installed.
2. A **Google AI Studio API Key** ([Get it here](https://aistudio.google.com/)).
3. A **Meta for Developers Account** with:
   - WhatsApp Cloud API configured.
   - A **Phone Number ID**.
   - A **System User Access Token** (Permanent WhatsApp Token).
4. A tunneling tool like **ngrok** or **Cloudflare Tunnel** (for local webhook testing).

---

## ⚙️ Environment Variables Setup

Create a `.env` file in the root directory:

```bash
touch .env
```

Add the following required configuration variables:

```env
# Server Configuration
PORT=3000
VERIFY_TOKEN=my_secret_token_123

# Meta WhatsApp Cloud API Credentials
PHONE_NUMBER_ID=your_whatsapp_phone_number_id_here
WHATSAPP_TOKEN=your_meta_system_user_access_token_here

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
```

### Configuration Details

| Variable | Description |
| :--- | :--- |
| `PORT` | Local port on which the Express server listens (default: `3000`). |
| `VERIFY_TOKEN` | Any secret string you choose; must match the token entered in Meta's Webhook dashboard. |
| `PHONE_NUMBER_ID` | Found in the Meta Developer Portal under **WhatsApp > API Setup**. |
| `WHATSAPP_TOKEN` | Permanent Access Token generated for your WhatsApp Cloud API app. |
| `GEMINI_API_KEY` | Your Google Gemini API Key from Google AI Studio. |

---

## 🚀 Installation & Running

### 1. Clone the Repository
```bash
git clone https://github.com/jeeviethofficial-crypto/whatsapp_automation.git
cd whatsapp_automation
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Server
```bash
# Start server
node server.js
```
The server will start on `http://localhost:3000`.

### 3. Expose Server to the Internet (For Webhooks)
In a separate terminal window, launch `ngrok`:
```bash
ngrok http 3000
```
Copy the generated HTTPS URL (e.g., `https://xxxx-xx-xx.ngrok-free.app`).

---

## 🔗 Meta Webhook Configuration

1. Log in to [Meta for Developers](https://developers.facebook.com/).
2. Navigate to your App > **WhatsApp** > **Configuration**.
3. Under **Webhook**, click **Edit**:
   - **Callback URL:** `https://your-ngrok-url.ngrok-free.app/webhook`
   - **Verify Token:** The value set in `VERIFY_TOKEN` (e.g. `my_secret_token_123`)
4. Click **Verify and Save**.
5. Under **Webhook Fields**, click **Manage** and subscribe to **`messages`**.

---

## 💬 Sample Bot Conversations

### 1. Tamil Ordering Example
> **Customer:** வணக்கம், உங்க கடையில என்னெல்லாம் டீ இருக்கு?  
> **Bot:** வணக்கம்! வாங்க! ☕ எங்கள் தமிழ் டீ கடையில் உள்ள டீ வகைகள்:  
> - சாதா டீ — ₹12  
> - மசாலா டீ — ₹15  
> - இஞ்சி டீ — ₹15  
> - ஏலக்காய் டீ — ₹15  
> - லெமன் டீ — ₹15  
> - கிரீன் டீ — ₹20  
> உங்களுக்கு என்ன டீ வேண்டும் சொல்லுங்கள்!  
>  
> **Customer:** 2 மசாலா டீ, 2 மெது வடை பார்சல் ப்ளீஸ்.  
> **Bot:** உங்கள் பார்சல் ஆர்டர் விவரம்:  
> • 2 × மசாலா டீ (₹15) = ₹30  
> • 2 × மெது வடை (₹10) = ₹20  
> **மொத்த தொகை: ₹50**  
> உங்கள் பார்சல் தயார் செய்யப்படுகிறது! நன்றி! 🙏

### 2. Tanglish / English Ordering Example
> **Customer:** Hi! 1 Filter coffee and 2 Samosa total price evlo?  
> **Bot:** Vanakkam! ☕ Here is your order summary:  
> • 1 × Filter Coffee (₹20) = ₹20  
> • 2 × Samosa (₹15) = ₹30  
> **Total Bill: ₹50**  
> Is this for Dine-in or Parcel (Takeaway)?

---

## 🧪 Local Testing via cURL

You can test the server endpoints locally without WhatsApp:

### Test Health Check:
```bash
curl http://localhost:3000/
```

### Test Webhook Verification:
```bash
curl -G "http://localhost:3000/webhook" \
  --data-urlencode "hub.mode=subscribe" \
  --data-urlencode "hub.verify_token=my_secret_token_123" \
  --data-urlencode "hub.challenge=CHALLENGE_ACCEPTED"
```

---

## 🗺️ Roadmap & Planned Enhancements

- [x] WhatsApp Cloud API Webhook Listener & Responder
- [x] Gemini AI integration with Tamil Tea Shop persona & menu
- [x] Multi-turn conversation memory cache
- [ ] MongoDB database integration for permanent order history
- [ ] Next.js 14 Admin Panel for live order tracking & product management
- [ ] WhatsApp Interactive Buttons & List Messages support

---

## 👨‍💻 Author

- **Name:** Jeevith
- **GitHub:** [@jeeviethofficial-crypto](https://github.com/jeeviethofficial-crypto)
- **Repository:** [whatsapp_automation](https://github.com/jeeviethofficial-crypto/whatsapp_automation)

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).