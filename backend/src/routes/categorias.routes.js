const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/categorias.controller');

router.get('/', categoriasController.getAll);
router.get('/:id', categoriasController.getById);
router.post('/', categoriasController.create);
router.put('/:id', categoriasController.update);
router.delete('/:id', categoriasController.delete);

module.exports = router;