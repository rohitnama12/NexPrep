🚀 NexPrep
Next-Generation AI Interview & Coding Platform
 
## 💡 Overview

**NexPrep** is a comprehensive, full-stack Artificial Intelligence platform engineered to revolutionize technical interview preparation. It bridges the gap between theoretical knowledge and practical execution by providing a highly personalized, context-aware AI Tutor and a dynamic, multi-language coding arena. 

Built with scalability and modern UX in mind, NexPrep utilizes Retrieval-Augmented Generation (RAG) principles to adapt to a user's resume and tracks their algorithmic mastery in real-time through gamified analytics.

## ✨ Key Features

*   **🤖 Context-Aware AI Theory Tutor:** Upload your resume (PDF) and experience a Socratic-style interview. The backend parses PDFs statelessly in-memory, injecting your experience directly into the LLM context for highly personalized questions. Features low-latency Server-Sent Events (SSE) streaming.
*   **💻 Dynamic Coding Arena:** An anti-duplication challenge generator powered by rigidly prompted LLMs. Get unique DSA problems with pre-filled boilerplate code across multiple languages (Python, JavaScript, C++). 
*   **⚙️ Real-Time Code Execution:** Integrated with the Piston API to securely run and evaluate user-submitted code against AI-generated hidden test cases.
*   **📊 Gamified Analytics Dashboard:** Track your progress with GitHub-style activity heatmaps, difficulty distribution charts, and comprehensive submission logs.
*   **⚡ High-Performance UX:** Features Optimistic UI mutations (e.g., instant chat deletion) and portal-based zero-refresh authentication to bypass React router freezes.

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

## 🧠 Engineering Highlights (Under the Hood)

*   **Zero-Downtime Connection Pooling:** Decoupled background database seeders from the main FastAPI `lifespan` event loop to prevent PostgreSQL pool starvation, ensuring 100% uptime for high-concurrency tracker and analytics endpoints.
*   **HTTP/2 Stream Collision Prevention:** Implemented local JWT decoding and validation (`backend/app/core/security.py`) to bypass redundant network calls to `auth.get_user()`, eliminating socket collisions and drastically reducing latency.
*   **Strict LLM Output Enforcement:** Engineered advanced system preamble prompts to force non-deterministic LLMs to output 100% compliant JSON structures for coding challenges, completely bypassing the need for relaxed or optional Pydantic fields.
*   **Defensive API Design:** Built resilient extraction chains (e.g., `maybe_single().execute()`) and fail-safes against `NoneType` errors to ensure backend stability against malformed database records.

## 🚀 Local Development Setup

### Prerequisites
*   Node.js (v18+)
*   Python (3.10+)
*   Supabase Account (for Database & Auth)
*   OpenAI API Key

### 1. Clone the repository
```bash
git clone [https://github.com/rohitnama12/NexPrep.git](https://github.com/rohitnama12/NexPrep.git)
cd NexPrep
