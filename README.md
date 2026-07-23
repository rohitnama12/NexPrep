<div align="center">
  <h1>🚀 NexPrep</h1>
  <p><b>Next-Generation AI Interview & Coding Platform</b></p>
  
  [![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](#)
  [![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](#)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](#)
  [![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](#)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](#)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
</div>

---

## 💡 Overview

**NexPrep** is a comprehensive, full-stack Artificial Intelligence platform engineered to revolutionize technical interview preparation. It bridges the gap between theoretical knowledge and practical execution by providing a highly personalized, context-aware AI Tutor and a dynamic, multi-language coding arena. 

Built with scalability and modern UX in mind, NexPrep utilizes Retrieval-Augmented Generation (RAG) principles to adapt to a user's resume and tracks their algorithmic mastery in real-time through gamified analytics.

---

## ✨ Key Features

*   **🤖 Context-Aware AI Theory Tutor:** Upload your resume (PDF) and experience a Socratic-style interview. The backend parses PDFs statelessly in-memory, injecting your experience directly into the LLM context for highly personalized questions. Features low-latency Server-Sent Events (SSE) streaming.
*   **💻 Dynamic Coding Arena:** An anti-duplication challenge generator powered by rigidly prompted LLMs. Get unique DSA problems with pre-filled boilerplate code across multiple languages (Python, JavaScript, C++). 
*   **⚙️ Real-Time Code Execution:** Integrated with the Piston API to securely run and evaluate user-submitted code against AI-generated hidden test cases.
*   **📊 Gamified Analytics Dashboard:** Track your progress with GitHub-style activity heatmaps, difficulty distribution charts, and comprehensive submission logs.
*   **⚡ High-Performance UX:** Features Optimistic UI mutations (e.g., instant chat deletion) and portal-based zero-refresh authentication to bypass React router freezes.

---

## 🛠️ Tech Stack & Architecture

### Frontend (Vercel)
*   **Framework:** Next.js (App Router), React, TypeScript
*   **State Management:** Zustand
*   **Styling & UI:** Tailwind CSS, Framer Motion, Lucide Icons, React Markdown (with Prism syntax highlighting)

### Backend (Hugging Face Spaces - Dockerized)
*   **Framework:** FastAPI (Python), Uvicorn ASGI
*   **AI / ML:** LangChain Core, OpenAI Models, PyPDF2
*   **Validation:** Pydantic (Strict Schema Enforcement)

### Database & Auth
*   **Infrastructure:** Supabase (PostgreSQL)
*   **Authentication:** Supabase Auth (with edge-optimized local JWT validation)

---

## 🧠 Engineering Highlights (Under the Hood)

*   **Zero-Downtime Connection Pooling:** Decoupled background database seeders from the main FastAPI `lifespan` event loop to prevent PostgreSQL pool starvation, ensuring 100% uptime for high-concurrency tracker and analytics endpoints.
*   **HTTP/2 Stream Collision Prevention:** Implemented local JWT decoding and validation (`backend/app/core/security.py`) to bypass redundant network calls to `auth.get_user()`, eliminating socket collisions and drastically reducing latency.
*   **Strict LLM Output Enforcement:** Engineered advanced system preamble prompts to force non-deterministic LLMs to output 100% compliant JSON structures for coding challenges, completely bypassing the need for relaxed or optional Pydantic fields.
*   **Defensive API Design:** Built resilient extraction chains (e.g., `maybe_single().execute()`) and fail-safes against `NoneType` errors to ensure backend stability against malformed database records.

---

## 🚀 Local Development Setup

Follow these steps to set up the project locally on your machine.

### Prerequisites
*   [Node.js](https://nodejs.org/en/) (v18 or higher)
*   [Python](https://www.python.org/downloads/) (3.10 or higher)
*   [Supabase Account](https://supabase.com/) (for Database & Authentication)
*   [OpenAI API Key](https://platform.openai.com/)

### 1. Clone the Repository
```bash
git clone [https://github.com/rohitnama12/NexPrep.git](https://github.com/rohitnama12/NexPrep.git)
cd NexPrep

```

### 2. Backend Setup & Execution

Open a terminal and navigate to the `backend` directory:

```bash
cd backend

```

**Create a virtual environment and install dependencies:**

```bash
# For macOS/Linux:
python3 -m venv venv
source venv/bin/activate

# For Windows:
python -m venv venv
venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

```

**Environment Variables:**
Create a `.env` file in the `backend` directory and add your credentials:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key

```

**Run the FastAPI Server:**

```bash
uvicorn app.main:app --reload --port 7860

```

*The backend API will now be running at `http://localhost:7860`.*

### 3. Frontend Setup & Execution

Open a new terminal window and navigate to the `frontend` directory:

```bash
cd frontend

```

**Install dependencies:**

```bash
npm install

```

**Environment Variables:**
Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:7860/api/v1

```

**Run the Next.js Development Server:**

```bash
npm run dev

```

*The frontend application will now be running at `http://localhost:3000`.*


## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/rohitnama12/NexPrep/issues).

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

**Developed with ❤️ by [Rohit Nama**](https://github.com/rohitnama12)
*AI Engineer*

``
