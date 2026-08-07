import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get timeline for a specific case (Petition or Complaint)
router.get('/:type/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { type, id } = req.params;
    
    if (type === 'petition') {
      const updates = await prisma.projectUpdate.findMany({
        where: { petitionId: id },
        orderBy: { stage: 'asc' }
      });
      return res.json(updates);
    } else if (type === 'complaint') {
      const updates = await prisma.projectUpdate.findMany({
        where: { complaintId: id },
        orderBy: { stage: 'asc' }
      });
      return res.json(updates);
    }
    
    res.status(400).json({ error: 'Invalid type' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project timeline' });
  }
});

// Admin: Advance a project to the next stage
router.post('/advance', authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin only' });
    }

    const { caseId, type, stage, title, description } = req.body;

    const update = await prisma.projectUpdate.create({
      data: {
        stage,
        title,
        description,
        [type === 'petition' ? 'petitionId' : 'complaintId']: caseId
      }
    });

    // Also update the main item status to "REVIEWING" or "RESOLVED" if it reaches stage 1 or 7
    if (type === 'petition') {
      await prisma.petition.update({
        where: { id: caseId },
        data: { status: stage === 7 ? 'RESOLVED' : 'REVIEWING' }
      });
    } else {
      await prisma.complaint.update({
        where: { id: caseId },
        data: { status: stage === 7 ? 'RESOLVED' : 'APPROVED' }
      });
    }

    // Get the creator of the petition/complaint
    let creatorId = '';
    let projectTitle = '';
    if (type === 'petition') {
      const petition = await prisma.petition.findUnique({ where: { id: caseId } });
      creatorId = petition?.creatorId || '';
      projectTitle = petition?.title || 'Petition';
    } else {
      const complaint = await prisma.complaint.findUnique({ where: { id: caseId } });
      creatorId = complaint?.creatorId || '';
      projectTitle = complaint?.category || 'Complaint';
    }

    // Create a persistent notification for the user
    if (creatorId) {
      await prisma.notification.create({
        data: {
          userId: creatorId,
          title: 'Lifecycle Update Approved',
          message: `Stage ${stage}: ${title} has been approved for "${projectTitle}".`,
          type: 'SUCCESS',
          link: `/dashboard?view=Monitor&id=${caseId}`
        }
      });
    }

    // Emit live update to all connected clients (global update)
    const io = req.app.get('io');
    if (io) {
      io.emit('project_update', { 
        id: caseId, 
        type, 
        stage, 
        title, 
        description,
        timestamp: update.timestamp 
      });

      // Targeted notification for the creator
      if (creatorId) {
        io.to(`user_${creatorId}`).emit('project_notification', {
          title: 'Stage Approved',
          message: `Stage ${stage} approved for ${projectTitle}`,
          projectId: caseId,
          type: 'SUCCESS'
        });
      }
    }

    res.json(update);
  } catch (error) {
    console.error('Advance project failed:', error);
    res.status(500).json({ error: 'Failed to advance project lifecycle' });
  }
});

export default router;
