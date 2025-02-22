// backend/src/routes/leadRoutes.ts
import express from 'express';
import * as leadController from '../controllers/leadController';
import multer from 'multer';

const router = express.Router();
const upload = multer(); //Handles the file

router.post('/', leadController.createLead);
router.get('/', leadController.getAllLeads);
router.get('/:id', leadController.getLeadById);
router.put('/:id', leadController.updateLead);
router.delete('/:id', leadController.deleteLead);
router.post('/import', upload.single('file'), leadController.importLeads); // New route for lead import


export default router;
