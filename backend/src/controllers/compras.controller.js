const db = require('../config/database');

// ========================================
// CREAR COMPRA COMPLETA
// ========================================
const generateId = require('../utils/idGenerator');
exports.create = async (req, res) => {

  const { proveedor_id, items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({
      message: "La compra debe tener productos"
    });
  }

  db.serialize(() => {

    db.run("BEGIN TRANSACTION");

    let total = 0;

    items.forEach(item => {
      total += item.cantidad * item.costo;
    });

    // Insertar compra
    db.run(
      "INSERT INTO compras (proveedor_id, total) VALUES (?, ?)",
      [proveedor_id, total],
      async function (err) {

        if (err) {
          db.run("ROLLBACK");
          return res.status(500).json({ error: err.message });
        }

        const compraId = await generateId('compra', 'O');

        const stmt = db.prepare(`
          INSERT INTO compras_detalle 
          (compra_id, producto_id, cantidad, costo_unitario, subtotal)
          VALUES (?, ?, ?, ?, ?)
        `);

        items.forEach(item => {

          const subtotal = item.cantidad * item.costo;

          // Verificar si producto existe
          db.get(
            "SELECT * FROM productos WHERE id = ?",
            [item.producto_id],
            (err, producto) => {

              if (producto) {
                // Si existe → aumentar stock
                db.run(
                  "UPDATE productos SET stock = stock + ?, costo = ? WHERE id = ?",
                  [item.cantidad, item.costo, item.producto_id]
                );
              } else {
                // Si NO existe → crear producto nuevo
                db.run(
                  `INSERT INTO productos 
                  (codigo, nombre, categoria_id, precio, costo, stock)
                  VALUES (?, ?, ?, ?, ?, ?)`,
                  [
                    item.codigo,
                    item.nombre,
                    item.categoria_id,
                    item.precio,
                    item.costo,
                    item.cantidad
                  ]
                );
              }

            }
          );

          stmt.run(
            compraId,
            item.producto_id,
            item.cantidad,
            item.costo,
            subtotal
          );
        });

        stmt.finalize();

        db.run("COMMIT");

        res.status(201).json({
          message: "Compra registrada correctamente",
          compra_id: compraId,
          total
        });
      }
    );
  });
};
// ========================================
// GET TODAS LAS COMPRAS
// ========================================
exports.getAll = (req, res) => {

  const sql = `
    SELECT c.id, c.fecha, c.total,
           p.nombre AS proveedor
    FROM compras c
    LEFT JOIN proveedores p ON c.proveedor_id = p.id
    ORDER BY c.id DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err)
      return res.status(500).json({ error: err.message });

    res.json(rows);
  });
};

// ========================================
// GET DETALLE DE COMPRA
// ========================================
exports.getById = (req, res) => {

  const compraId = req.params.id;

  db.get(
    `SELECT * FROM compras WHERE id = ?`,
    [compraId],
    (err, compra) => {

      if (err)
        return res.status(500).json({ error: err.message });

      if (!compra)
        return res.status(404).json({ message: "Compra no encontrada" });

      db.all(
        `SELECT cd.*, pr.nombre
         FROM compras_detalle cd
         JOIN productos pr ON cd.producto_id = pr.id
         WHERE cd.compra_id = ?`,
        [compraId],
        (err, detalles) => {

          if (err)
            return res.status(500).json({ error: err.message });

          compra.items = detalles;

          res.json(compra);
        }
      );
    }
  );
};