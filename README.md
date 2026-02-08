# <p align="center">🇰🇪 PeerPair Kenya</p>
<p align="center">
  <img src="https://img.shields.io/badge/Status-Production--Ready-46b04a?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Payments-M--Pesa%20Escrow-85bb65?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Policy-Strictly%20Platonic-blue?style=for-the-badge" />
</p>

<p align="center">
  <b>The premium companionship marketplace designed for Kenya.</b><br>
  Connect with verified professional companions for social events, networking, and dinners.
</p>

---

## 📽️ System Interface & Animations



### ✨ User Experience Highlights
* **Smooth Transitions:** Powered by `framer-motion` for page fades and component entries.
* **Loading Skeletons:** Animated CSS pulse effects during data fetching to prevent layout shift.
* **M-Pesa Feedback:** Real-time toast notifications (Sonner) that track the STK Push status from "Initiated" to "Funded in Escrow."

---

## 🚀 Core Engine Architecture

### 🛡️ 1. The Gatekeeper (Signup Logic)
We implement a strictly enforced **Legal Gate**. 
* **Forced Consent:** Users cannot click "Sign Up" without checking the mandatory ToS box.
* **Platonic Affirmation:** A specialized onboarding step specifically for companions to confirm non-sexual service delivery.

### 👤 2. Dual-Role Profile System
Integrated with **Supabase Auth & Storage**, allowing users to manage detailed metadata:
* **Physical Filters:** Height, Age, and Complexion (Fair, Brown, Dark, Olive).
* **Location Mapping:** Search companions by specific City or Neighborhood (Nairobi, Mombasa, Kisumu, etc.).
* **Dynamic Rates:** Set and view pricing by **Hourly**, **Daily**, or **Weekly** tiers.

### 💰 3. M-Pesa Escrow Workflow
A secure 3-way handshake between the Client, Platform, and Companion:
1. **Request:** Client initiates booking via M-Pesa STK Push.
2. **Hold:** Funds are captured and held in a `funded_escrow` state in the `bookings` table.
3. **Release:** 80/20 Payout split is triggered via B2C Daraja API upon service completion.



---

## 📂 Database Schema (PostgreSQL)

| Table | Column | Type | Description |
| :--- | :--- | :--- | :--- |
| **Profiles** | `complexion` | `enum` | Fair, Brown, Dark, Olive |
| **Profiles** | `height` | `text` | e.g., 5'7" or 170cm |
| **Bookings** | `status` | `enum` | pending, funded_escrow, completed |
| **Finance** | `mpesa_id` | `text` | Unique CheckoutRequestID from Daraja |

---

## 🛠️ Technical Setup

### Prerequisites
- Node.js 18+
- Supabase Project & M-Pesa Daraja Credentials

### Environment Secrets
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
MPESA_SHORTCODE=your_shortcode
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret