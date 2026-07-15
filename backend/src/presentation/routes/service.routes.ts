import { Router } from 'express';
import * as serviceController from '../controllers/service.controller';

const router = Router();

router.get('/', serviceController.listServices);
router.get('/categories', serviceController.getCategories);
router.get('/:slug', serviceController.getService);

export default router;
