import express from 'express';
import { getUserById, test } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/test', test );
router.get("/:id",getUserById);

export default router;