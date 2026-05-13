const express = require('express');
const router = express.Router();
const controller = require('../controllers/compras.controller');

router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);

module.exports = router;