const db = require('../config/database');
const generateId = require('../utils/idGenerator');

exports.getAll = (req, res) => {

  db.all("SELECT * FROM clientes", [], (err, rows) => {
    if (err)
      return res.status(500).json({ error: err.message });

    res.json(rows);
  });

};

exports.getById = (req, res) => {

  const { id } = req.params;

  db.get(
    "SELECT * FROM clientes WHERE id = ?",
    [id],
    (err, row) => {

      if (err)
        return res.status(500).json({ error: err.message });

      if (!row)
        return res.status(404).json({ message: "Cliente no encontrado" });

      res.json(row);
    }
  );
};

exports.create = async (req, res) => {

  try {

    const clienteId = await generateId('cliente', 'I');

    const { nombre, telefono, email } = req.body;

    db.run(
      `INSERT INTO clientes (id, nombre, telefono, email)
       VALUES (?, ?, ?, ?)`,
      [clienteId, nombre, telefono, email],
      function (err) {

        if (err)
          return res.status(500).json({ error: err.message });

        res.status(201).json({
          message: "Cliente creado",
          id: clienteId
        });
      }
    );

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = (req, res) => {

  const { id } = req.params;
  const { nombre, telefono, email } = req.body;

  db.run(
    `UPDATE clientes
     SET nombre = ?, telefono = ?, email = ?
     WHERE id = ?`,
    [nombre, telefono, email, id],
    function (err) {

      if (err)
        return res.status(500).json({ error: err.message });

      res.json({ message: "Cliente actualizado" });
    }
  );
};

exports.delete = (req, res) => {

  const { id } = req.params;

  db.run(
    "DELETE FROM clientes WHERE id = ?",
    [id],
    function (err) {

      if (err)
        return res.status(500).json({ error: err.message });

      res.json({ message: "Cliente eliminado" });
    }
  );
};