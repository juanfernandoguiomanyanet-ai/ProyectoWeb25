/* ═══════════════════════════════════════
 js/compras.js — Módulo de Registro de Compras
 ═══════════════════════════════════════ */

// ─── ESTADO LOCAL ────────────────────────────────────────
let compraItems = [];

// ─── CARGA Y RENDER ──────────────────────────────────────

/** Carga las compras y proveedores desde la API y renderiza la tabla */
async function loadCompras() {
  document.getElementById('comp-loading').style.display = 'flex';
  document.getElementById('comp-table').style.display = 'none';

  // Cambio: apiGet ahora devuelve el array directamente o []
  const [compras, proveedores] = await Promise.all([
    apiGet('compras'),
    state.proveedores.length ? Promise.resolve(state.proveedores) : apiGet('proveedores')
  ]);

  state.compras = compras;
  if (!state.proveedores.length) state.proveedores = proveedores;

  renderCompras(compras);
}

/**
* Renderiza la tabla de compras
* @param {Array} data
*/
function renderCompras(data) {
  document.getElementById('comp-loading').style.display = 'none';
  document.getElementById('comp-table').style.display = 'table';

  const body = document.getElementById('comp-body');

  if (!data.length) {
    body.innerHTML = `<tr>
   <td colspan="5" style="text-align:center;color:var(--text3);padding:32px">
    Sin compras registradas
   </td>
  </tr>`;
    return;
  }

  body.innerHTML = data.map(c => {
    let resumenProductos = '—';
    try {
      const arr = JSON.parse(c.productos || c.itemsJson || '[]');
      if (arr.length) {
        resumenProductos = arr
          .map(x => `${x.nombre || x.n} ×${x.cantidad || x.qty}`)
          .join(', ');
      }
    } catch { /* sin detalle */ }

    return `<tr>
   <td><span class="badge badge-amber">${c.id || c.ID || '—'}</span></td>
   <td>${c.fecha || '—'}</td>
   <td>${c.proveedor || c.proveedorId || '—'}</td>
   <td style="font-size:12px;max-width:180px;overflow:hidden;
        text-overflow:ellipsis;white-space:nowrap">
    ${resumenProductos}
   </td>
   <td style="font-weight:600">${fmt(c.totalcosto || c.total)}</td>
  </tr>`;
  }).join('');
}

// ─── MODAL NUEVA COMPRA ──────────────────────────────────

/** Abre el modal para crear una nueva compra */
function abrirModalCompra() {
  compraItems = [];

  document.getElementById('compra-id').value = 'CO-' + uid();
  document.getElementById('compra-fecha').value = today();

  poblarSelectProveedoresCompra();
  renderCompraItems();
  abrirModal('modal-compra');
}

/** Rellena el select de proveedores en el modal de compra */
function poblarSelectProveedoresCompra() {
  const sel = document.getElementById('compra-prov');
  sel.innerHTML = '<option value="">Seleccionar proveedor…</option>';
  state.proveedores.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.nombre || p.ID || p.id; // Priorizamos nombre para legibilidad en la tabla
    opt.textContent = p.nombre;
    sel.appendChild(opt);
  });
}

// ─── ÍTEMS DE COMPRA ─────────────────────────────────────

/** Agrega una fila vacía a la lista de productos de la compra */
function addCompraItem() {
  // Solo añadimos categoria y venta al objeto
  compraItems.push({ nombre: '', categoria: '', cantidad: 1, costo: 0, venta: 0 });
  renderCompraItems();
}

/** Re-dibuja la lista de ítems de compra y actualiza el total */
function renderCompraItems() {
  const el = document.getElementById('compra-items-list');

  if (!compraItems.length) {
    el.innerHTML = `<div style="padding:14px;text-align:center;font-size:13px;color:var(--text3)">
 Agrega productos con el botón de abajo
 </div>`;
    calcTotalCompra();
    return;
  }

  el.innerHTML = compraItems.map((item, i) => `
 <div class="compra-item-row">
 <input type="text"
   placeholder="Producto"
   value="${item.nombre}"
   oninput="compraItems[${i}].nombre = this.value">
   <input type="text"
   placeholder="Categoría"
   value="${item.categoria || ''}"
   oninput="compraItems[${i}].categoria = this.value">
 <input type="number"
   placeholder="0"
   value="${item.cantidad}"
   min="1"
   oninput="compraItems[${i}].cantidad = Number(this.value); calcTotalCompra()">
 <input type="number"
   placeholder="Costo"
   value="${item.costo}"
   min="0"
   oninput="compraItems[${i}].costo = Number(this.value); calcTotalCompra()">
   <input type="number"
   placeholder="Venta"
   value="${item.venta || 0}"
   min="0"
   oninput="compraItems[${i}].venta = Number(this.value)">
 <button class="btn-icon"
   style="color:var(--danger)"
   onclick="eliminarItemCompra(${i})">
  ${iconoEliminar()}
 </button>
 </div>
`).join('');

  calcTotalCompra();
}

/**
* Elimina un ítem de la lista de compra
* @param {number} idx
*/
function eliminarItemCompra(idx) {
  compraItems.splice(idx, 1);
  renderCompraItems();
}

/** Calcula y muestra el total de costo de la compra */
function calcTotalCompra() {
  const total = compraItems.reduce((sum, x) => {
    return sum + (Number(x.cantidad || 0) * Number(x.costo || 0));
  }, 0);
  document.getElementById('compra-total').textContent = fmt(total);
}

// ─── GUARDAR COMPRA ──────────────────────────────────────

/** Valida y envía la compra al Google Sheets */
async function guardarCompra() {
const proveedor = document.getElementById('compra-prov').value;
if (!proveedor) { toast('Selecciona un proveedor', 'error'); return; }
if (!compraItems.length) { toast('Agrega al menos un producto', 'error'); return; }

const total = compraItems.reduce((sum, x) => sum + (Number(x.cantidad) * Number(x.costo)), 0);
 const compraId = document.getElementById('compra-id').value;

const compra = {
  id: compraId,
 ID: compraId,
 fecha:  document.getElementById('compra-fecha').value,
 proveedor,
 productos: JSON.stringify(compraItems.map(x => ({
 nombre: x.nombre,
   categoria: x.categoria, // Nuevo campo en el JSON
 cantidad: x.cantidad,
 costo: x.costo,
   venta: x.venta // Nuevo campo en el JSON
 }))),
 totalcosto: total
};

try {
 const result = await apiPost('compras', compra);
 if (result.ok || result.success) {
 toast('Compra registrada correctamente');
 cerrarModal('modal-compra');
 loadCompras();
 } else {
 toast('Error: ' + (result.error || result.message || ''), 'error');
 }
} catch (e) {
 toast('Error de conexión con el servidor', 'error');
}
}