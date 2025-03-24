import express from 'express';
import { googleLogin, login } from '../controllers/auth.controllers.js';

const router = express.Router();

router.post('/login',login);
router.post('/google-login',googleLogin)

export default router;