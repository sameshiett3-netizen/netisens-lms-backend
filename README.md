# 🎓 Netisens Learning Management System (Backend)

This repository contains the core authentication and security engine for the **Netisens LMS**, developed as a technical milestone for my **SIWES** placement. 

The system implements a secure, stateless architecture for managing students and instructors.

---

## 🛠️ Technical Architecture
I have built this system using the **MERN** stack philosophy (MongoDB, Express, Node.js), focusing on industry-standard security protocols.

### 🔐 Security Features
* **Password Hashing:** Uses `bcrypt` to salt and hash user passwords. No plain-text passwords ever touch the database.
* **JWT Authentication:** Implements JSON Web Tokens for stateless session management.
* **Protected Routes:** Custom middleware (The "Bouncer") verifies the cryptographic signature of every request before granting access to sensitive data.

---

## 🚦 API Roadmap

| Method | Route | Functionality | Status |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | User Onboarding (Hashed) | ✅ Complete |
| `POST` | `/login` | Identity Verification (JWT) | ✅ Complete |
| `GET` | `/dashboard` | Restricted Student Area | ✅ Complete |
| `GET` | `/courses` | Course Management | 🚧 In Progress |

---

## 🚀 Local Setup

To run this engine on your local machine:

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Environment Configuration:**
    Create a `.env` file with your `MONGO_URI` and `JWT_SECRET`.
3.  **Start Engine:**
    ```bash
    node --watch server.js
    ```

---

## 👤 Author
**Samuel Eshiett** *Computer Science Intern @ Netisens*
