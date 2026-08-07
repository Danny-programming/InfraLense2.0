import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth';
import analysisRoutes from './routes/analysis';
import recommendationRoutes from './routes/recommendations';
import petitionRoutes from './routes/petitions';
import announcementRoutes from './routes/announcements';
import complaintRoutes from './routes/complaints';
import projectRoutes from './routes/projects';
import adminRoutes from './routes/admin';
import notificationRoutes from './routes/notifications';
import { authenticate } from './middleware/auth';
import path from 'path';

dotenv.config();

const app = express();
const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: { origin: '*' }
});
app.set('io', io);

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/petitions', petitionRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
