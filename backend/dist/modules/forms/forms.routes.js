"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const forms_controller_1 = require("./forms.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
const formController = new forms_controller_1.FormController();
// Public routes (for mobile app)
router.get('/', formController.listForms.bind(formController));
router.get('/:id', formController.getForm.bind(formController));
// Admin routes
router.post('/', auth_1.authenticate, auth_1.requireAdmin, formController.createForm.bind(formController));
router.put('/:id', auth_1.authenticate, auth_1.requireAdmin, formController.updateForm.bind(formController));
router.delete('/:id', auth_1.authenticate, auth_1.requireAdmin, formController.deleteForm.bind(formController));
exports.default = router;
//# sourceMappingURL=forms.routes.js.map