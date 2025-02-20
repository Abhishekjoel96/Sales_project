// backend/src/routes/leadRoutes.ts
import express from 'express';
import * as leadController from '../controllers/leadController';

const router = express.Router();

router.post('/', leadController.createLead);
router.get('/', leadController.getAllLeads);
router.get('/:id', leadController.getLeadById);
router.put('/:id', leadController.updateLead);
router.delete('/:id', leadController.deleteLead);

export default router;