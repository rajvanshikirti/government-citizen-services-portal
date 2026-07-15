import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema, updateProfileSchema, verifyAadhaarSchema } from '../validators/schemas';

const router = Router();

router.post('/verify-aadhaar', validate(verifyAadhaarSchema), authController.verifyAadhaar);
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, validate(updateProfileSchema), authController.updateProfile);

export default router;
