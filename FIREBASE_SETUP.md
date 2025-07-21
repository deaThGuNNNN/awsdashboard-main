# Firebase Setup Instructions

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "aws-cost-calculator")
4. Configure Google Analytics (optional)
5. Click "Create project"

## 2. Enable Authentication

1. In your Firebase project console, go to **Authentication**
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable **Email/Password** sign-in provider:
   - Click on Email/Password
   - Toggle "Enable" for Email/Password (first option)
   - Click "Save"

## 3. Create Firestore Database

1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select a location for your database
5. Click "Done"

## 4. Get Firebase Configuration

1. Go to **Project settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click **Web app** icon (</>) to add a web app
4. Register your app name
5. Copy the Firebase configuration object

## 5. Setup Environment Variables

Create a `.env.local` file in your project root:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Replace the values with your actual Firebase configuration.

## 6. Firestore Security Rules

Update your Firestore security rules to secure user data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own saved sessions
    match /saved-sessions/{sessionId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## 7. Features Implemented

### Authentication
- Email/Password Sign-in with Firebase Auth
- User registration and login
- User session management
- Protected routes
- User avatar with logout

### Database
- User-specific saved configurations
- Firestore integration for persistence
- Real-time data sync
- Export functionality (JSON/CSV)

### Components Added
- `lib/firebase.ts` - Firebase configuration
- `lib/auth-context.tsx` - Authentication context
- `lib/firestore-service.ts` - Firestore operations
- `components/auth/login-dialog.tsx` - Login modal
- `components/auth/user-avatar.tsx` - User dropdown
- `components/navbar-with-auth.tsx` - Updated navbar

## 8. Usage

1. Users can sign in with Google
2. Saved configurations are stored per user in Firestore
3. Users can only access their own saved sessions
4. All existing functionality remains the same
5. Export includes user-specific data with ENV/QUOI columns

## 9. Testing

1. Start your development server: `npm run dev`
2. Create an account with email and password (or sign in if you already have one)
3. Access the protected platform
4. Create some cost configurations
5. Save sessions - they'll be stored in Firestore
6. Export sessions to see CSV with ENV/QUOI columns

## 10. Production Deployment

Before deploying to production:

1. Update Firestore rules to production mode
2. Add your production domain to Firebase Auth
3. Set environment variables in your hosting platform
4. Test authentication flow thoroughly 