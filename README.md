LifeStream 🩸
LifeStream is a web application designed to connect blood donors with individuals in need. It provides a platform for users to register as donors, search for available donors, and facilitate a life-saving connection within their community.

✨ Features
Donor & Recipient Profiles: Create and manage user profiles with essential information like blood group, contact details, and location.

Smart Donor Search: Easily find potential donors by filtering for blood group, district, and upazila.

Real-time Notifications: Receive timely alerts for urgent donation requests (feature under development).

Interactive Maps: Use an integrated map to visualize donor locations (if applicable).

Secure Authentication: User authentication powered by Firebase.

Modern UI: A clean, responsive, and intuitive user interface built with Tailwind CSS and Daisy UI.

💻 Technologies
Frontend:

React: A JavaScript library for building user interfaces.

Vite: A fast build tool for modern web projects.

React Router: For declarative routing in the application.

Axios: A promise-based HTTP client for making API requests.

React Icons: A collection of popular icon sets for React projects.

React Google Maps: For integrating Google Maps functionality.

Jodit: A rich text editor for creating and managing content.

React-Toastify & Sweet Alert: For handling notifications and alerts.

Tailwind CSS & Daisy UI: A utility-first CSS framework and a component library for rapid UI development.

Backend:

Node.js (index.js): The runtime environment for the server-side API.

MongoDB: A NoSQL database for storing user, donor, and other application data.

Firebase: Used specifically for handling user authentication (e.g., sign-in, sign-up, user sessions).

🚀 Getting Started
Follow these steps to get your project up and running locally.

Prerequisites
Node.js (v18 or higher)

npm (or yarn)

MongoDB Atlas account (or a local MongoDB instance)

A Firebase project with authentication enabled

Installation
Clone the repository:

git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

Set up the Frontend:

cd frontend # or wherever your React app is located
npm install

Set up the Backend:

cd backend # or wherever your backend code is located
npm install

Configuration
Create a .env file in your backend directory and add your environment variables:

MONGO_URI=your_mongodb_connection_string
FIREBASE_API_KEY=your_firebase_api_key
// ... any other secrets

Configure Firebase: Add your Firebase configuration details to your frontend project.

Running the Project
Start the Backend API:

cd backend
npm start # or 'node index.js'

Start the Frontend:

cd frontend
npm run dev

🔗 GitHub Repository
This project is hosted on GitHub. You can find the complete source code and contribute to the project at the following link:

https://github.com/your-username/your-repo-name

☁️ Vercel Deployment
This project is deployed using Vercel for continuous deployment.

Install Vercel CLI:

npm install -g vercel

Link your project:

cd frontend
vercel link

Follow the prompts to connect your local project to a Vercel project and link your GitHub repository.

Configure Environment Variables:
Since Vercel builds the frontend, you'll need to add your API endpoint URL and any other necessary environment variables (like your Firebase config) to your Vercel project settings.

Navigate to your project on the Vercel dashboard.

Go to Settings > Environment Variables.

Add your variables (e.g., VITE_API_URL if you're using Vite).

Deploy:
Every push to the main branch of your linked GitHub repository will automatically trigger a new deployment. You can also deploy manually from your terminal:

vercel --prod