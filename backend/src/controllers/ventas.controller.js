const db = require("../config/database");
const { validarVenta } = require("../validators/ventas.validator");

const crearVenta = (req, res) => {
  const error = validarVenta(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error });
  }

  const { cliente_id, detalles, descuento = 0 } = req.body;

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    let total = 0;

    db.all(
      `SELECT id, precio, stock FROM productos 
       WHERE id IN (${detalles.map(() => "?").join(",")})`,
      detalles.map(d => d.producto_id),
      (err, productos) => {

        if (err) {
          db.run("ROLLBACK");
          return res.status(500).json({ success: false });
        }

        try {
          detalles.forEach(item => {
            const producto = productos.find(p => p.id === item.producto_id);

            if (!producto) {
              throw new Error(`Producto ${item.producto_id} no existe`);
            }

            if (producto.stock < item.cantidad) {
              throw new Error(`Stock insuficiente para producto ${item.producto_id}`);
            }

            total += producto.precio * item.cantidad;
          });

          total -= descuento;

          db.run(
            "INSERT INTO ventas (cliente_id, total, descuento) VALUES (?, ?, ?)",
            [cliente_id, total, descuento],
            function (err) {
              if (err) {
                db.run("ROLLBACK");
                return res.status(500).json({ success: false });
              }

              const ventaId = this.lastID;

              detalles.forEach(item => {
                db.run(
                  "INSERT INTO venta_detalles (venta_id, producto_id, cantidad) VALUES (?, ?, ?)",
                  [ventaId, item.producto_id, item.cantidad]
                );

                db.run(
                  "UPDATE productos SET stock = stock - ? WHERE id = ?",
                  [item.cantidad, item.producto_id]
                );
              });

              db.run("COMMIT");

              res.json({
                success: true,
                message: "Venta realizada correctamente",
                venta_id: ventaId,
                total
              });
            }
          );

        } catch (error) {
          db.run("ROLLBACK");
          return res.status(400).json({
            success: false,
            message: error.message
          });
        }
      }
    );
  });
};

module.exports = {
  crearVenta
};