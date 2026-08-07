import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get user notifications
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user?.userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticate, async (req: AuthRequest, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { 
        id: req.params.id,
        userId: req.user?.userId
      },
      data: { read: true }
    });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Delete all user notifications
router.delete('/', authenticate, async (req: AuthRequest, res) => {
  try {
    await prisma.notification.deleteMany({
      where: { userId: req.user?.userId }
    });
    res.json({ message: 'Notifications cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notifications' });
  }
});

export default router;
