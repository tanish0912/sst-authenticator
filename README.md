# Scaler College ID Verifier

A digital ID verification system built with Next.js and Firebase to replace physical ID cards for Scaler College students.

## Features

- Google Sign-In with @sst.scaler.com email restriction
- Single session per user
- Real-time OTP generation (30-second expiry)
- Admin dashboard for student verification
- Mobile-friendly UI
- Secure authentication and authorization

## Prerequisites

- Node.js 16.x or later
- Firebase account with Firestore database
- Google Cloud Platform project with OAuth 2.0 configured

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd authenticator
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with your Firebase configuration:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Set up your Firestore database with the following structure:
```
/students/{rollNumber}
  - name: string
  - photoUrl: string

/sessions/{userId}
  - email: string
  - lastActive: timestamp
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Students Collection
- Document ID: Roll Number (e.g., "24BCS10008")
- Fields:
  - name: Student's full name
  - photoUrl: URL to student's photo

### Sessions Collection
- Document ID: Firebase User UID
- Fields:
  - email: User's email address
  - lastActive: Timestamp of last activity

## Security Rules

Implement the following Firestore security rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /students/{rollNumber} {
      allow read: if request.auth != null;
    }
    match /sessions/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
