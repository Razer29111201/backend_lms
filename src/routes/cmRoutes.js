// src/routes/cmRoutes.js
import express from 'express';
import CMController from '../controllers/cmController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
const ROLES = { ADMIN: 0, TEACHER: 1, CM: 2 };
const router = express.Router();

router.get('/',
    authenticateToken,
    authorize(ROLES.ADMIN, ROLES.CM),
    CMController.getAll
);
router.get('/active', CMController.getActive);
router.get('/search', CMController.search);
router.get('/:id', CMController.getOne);
router.get('/:id/details', CMController.getDetails);
router.get('/:id/statistics', CMController.getStatistics);
router.post('/',
    authenticateToken,
    authorize(ROLES.ADMIN),
    CMController.create
);
router.put('/:id', CMController.update);
router.delete('/:id', CMController.delete);

export default router;