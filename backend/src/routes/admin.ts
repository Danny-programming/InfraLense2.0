import express from 'express';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI((process.env.GEMINI_API_KEY || '').replace(/['"]+/g, ''));

router.post('/ai/suggest-rejection', authenticate, async (req: AuthRequest, res: any) => {
    try {
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Administrative clearance required.' });
        }

        const { id, type } = req.body;
        
        if (!id || !type) {
            return res.status(400).json({ error: 'Petition/Complaint ID and type are required.' });
        }

        let data;
        if (type === 'PETITION') {
            data = await prisma.petition.findUnique({ where: { id } });
        } else {
            data = await prisma.complaint.findUnique({ where: { id } });
        }

        if (!data) {
            return res.status(404).json({ error: 'Case not found in secure database.' });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        
        const prompt = `
            Context: Governance System "InfraLense".
            Case Type: ${type}
            Content: ${type === 'PETITION' ? (data as any).title + ": " + (data as any).content : (data as any).category + ": " + (data as any).description}
            Stats: Population ${(data as any).population || 'N/A'}, Severity ${type === 'PETITION' ? (data as any).severityScore : (data as any).severity}/10.

            Task: Draft a professional rejection message for the citizen. 
            Rules:
            - Start with a polite decision.
            - Cite a specific reason (e.g. population threshold, budget allocation, or policy alignment).
            - End with a "Path to Approval" (what the citizen should monitor for next steps).
            - Word limit: 80 words.
        `;

        const result = await model.generateContent(prompt);
        const suggestion = result.response.text().trim();

        res.json({ suggestion });
    } catch (error: any) {
        console.error("🔥 AI Generation Error:", error);
        res.status(500).json({ 
            error: 'AI Neural Link Timeout', 
            details: error.message,
            tip: 'Check if GEMINI_API_KEY is valid and backend was restarted.'
        });
    }
});

export default router;
