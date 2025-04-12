# Trust Pilot Clone

A full-stack web application for service reviews, inspired by TrustPilot.

## Features

- View and filter service listings
- Read reviews for services
- Submit reviews with ratings and optional images
- User authentication with email/password
- Admin panel for review moderation

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI)
- **Authentication**: Firebase Authentication
- **Database**: Firestore
- **Storage**: Firebase Storage

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Firebase account

### Setup

1. Clone the repository:

```bash
git clone https://github.com/your-username/trust-pilot-project.git
cd trust-pilot-project
```

2. Install dependencies:

```bash
npm install
# or
yarn
```

3. Set up Firebase:

   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication with Email/Password provider
   - Create a Firestore database
   - Enable Storage
   - Get your Firebase configuration from Project Settings > General > Your apps > Firebase SDK snippet > Config

4. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Firebase configuration values

```bash
cp .env.local.example .env.local
```

5. Run the development server:

```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Firebase Setup

#### Security Rules

For Firestore:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    match /services/{serviceId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

For Storage:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /reviews/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.resource.size < 5 * 1024 * 1024 && request.resource.contentType.matches('image/.*');
    }
  }
}
```

### Creating an Admin User

After registering a user, manually update the user's role in Firestore to make them an admin:

1. Go to Firestore in Firebase Console
2. Find the user document in the `users` collection
3. Update the `role` field to `"admin"`

## Project Structure

- `/app`: Next.js App Router pages and layout
- `/components`: Reusable UI components
- `/lib`: Firebase configuration and helper functions
- `/types`: TypeScript type definitions

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Material-UI](https://mui.com/)
- [Firebase](https://firebase.google.com/)
- [TrustPilot](https://www.trustpilot.com/) for inspiration
