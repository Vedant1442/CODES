const express = require('express');
const router = express.Router();
const {
  createBasket,
  getBasket,
  joinBasket,
  addItem,
  removeItem,
} = require('../controllers/basketController');

router.post('/', createBasket);
router.get('/:shareCode', getBasket);
router.post('/:shareCode/join', joinBasket);
router.post('/:shareCode/items', addItem);
router.delete('/:shareCode/items/:itemId', removeItem);

module.exports = router;
