# 💧 Hydration Tracker

A gamified water tracking app built with Next.js, Firebase, and shadcn/ui to help you and your friends stay hydrated! Track your daily water intake based on your body weight (1L per 20kg formula), compete with friends on leaderboards, and unlock achievements.

## ✨ Features

- 🔐 **Authentication**: Email/password and Google sign-in
- 💧 **Smart Water Tracking**: Daily goals calculated as weight ÷ 20 liters
- 🎮 **Gamification**: Achievements, streaks, and leaderboards
- 👥 **Social Features**: Add friends using unique friend codes
- 🎨 **Beautiful UI**: Animated progress displays with liquid wave effects
- 🎉 **Fun Graphics**: Confetti and water droplet animations on each intake
- 📊 **Progress Visualization**: Circular progress indicators with real-time updates
- 🌙 **Dark Mode Support**: Automatic theme detection

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A Firebase account ([Create one here](https://console.firebase.google.com/))

### 1. Clone and Install

```bash
cd water-tracker-app
npm install
```

### 2. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication**:
   - Go to Authentication > Sign-in method
   - Enable Email/Password
   - Enable Google (optional)
4. Create **Firestore Database**:
   - Go to Firestore Database > Create database
   - Start in production mode
   - Choose a location
5. Get your Firebase config:
   - Go to Project Settings > General
   - Scroll to "Your apps" > Web app
   - Copy the configuration values

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp env.example.txt .env.local
```

Edit `.env.local` and add your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Set Up Firestore Security Rules

In Firebase Console > Firestore Database > Rules, add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    match /waterIntakes/{intakeId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    
    match /achievements/{achievementId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 How to Use

1. **Sign up** with your weight in kg
2. Use **quick-add buttons** or custom amounts to log water intake
3. **Share your friend code** to connect with friends
4. Check the **Leaderboard** and earn **Achievements**!

## 🏆 Achievement Types

- 💧 First Drop, 🎯 Perfectly Hydrated, 🔥 Week Warrior
- 🦸 Hydration Hero, 🏃 Marathon Sipper, 🦋 Social Butterfly, ⭐ Overachiever

## 🐛 Troubleshooting

**"Firebase not configured"**: Ensure `.env.local` exists and restart dev server

**Authentication issues**: Verify Firebase Authentication is enabled

**Firestore errors**: Check security rules are properly configured

---

Built with 💙 for staying hydrated with friends!
