// backend/src/routes/calendarRoutes.ts
import express from 'express';
import * as calendarController from '../controllers/calendarController';

const router = express.Router();

router.post('/', calendarController.createAppointment);
router.get('/', calendarController.getAllAppointments);
router.get('/:id', calendarController.getAppointment);
router.put('/:id', calendarController.updateAppointment);
router.delete('/:id', calendarController.deleteAppointment);

export default router;