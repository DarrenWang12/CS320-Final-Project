# CS320 Final Project

## Prereqs

- **Python 3.8+** installed
- **Node.js 18+** and **npm** installed

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   cd CS320-Final-Project/backend

2. Create a virtual environment (recommended):
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate

3. Install dependencies:
   pip install -r requirements.txt

4. Create .env file:
   SPOTIFY_CLIENT_ID=8c473fd91b714f92bb09f3037735248f
   SPOTIFY_CLIENT_SECRET=c5e4cb57a2b0469299b41c5ad855e668
   SPOTIFY_REDIRECT_URI=http://127.0.0.1:8000/auth/spotify/callback
   SPOTIFY_SCOPES="user-read-email user-read-private user-read-recently-played user-top-read"
   APP_FRONTEND_URL="http://localhost:3000"

5. Start the FastAPI server:
   uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

   The backend will be available at: **http://localhost:8000**

### Frontend Setup

1. Navigate to the frontend directory:
   cd CS320-Final-Project/frontend

2. Install dependencies (if not already installed):
   npm install

3. Start the development server:
   npm run dev

   The frontend will be available at: **http://localhost:3000**