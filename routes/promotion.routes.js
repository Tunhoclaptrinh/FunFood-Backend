const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotion.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', promotionController.getPromotions);
router.get('/active', promotionController.getActivePromotions);
router.post('/validate', protect, promotionController.validatePromotion);
router.post('/', protect, authorize('admin'), promotionController.createPromotion);
router.put('/:id', protect, authorize('admin'), promotionController.updatePromotion);
router.delete('/:id', protect, authorize('admin'), promotionController.deletePromotion);

module.exports = router;