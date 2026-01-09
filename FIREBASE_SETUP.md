# Firebase Authentication Setup

Firebase authentication has been successfully integrated into your KNCET Admission Form application.

## What Has Been Added

### 1. Firebase SDK
- Installed `firebase` package

### 2. Firebase Configuration (`src/firebase/config.js`)
- Firebase app initialization
- Authentication service setup
- Firestore database setup

### 3. Authentication Context (`src/contexts/AuthContext.jsx`)
- Manages authentication state globally
- Provides functions: `signup`, `login`, `logout`, `signInWithGoogle`
- Tracks current user across the application

### 4. Authentication Components
- **Login** (`src/components/Login.jsx`) - User sign-in page
- **Signup** (`src/components/Signup.jsx`) - User registration page
- **ProtectedRoute** (`src/components/ProtectedRoute.jsx`) - Route protection wrapper

### 5. Route Protection
All existing routes are now protected and require authentication:
- Student Panel routes
- Admin Panel routes
- Fees routes

## Next Steps - IMPORTANT

### Configure Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **loginform-c2cb1**
3. Go to Project Settings (gear icon) → General
4. Scroll down to "Your apps" section
5. If you haven't added a web app, click "Add app" → Web (</>) icon
6. Copy your Firebase configuration
7. Update `src/firebase/config.js` with your actual credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "loginform-c2cb1.firebaseapp.com",
  projectId: "loginform-c2cb1",
  storageBucket: "loginform-c2cb1.firebasestorage.app",
  messagingSenderId: "YOUR_ACTUAL_MESSAGING_SENDER_ID",
  appId: "YOUR_ACTUAL_APP_ID"
};
```

### Enable Authentication Methods in Firebase

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable the following providers:
   - **Email/Password** (for email sign-in)
   - **Google** (for Google sign-in)

### Test the Application

1. Run your development server: `npm run dev`
2. Visit `/login` or `/signup` routes
3. Create a test account or sign in with Google
4. All other routes now require authentication

## Features Included

✅ Email/Password authentication
✅ Google Sign-In
✅ Protected routes (redirect to login if not authenticated)
✅ User session persistence
✅ Clean, responsive UI with Tailwind CSS

## Available Routes

- `/login` - User login page
- `/signup` - User registration page
- All other routes require authentication

## Usage in Components

You can access authentication state in any component:

```javascript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { currentUser, logout } = useAuth();
  
  return (
    <div>
      <p>Logged in as: {currentUser?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Security Note

Make sure to add your Firebase config values to `.env` file in production and never commit them to version control.
