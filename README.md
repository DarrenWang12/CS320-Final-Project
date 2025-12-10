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

4. Create `.env` file in the backend directory with the following:
   ```
   SPOTIFY_CLIENT_ID=8c473fd91b714f92bb09f3037735248f
   SPOTIFY_CLIENT_SECRET=c5e4cb57a2b0469299b41c5ad855e668
   SPOTIFY_REDIRECT_URI=http://127.0.0.1:8000/auth/spotify/callback
   SPOTIFY_SCOPES="user-read-email user-read-private user-read-recently-played user-top-read"
   APP_FRONTEND_URL="http://localhost:3000"
   
   # Firebase Admin SDK Configuration
   # Option 1: Path to service account JSON file
   FIREBASE_SERVICE_ACCOUNT_PATH=path/to/your/firebase-service-account.json
   
   # Option 2: OR use JSON string directly (alternative to file path)
   # FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
   ```

5. Start the FastAPI server:
   uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

   The backend will be available at: **http://localhost:8000**

### Frontend Setup

1. Navigate to the frontend directory:
   cd CS320-Final-Project/frontend

2. Install dependencies (if not already installed):
   npm install

3. Create `.env` file in the frontend directory with your Firebase configuration:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```
   
   You can find these values in:
   - Project Settings
   - Or in your Firebase project's web app configuration

4. Start the development server:
   npm run dev

   The frontend will be available at: **http://localhost:3000**

### Backend Firebase Setup

The backend needs Firebase Admin SDK credentials to access Firestore. You have two options:

#### Option 1: Service Account JSON File

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **"Generate new private key"**
5. Save the downloaded JSON file (e.g., `firebase-service-account.json`)
6. Add to your backend `.env` file:
   ```
   FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
   ```
   (Use absolute path or relative path from backend directory)

#### Option 2: JSON String (Alternative)

1. Get the service account JSON as described above
2. Copy the entire JSON content
3. Add to your backend `.env` file as a single line:
   ```
   FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...","private_key":"...",...}
   ```