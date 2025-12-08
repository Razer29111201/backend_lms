// src/routes/cmRoutes.js
import express from 'express';
import CMController from '../controllers/cmController.js';

const router = express.Router();

router.get('/', CMController.getAll);
router.get('/active', CMController.getActive);
router.get('/search', CMController.search);
router.get('/:id', CMController.getOne);
router.get('/:id/details', CMController.getDetails);
router.get('/:id/statistics', CMController.getStatistics);
router.post('/', CMController.create);
router.put('/:id', CMController.update);
router.delete('/:id', CMController.delete);

export default router;