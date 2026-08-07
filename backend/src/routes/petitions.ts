import { Router } from 'express';
import prisma from '../lib/db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Submit a new petition
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { title, content, locationName, latitude, longitude, severityScore, population, targetAuthority } = req.body;
    
    if (!req.user) return res.status(401).json({ error: 'User not authenticated' });

    const petition = await prisma.petition.create({
      data: {
        title,
        content,
        locationName,
        latitude,
        longitude,
        severityScore,
        population,
        targetAuthority,
        creatorId: req.user.userId
      }
    });

    res.json(petition);
  } catch (error) {
    console.error('Failed to create petition:', error);
    res.status(500).json({ error: 'Petition submission failed' });
  }
});

// Get all petitions (Admin only)
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied: Admin only' });
    }
    const petitions = await prisma.petition.findMany({
      orderBy: { createdAt: 'desc' },
      include: { 
        creator: { select: { name: true, email: true } },
        updates: true
      }
    });
    res.json(petitions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch petitions' });
  }
});

// Get current user's petitions
router.get('/my', authenticate, async (req: AuthRequest, res) => {
  try {
    const petitions = await prisma.petition.findMany({
      where: { creatorId: req.user?.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(petitions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch your petitions' });
  }
});

// Get community feed (all petitions, anonymized)
router.get('/community', authenticate, async (_req: AuthRequest, res) => {
  try {
    const petitions = await prisma.petition.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, content: true, locationName: true,
        severityScore: true, population: true, status: true, createdAt: true
      }
    });
    res.json(petitions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch community feed' });
  }
});

// Get user stats
router.get('/stats', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    const all = await prisma.petition.findMany({ where: { creatorId: userId } });
    const approved = all.filter(p => p.status === 'APPROVED').length;
    const rejected = all.filter(p => p.status === 'REJECTED').length;
    const pending = all.filter(p => p.status === 'PENDING').length;
    const locations = [...new Set(all.map(p => p.locationName))];
    res.json({
      total: all.length, approved, rejected, pending,
      approvalRate: all.length > 0 ? Math.round((approved / all.length) * 100) : 0,
      locations,
      rank: all.length >= 10 ? 'ELITE ADVOCATE' : all.length >= 5 ? 'SENIOR ANALYST' : all.length >= 1 ? 'FIELD OPERATIVE' : 'RECRUIT'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Admin: Get all users
router.get('/users', authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true,
        petitions: { select: { id: true, status: true, severityScore: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update status (for admin Kanban)
router.patch('/:id/status', authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

    const { status, rejectionReason } = req.body;
    const petition = await prisma.petition.update({
      where: { id: req.params.id },
      data: { status, rejectionReason }
    });

    // If APPROVED, initialize the lifecycle at Stage 2
    if (status === 'APPROVED') {
      await prisma.projectUpdate.createMany({
        data: [
          {
            stage: 1,
            title: 'Verified',
            description: 'Report validated by InfraLense intelligence core.',
            petitionId: petition.id
          },
          {
            stage: 2,
            title: 'Admin Approval',
            description: 'Administrative Approval (AA) granted for project initiation.',
            petitionId: petition.id
          }
        ]
      });
    }

    res.json(petition);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update petition status' });
  }
});

export default router;
