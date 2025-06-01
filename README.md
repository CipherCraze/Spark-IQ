# Spark IQ

> **Empowering Educators. Engaging Students. Enhancing Learning.**

[Live Demo ▶️](https://spark-iq1.vercel.app/) | [Watch Demo Video 🎥](https://youtu.be/smi-9N_w-5I?si=OeB-ICf-35HRBv8O) | [GitHub Repo](https://github.com/CipherCraze/Spark-IQ)

---

## 🚀 Overview

Spark IQ is an AI-powered Learning Management System (LMS) designed to revolutionize education for both students and teachers. With automated grading, personalized feedback, gamified learning, and real-time AI chat, Spark IQ makes learning and teaching smarter, faster, and more engaging.

---

## 📸 Screenshots

<!--
Add screenshots/gifs here. Example:
![Dashboard Screenshot](screenshots/dashboard.png)
![Voice Chat Feature](screenshots/voicechat.gif)
-->

---

## ✨ Features

- **🔐 User Authentication:** Secure login for students and teachers
- **📄 Assignment Management:** Upload, grade, and track assignments
- **⚖️ Automated Grading:** AI evaluates text and code assignments
- **💡 Personalized Feedback:** Actionable, student-specific insights
- **📊 Dashboards:** Real-time analytics for students and educators
- **🏆 Gamification:** Badges, rewards, and leaderboards
- **💬 Real-time Chat:** Instant messaging between users
- **🤖 Sparky AI Chatbot:** LLM-powered assistant for academic help
- **🔍 AI Resource Finder:** Smart search for learning materials
- **🎙️ Voice Chat:** Talk to Sparky using your voice (Web Speech API)
- **💼 Profile Management:** Easy management of user data

---

## 🛠️ Tech Stack

| Layer              | Technologies                                |
| ------------------ | ------------------------------------------- |
| **Frontend**       | React.js, Vite                              |
| **Backend**        | Firebase (Firestore, Auth, Cloud Functions) |
| **AI Integration** | Gemini API, Vertex AI, Google Custom Search |
| **Styling**        | Tailwind CSS                                |
| **Build Tool**     | Vite                                        |
| **Deployment**     | Vercel                                      |

---

## 🖥️ Local Setup & Installation

### 1. **Clone the Repository**

```bash
git clone https://github.com/CipherCraze/Spark-IQ.git
cd Spark-IQ
```

### 2. **Install Dependencies**

```bash
npm install
```

### 3. **Configure Environment Variables**

Create a `.env` file in the root directory with the following (replace with your actual keys):

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_GEMINI_API_KEY=your_gemini_api_key
```

> You can find these values in your Firebase project settings and Google AI Console.

### 4. **Run the App Locally**

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌐 Deployment

- **Vercel**: Push to GitHub, connect your repo on Vercel, and set the same environment variables in the Vercel dashboard.
- **Other Hosts**: Make sure to configure your server to redirect all routes to `index.html` for React Router support.

---

## 🧑‍💻 Usage Guide

- **Student Dashboard**: Track assignments, grades, attendance, and chat with Sparky.
- **Educator Dashboard**: Manage classes, grade assignments, and communicate with students.
- **Voice Chat**: Use the sidebar to access the voice chat feature for both students and educators.
- **AI Chatbot**: Ask Sparky any academic question for instant help.

---

## 🏗️ Project Structure

```
Spark-IQ/
├── public/
├── src/
│   ├── Components/
│   │   ├── Chatbot/
│   │   │   ├── VoiceChat.jsx
│   │   │   └── TeacherVoiceChat.jsx
│   │   ├── dashboard/
│   │   │   ├── Dashboard.jsx
│   │   │   └── EducatorDashboard.jsx
│   │   └── ...
│   ├── firebase/
│   ├── contexts/
│   ├── styles/
│   └── App.jsx
├── .env.example
├── README.md
└── ...
```

---

## 🧩 Contribution

We welcome PRs, ideas, and collaborations! To contribute:

1. Fork the repo
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to your fork and open a Pull Request

---

## 🙋 FAQ

**Q: I get a 404 on page refresh or direct route?**  
A: Make sure your deployment server is configured to redirect all routes to `index.html` (see README above).

**Q: Where do I get API keys?**  
A: [Firebase Console](https://console.firebase.google.com/) and [Google AI Console](https://makersuite.google.com/app/apikey).

**Q: How do I add screenshots?**  
A: Place images in a `/screenshots` folder and update the placeholders above.

---

## 👥 Team CodeSharks

- **Team Leader:** Pranav C R
- **Team Members:** Noel Manoj, Joswin M.J, Niranjan J Rajesh
- **Institution:** Indian Institute of Information Technology (IIIT) Kottayam
- **Contest:** Google Solutions Challenge

---

## 📚 License

Licensed under the [MIT License](LICENSE).

---

_Spark IQ: Empowering Educators. Engaging Students. Enhancing Learning._
