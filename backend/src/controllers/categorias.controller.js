const db = require('../config/database');
const generateId = require('../utils/idGenerator');

exports.getAll = (req, res) => {

  db.all("SELECT * FROM categorias", [], (err, rows) => {
    if (err)
      return res.status(500).json({ error: err.message });

    res.json(rows);
  });

};

exports.getById = (req, res) => {

  const { id } = req.params;

  db.get(
    "SELECT * FROM categorias WHERE id = ?",
    [id],
    (err, row) => {

      if (err)
        return res.status(500).json({ error: err.message });

      if (!row)
        return res.status(404).json({ message: "Categoría no encontrada" });

      res.json(row);
    }
  );
};

exports.create = async (req, res) => {

  try {

    const categoriaId = await generateId('categoria', 'A');

    const { nombre, descripcion } = req.body;

    db.run(
      `INSERT INTO categorias (id, nombre, descripcion)
       VALUES (?, ?, ?)`,
      [categoriaId, nombre, descripcion],
      function (err) {

        if (err)
          return res.status(500).json({ error: err.message });

        res.status(201).json({
          message: "Categoría creada",
          id: categoriaId
        });
      }
    );

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = (req, res) => {

  const { id } = req.params;
  const { nombre, descripcion } = req.body;

  db.run(
    `UPDATE categorias
     SET nombre = ?, descripcion = ?
     WHERE id = ?`,
    [nombre, descripcion, id],
    function (err) {

      if (err)
        return res.status(500).json({ error: err.message });

      res.json({ message: "Categoría actualizada" });
    }
  );
};

exports.delete = (req, res) => {

  const { id } = req.params;

  db.run(
    "DELETE FROM categorias WHERE id = ?",
    [id],
    function (err) {

      if (err)
        return res.status(500).json({ error: err.message });

      res.json({ message: "Categoría eliminada" });
    }
  );
};