# AI Doubt Solver

AI Doubt Solver is a full-stack student learning workspace built to help users organize doubts, manage study conversations, and interact with a modern AI-style chat interface. The project combines a clean dashboard, structured chat system, persistent conversation history, PDF export, and a fallback demo mode to keep the application usable even when the live AI API is unavailable.

## Project Overview

This project is designed as a student-focused doubt solving platform with a strong emphasis on usability and clarity. It provides a structured dashboard where users can manage conversations and a dedicated chat workspace for asking questions, revisiting previous sessions, and exporting conversations for later review.

The system is built using React for the frontend, Node.js and Express for the backend, and MongoDB for data storage. It also supports AI integration using Gemini API with proper fallback handling.

## Features

### Dashboard
- Personalized greeting section
- Total chat count display
- Quick access actions
- Recent conversations list
- Resume latest chat option
- Project status indicators

### Chat Workspace
- Multiple chat sessions
- Structured chat interface
- Formatted responses
- Smooth navigation between chats
- Screen-fitted layout (no unnecessary scrolling)

### Conversation Management
- Create new chats
- Rename chats
- Delete chats
- Open previous conversations
- Organized chat history

### Suggested Questions
- Predefined prompts for quick usage
- Covers common CS topics
- Helps users start quickly without typing

### PDF Export
- Export chat conversations as PDF
- Clean and readable format
- Useful for revision and sharing

### Fallback Demo Mode
- Activates when AI API quota is exceeded
- Prevents application failure
- Maintains chat flow and UI functionality
- Demonstrates production-level error handling

### User Interface
- Responsive design
- Modern dark theme
- Clean layout
- Smooth user experience

## Technologies Used

### Frontend
- React
- Vite
- Tailwind CSS
- React Markdown
- html2canvas
- jsPDF

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose

### AI Integration
- Gemini API
- REST API communication

## Project Structure

ai-doubt-solver/
client/
src/
components/
pages/
services/
server/
controllers/
middleware/
models/
routes/
.gitignore
README.md

## How the System Works

The user starts on the dashboard and creates or opens a chat session. Inside the chat workspace, the user can ask questions and manage conversations. The backend handles request processing and stores data in MongoDB. If the AI API is available, responses are generated dynamically. If not, fallback mode ensures the system continues to work.

## How to Download and Run Locally

Step 1: Clone the repository

git clone https://github.com/Gireeshsai12/ai-doubt-solver.git
cd ai-doubt-solver

Step 2: Install backend dependencies

cd server
npm install

Step 3: Configure environment variables

Create a file named .env inside the server folder and add:

PORT=5000
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key

Step 4: Start backend server

npm start

Backend runs on:
http://localhost:5000

Step 5: Install frontend dependencies

Open a new terminal:

cd client
npm install

Step 6: Start frontend

npm run dev

Frontend runs on:
http://localhost:5173

## How to Use the Application

Open the dashboard  
Go to http://localhost:5173 and view the main dashboard.

Start a new chat  
Click "Start New Chat" or "New Chat".

Ask a question  
Type your question or click a suggested question.

View response  
The response appears in the chat area. If AI API is unavailable, fallback mode handles it.

Manage conversations  
Use sidebar to open, rename, or delete chats.

Export chat as PDF  
Click "Export PDF" to download the conversation.

Resume previous chats  
Go to dashboard and select any chat to continue.

## Notes

- Ensure backend is running before frontend
- Use correct MongoDB connection string
- Do not upload .env file to GitHub
- If API quota is exceeded, fallback mode will be used

## Future Improvements

- Restore full AI response support
- Add authentication system
- Add voice input
- Add image-based questions
- Add analytics dashboard
- Deploy application

## Author

Gireeshsai Kalluri
