function validarVenta(data) {
  if (!data.cliente_id) {
    return "cliente_id es obligatorio";
  }

  if (!Array.isArray(data.detalles) || data.detalles.length === 0) {
    return "Debe enviar al menos un producto en detalles";
  }

  for (let item of data.detalles) {
    if (!item.producto_id) {
      return "Cada detalle debe tener producto_id";
    }

    if (!item.cantidad || item.cantidad <= 0) {
      return "La cantidad debe ser mayor a 0";
    }
  }

  return null;
}

module.exports = { validarVenta };