// backend/routes/event.route.js
import express from 'express';
import { createEvent, deleteEvent, getAllEvents, getEvents, updateEvent } from '../controllers/event.controller.js';

const router = express.Router();

router.post('/create', createEvent);
router.get('/room/:room', getEvents);
router.delete("/:id", deleteEvent);
router.post("/update/:id", updateEvent);
router.get("/getAllEvents",getAllEvents);



export default router;