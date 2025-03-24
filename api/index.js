import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { wss } from './webSocket/webSocket.js';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import eventRouter from './routes/event.route.js';
import path from 'path';
import fs from 'fs'; // Add fs for debugging

dotenv.config();

mongoose.connect(process.env.MONGO)
  .then(() => console.log('Connected to MongoDB!!'))
  .catch((error) => console.log(error));

const __dirname = path.resolve();
console.log('__dirname:', __dirname); // Log base directory

const staticPath = path.join(__dirname, 'client', 'dist');
console.log('Static path:', staticPath); // Log static path
if (fs.existsSync(staticPath)) {
  console.log('client/dist exists');
  console.log('Files in client/dist:', fs.readdirSync(staticPath));
} else {
  console.log('client/dist does NOT exist');
}

const app = express();
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ["http://localhost:5173", "http://localhost:5174"];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/event", eventRouter);

// Serve static files
app.use(express.static(staticPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Catch-all route for SPA
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'client', 'dist', 'index.html');
  console.log('Serving index.html from:', indexPath);
  res.sendFile(indexPath);
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});