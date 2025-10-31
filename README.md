AI Powered Learning Management System (LMS)
===========================================

Overview
---------
This project integrates AI with modern web technologies to automate and enhance the online learning experience.
It supports both students and instructors through separate dashboards, providing AI-powered assistance, secure transactions, and efficient content management.

Objectives
-----------
- Automate lecture content generation using AI (transcripts, key points, quizzes).
- Enable interactive learning through an AI chatbot that understands course content.
- Provide secure authentication and one-time purchase access for courses.
- Offer real-time notifications and progress tracking for a seamless user experience.

Target Users
-------------
- **Students / Learners**: Watch lectures, generate AI-based quizzes and key points, interact with the chatbot for clarification.
- **Instructors / Lecturers**: Upload lectures, manage courses, monitor earnings, and view analytics.

Tech Stack
-----------
| Layer           | Technologies                                                |
|-----------------|-------------------------------------------------------------|
| Frontend        | React.js, Tailwind CSS, shadcn/ui, Redux Toolkit, RTK Query |
| Backend         | Node.js, Express.js                                         |
| Database        | MongoDB Atlas                                               |
| Authentication  | JWT-based Authentication                                    |
| Storage         | Cloudinary (for video and image uploads)                    |
| AI Models (LLMs)| Groq’s LLaMA-3.1-8B-Instant, Whisper-large-v3              |
| Payment Gateway | Stripe                                                      |
| Deployment      | Render (Frontend & Backend)                                 |

System Architecture
--------------------
The LMS follows a monolithic architecture for now, with future plans to transition to a microservices-based design.

**Components**
- **Frontend**: Built using React.js and Tailwind CSS, integrated with Redux Toolkit and RTK Query for state management and caching.
- **Backend**: Built on Node.js and Express, responsible for handling authentication, API routing, and AI integration.
- **Database**: MongoDB Atlas stores all user data, courses, transcripts, quizzes, payments, and notifications.
- **LLM Integration**: Integrated via Groq’s API for high-performance inference and near real-time AI responses.

Core Features
--------------
1. **Video and Image Upload**
   - Instructors upload lectures via Cloudinary.
   - Metadata and file URLs are stored in MongoDB.

2. **AI-Powered Transcription**
   - Uses Whisper-large-v3 for speech-to-text transcription.
   - Generates lecture transcripts automatically after upload.

3. **Quiz Generation**
   - Uses LLaMA-3.1-8B-Instant to generate quizzes from transcripts.
   - Each lecture has its own quiz stored in the database.

4. **Key Points Extraction**
   - LLaMA model extracts summarized key points from the transcript for quick learning.

5. **AI Chatbot**
   - A course-specific chatbot powered by Groq’s LLaMA-3.1-8B-Instant model.
   - Uses the lecture transcript for contextual understanding and answers student queries intelligently.

6. **Authentication & Authorization**
   - JWT-based authentication for secure login and route protection.
   - Role-based access control:
     - Students: Can only view and interact with courses.
     - Instructors: Can create and upload lectures and manage their courses.

7. **Payment Integration**
   - Stripe integration for secure one-time course purchases.
   - Purchase details and course access status are stored in MongoDB.

8. **Real-Time Notifications**
   - Implemented using WebSockets.
   - Students receive instant notifications about course updates, quiz availability, and progress.

Database Schema Overview
--------------------------
- **User Schema**: Stores user details, role (student/instructor), and purchased courses.
- **Course Schema**: Holds metadata, pricing, instructor reference, and publication status.
- **Lecture Schema**: Links to the course, stores transcript, quiz, key points, and video URL.
- **Quiz Schema**: Stores lecture-specific quiz questions and answers.
- **Payment Schema**: Tracks Stripe payment IDs, course IDs, and user transactions.
- **Notification Schema**: Stores event-based notifications for users.

API Routes Overview
--------------------
**User APIs**
- `POST /api/user/register` – Register new users
- `POST /api/user/login` – Login
- `GET /api/user/profile` – Get user profile
- `PUT /api/user/profile/update` – Update profile

**Course APIs**
- `POST /api/course` – Create a new course
- `GET /api/course/published-courses` – Fetch all published courses
- `POST /api/course/:courseId/lecture` – Upload a lecture video
- `GET /api/course/:courseId/lecture/:lectureId` – Fetch lecture details

**AI & Chatbot APIs**
- `POST /api/chatbot/course/:courseId/lecture/:lectureId/ask` – Ask AI chatbot a question
- `GET /api/course/:courseId/lecture/:lectureId/keypoints` – Fetch key points
- `POST /api/course/:courseId/lecture/:lectureId/quiz` – Generate or fetch quiz

**Payment APIs**
- `POST /api/checkout/create-checkout-session` – Create Stripe session
- `POST /api/checkout/webhook` – Handle Stripe webhook events

**Notifications APIs**
- `GET /api/notifications` – Get all user notifications
- `PATCH /api/notifications/read-all` – Mark all as read

LLM Workflow
-------------
1. Instructor uploads lecture → video stored in Cloudinary.
2. Whisper-large-v3 generates a transcript.
3. Transcript is saved in the Lecture schema.
4. LLaMA-3.1-8B-Instant uses the transcript to:
   - Generate multiple-choice quizzes.
   - Extract lecture key points.
   - Serve as a contextual chatbot for student queries.
5. Results are stored and accessible via respective APIs.

Environment Variables
----------------------
**Backend (.env):**
```
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STRIPE_SECRET_KEY=your_stripe_secret
GROQ_API_KEY=your_groq_api_key
USE_GROQ_WHISPER=true
```

**Frontend (.env):**
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

Setup Instructions
-------------------
**Backend**
```
cd backend
npm install
npm run dev
```

**Frontend**
```
cd frontend
npm install
npm run dev
```

Access the app at: `http://localhost:5173` (default Vite port).
