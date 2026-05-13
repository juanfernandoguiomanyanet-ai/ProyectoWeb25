const db = require('../config/database');

// GET TODOS
exports.getAll = (req, res) => {
  db.all("SELECT * FROM productos ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

// GET POR ID
exports.getById = (req, res) => {
  db.get("SELECT * FROM productos WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
};

// CREAR
const generateId = require('../utils/idGenerator');

exports.create = async (req, res) => {

  try {

    const id = await generateId('producto', 'P');

    const { nombre, categoria_id, precio, costo, stock } = req.body;

    db.run(
      `INSERT INTO productos 
       (id, nombre, categoria_id, precio, costo, stock)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, nombre, categoria_id, precio, costo, stock],
      function(err) {

        if (err)
          return res.status(500).json({ error: err.message });

        res.status(201).json({
          message: "Producto creado",
          id
        });
      }
    );

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ACTUALIZAR
exports.update = (req, res) => {
  const { nombre, categoria, precio, stock, imagen } = req.body;

  const sql = `
    UPDATE productos
    SET nombre = ?, categoria = ?, precio = ?, stock = ?, imagen = ?
    WHERE id = ?
  `;

  db.run(sql, [nombre, categoria, precio, stock, imagen, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Producto actualizado" });
  });
};

// ELIMINAR
exports.remove = (req, res) => {
  db.run("DELETE FROM productos WHERE id = ?", [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Producto eliminado" });
  });
};