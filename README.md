# 🚀 Task Tracker Monorepo Setup

This repository contains the template structure for the Task Tracker application, using a monorepo approach with a **React/TypeScript Frontend** and a **FastAPI/Python Backend**.

## I. Initial Setup Steps (Git & Structure)

1.  **Create the Root Directory:**

    ```bash
    mkdir task-tracker-mono
    cd task-tracker-mono
    ```

2.  **Initialize Git:**

    ```bash
    git init
    ```

3.  **Create Directory Structure:**

    ```bash
    mkdir frontend backend
    mkdir frontend/src backend/src
    ```

    (You would then place the generated files into these directories, e.g., `main.py` goes into `backend/src/`).

## II. Running the Backend (FastAPI)

1.  **Navigate to Backend:**

    ```bash
    cd backend
    ```

2.  **Setup Virtual Environment (Recommended):**

    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  **Install Dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

4.  **Run the API Server:**

    ```bash
    uvicorn src.main:app --reload
    # This runs the API on [http://127.0.0.1:8000](http://127.0.0.1:8000)
    ```

## III. Running the Frontend (React/TypeScript)

1.  **Navigate to Frontend:**

    ```bash
    cd frontend
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    # You might also need to create a basic tailwind.config.js and postcss.config.js
    # for full functionality, but the core packages are in package.json.
    ```

3.  **Run the Development Server:**

    ```bash
    npm run start
    # This typically runs on http://localhost:5173 (Vite default)
    ```

## IV. Next Steps: Adding Core Logic

Once the template is running, the next phases will be:

1.  **Backend:** Integrate PostgreSQL (SQLAlchemy), implement the `User` and `Role` models, and set up database migrations.
2.  **Frontend:** Implement the basic routing and the **mock authentication flow** to read the user's role from the state, enabling role-based access control in the UI.
