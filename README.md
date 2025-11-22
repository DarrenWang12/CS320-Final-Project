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

4. Start the FastAPI server:
   # Option 1: Using Python directly
   python src/main.py
   # Option 2: Using uvicorn directly
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