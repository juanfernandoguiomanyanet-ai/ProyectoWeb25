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
      // Intentamos leer el JSON que me mostraste
      const arr = JSON.parse(c.productos || c.itemsJson || '[]');
      if (arr.length) {
        resumenProductos = arr
          .map(x => {
            // Si tiene categoría la mostramos, si no, solo nombre y cantidad
            const cat = x.categoria ? `[${x.categoria}] ` : '';
            return `${cat}${x.nombre || x.n} ×${x.cantidad || x.qty}`;
          })
          .join(', ');
      }
    } catch { /* sin detalle */ }

    return `<tr>
    <td><span class="badge badge-amber">${c.id || c.ID || '—'}</span></td>
    <td>${c.fecha || '—'}</td>
    <td>${c.proveedor || '—'}</td>
    <td style="font-size:12px; max-width:250px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap" title="${resumenProductos}">
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
/** Rellena el select de proveedores y añade opción de agregar nuevo */
/** Rellena el select de proveedores y abre el modal de proveedores.js si elige "Nuevo" */
function poblarSelectProveedoresCompra() {
  const sel = document.getElementById('compra-prov');
  
  // Mantenemos la estructura limpia
  sel.innerHTML = `
    <option value="">Seleccionar proveedor…</option>
    <option value="NUEVO_PROV" style="font-weight:bold; color:var(--primary)">+ AGREGAR NUEVO PROVEEDOR</option>
  `;

  state.proveedores.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.nombre || p.ID || p.id;
    opt.textContent = p.nombre;
    sel.appendChild(opt);
  });

  // Evento para detectar cuando quieres crear uno nuevo
  sel.onchange = (e) => {
    if (e.target.value === "NUEVO_PROV") {
      // 1. Cerramos el modal de compra actual para que no se encimen
      cerrarModal('modal-compra'); 
      
      // 2. Llamamos a la función que abre el formulario de la imagen (af75bc.png)
      // Nota: Asegúrate de que este sea el nombre de la función en tu proveedores.js
      if (typeof abrirModalProveedor === 'function') {
        abrirModalProveedor(); 
      } else {
        // Si no se llama así, intentamos con el nombre estándar de tus modales
        abrirModal('modal-proveedor'); 
      }
      
      // 3. Resetear el select por si el usuario cancela
      sel.value = "";
    }
  };
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
/** Valida y envía la compra, categorías y productos */
async function guardarCompra() {
  const proveedor = document.getElementById('compra-prov').value;
  if (!proveedor) { toast('Selecciona un proveedor', 'error'); return; }
  if (!compraItems.length) { toast('Agrega al menos un producto', 'error'); return; }

  // Extraer categorías únicas para guardarlas
  const categoriasUnicas = [...new Set(compraItems.map(x => x.categoria).filter(c => c))];

  const total = compraItems.reduce((sum, x) => sum + (Number(x.cantidad) * Number(x.costo)), 0);
  const compraId = document.getElementById('compra-id').value;

  const compra = {
    id: compraId,
    ID: compraId,
    fecha: document.getElementById('compra-fecha').value,
    proveedor,
    productos: JSON.stringify(compraItems.map(x => ({
      nombre: x.nombre,
      categoria: x.categoria,
      cantidad: x.cantidad,
      costo: x.costo,
      venta: x.venta
    }))),
    totalcosto: total
  };

  try {
    // REGISTRO DE CATEGORÍAS (Sin tocar el servidor, enviamos a la ruta de categorias)
    // Esto asume que tu API maneja 'categorias' igual que 'compras'
    for (const cat of categoriasUnicas) {
      await apiPost('categorias', { nombre: cat });
    }

    const result = await apiPost('compras', compra);
    if (result.ok || result.success) {
      toast('Compra y categorías registradas');
      cerrarModal('modal-compra');
      loadCompras();
    }
  } catch (e) {
    toast('Error al registrar datos', 'error');
  }
}