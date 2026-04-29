# Track - Daily Routine & Goal Tracker

Track is a premium web application built with React, Vite, and Firebase that helps you monitor your daily routines, track long-term goals, and visualize your progress over time. It features a modern, responsive UI with glassmorphism design elements.

## Features

- **Authentication:** Secure sign-up, login, and Google authentication powered by Firebase.
- **Daily Checklist:** Manage your daily routines with customizable tasks, times, and icons. Switch between Daily, Weekly, and Monthly views.
- **Goal Tracker:** A visual 21-day hexagon-based goal tracking system to maintain consistency.
- **Progress Charts:** Interactive area charts (powered by Recharts) showing weekly completion rates.
- **History View:** Look back at your past performance and consistency.
- **Account Management:** Update your profile, manage settings, and handle your data securely.
- **Modern UI:** Premium design featuring glassmorphism, dynamic animations, and vibrant gradient text.

## Tech Stack

- **Frontend Framework:** React 19 + Vite 8
- **Styling:** Tailwind CSS + Vanilla CSS (for custom glassmorphism & animations)
- **Routing:** React Router v7
- **Database & Auth:** Firebase (Firestore & Authentication)
- **Charting:** Recharts

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository** (if applicable) or navigate to the project directory:
   ```bash
   cd Track
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Firebase Environment Variables:**
   Create a `.env` file in the root directory and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:5173` to view the application.

## Building for Production

To create a production build, run:
```bash
npm run build
```
This will compile your React app into the `dist` directory, ready to be deployed to any static hosting provider (e.g., Firebase Hosting, Vercel, Netlify).

## License

This project is licensed under the MIT License.
