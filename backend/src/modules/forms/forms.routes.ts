import { Router } from 'express';
import { FormController } from './forms.controller';
import { authenticate, requireAdmin } from '../../middlewares/auth';

const router = Router();
const formController = new FormController();

// Public routes (for mobile app)
router.get('/', formController.listForms.bind(formController));
router.get('/:id', formController.getForm.bind(formController));

// Admin routes
router.post('/', authenticate, requireAdmin, formController.createForm.bind(formController));
router.put('/:id', authenticate, requireAdmin, formController.updateForm.bind(formController));
router.delete('/:id', authenticate, requireAdmin, formController.deleteForm.bind(formController));

export default router;
