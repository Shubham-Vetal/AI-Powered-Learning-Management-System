import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./database/db.js";
import userRoute from "./routes/user.route.js";
import courseRoute from "./routes/course.route.js";
import mediaRoute from "./routes/media.route.js";
import purchaseRoute from "./routes/purchaseCourse.route.js";
import courseProgressRoute from "./routes/courseProgress.route.js";
import chatbotRoute from "./routes/chatbot.routes.js";
import notificationRoute from "./routes/notification.routes.js";

dotenv.config({});

// call database connection here
connectDB();
const app = express();

const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "https://lms-frontend-7jc8.onrender.com"
      ];
      
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// CRITICAL: Webhook route needs raw body - must be BEFORE express.json()
app.use((req, res, next) => {
  if (req.originalUrl === '/api/v1/purchase/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use(cookieParser());

// Webhook route with raw body parser
import { stripeWebhook } from "./controllers/purchaseCourse.controller.js";
app.post('/api/v1/purchase/webhook', 
  express.raw({ type: 'application/json' }), 
  stripeWebhook
);
 
// Other API routes
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/progress", courseProgressRoute);
app.use("/api/v1/chatbot", chatbotRoute); 
app.use("/api/v1/notification", notificationRoute);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});
 
app.listen(PORT, () => {
    console.log(`Server listen at port ${PORT}`);
});
