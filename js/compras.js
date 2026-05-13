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
    body.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:32px">Sin compras</td></tr>`;
    return;
  }

  body.innerHTML = data.map(c => {
    let resumenProductos = '—';
    
    // Intentamos extraer el nombre del producto de diferentes posibles llaves
    const prodData = c.productos || c.PRODUCTOS || '';
    
    try {
      // Si es un JSON (como tus primeras filas), lo parseamos
      if (prodData.startsWith('[')) {
        const arr = JSON.parse(prodData);
        resumenProductos = arr.map(x => `${x.nombre || x.n} ×${x.cantidad || x.qty}`).join(', ');
      } else {
        // Si es texto plano (como el nuevo guardado), lo usamos directo
        resumenProductos = prodData || '—';
      }
    } catch {
      resumenProductos = prodData || '—';
    }

    // BUSCAMOS LAS LLAVES CORRECTAS PARA PROVEEDOR Y COSTO
    const prov = c.proveedores || c.proveedor || c.PROVEEDOR || '—';
    const costo = c["total costo"] || c.totalcosto || c.TOTAL_COSTO || 0;

    return `
      <tr>
        <td><span class="badge badge-amber">${c.id || c.ID || '—'}</span></td>
        <td>${c.fecha ? c.fecha.split('T')[0] : '—'}</td>
        <td>${prov}</td>
        <td style="font-size:12px; max-width:250px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap" title="${resumenProductos}">
          ${resumenProductos}
        </td>
        <td style="font-weight:600">${fmt(costo)}</td>
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
    <div class="compra-item-row" style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center;">
      <input type="text" placeholder="Producto" value="${item.nombre}" 
        style="flex: 2.5; min-width: 0;"
        oninput="compraItems[${i}].nombre = this.value">
      
      <input type="text" placeholder="Categoría" value="${item.categoria || ''}" 
        style="flex: 1.5; min-width: 0;"
        oninput="compraItems[${i}].categoria = this.value">
      
      <input type="number" placeholder="0" value="${item.cantidad}" min="1" 
        style="flex: 1; min-width: 0; text-align: center;"
        oninput="compraItems[${i}].cantidad = Number(this.value); calcTotalCompra()">
      
      <input type="number" placeholder="Costo" value="${item.costo}" min="0" 
        style="flex: 1.2; min-width: 0;"
        oninput="compraItems[${i}].costo = Number(this.value); calcTotalCompra()">
      
      <input type="number" placeholder="Venta" value="${item.venta || 0}" min="0" 
        style="flex: 1.2; min-width: 0;"
        oninput="compraItems[${i}].venta = Number(this.value)">
      
      <button class="btn-icon" style="color:var(--danger); width: 32px;" onclick="eliminarItemCompra(${i})">
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

  const fecha = document.getElementById('compra-fecha').value;
  const compraId = document.getElementById('compra-id').value;

  try {
    // 1. REGISTRAR CATEGORÍAS
    const categoriasUnicas = [...new Set(compraItems.map(x => x.categoria).filter(c => c))];
    for (const cat of categoriasUnicas) {
      await apiPost('categorias', { nombre: cat });
    }

    // DENTRO DE guardarCompra() en compras.js

    // 1. Guardar/Actualizar en Hoja "productos"
    for (const item of compraItems) {
      await apiPost('productos', {
        "nombre": item.nombre,      // Asegúrate que en Excel la columna sea exactamente "nombre"
        "categoria": item.categoria,
        "costo": item.costo,
        "precio": item.venta,
        "stock": item.cantidad      // Esto sumará/actualizará según tu Script de Google
      });
    }

    // 2. Guardar en Hoja "compras"
    for (const item of compraItems) {
      const filaCompra = {
        "id": compraId,
        "fecha": fecha,
        "proveedores": proveedor,
        // Enviamos el objeto detallado como JSON para que no se pierda la info
        "productos": `[{"nombre":"${item.nombre}","categoria":"${item.categoria}","cantidad":${item.cantidad},"costo":${item.costo},"venta":${item.venta}}]`,
        "total costo": item.costo * item.cantidad
      };
      await apiPost('compras', filaCompra);
    }

    toast('Compra y productos guardados correctamente');
    cerrarModal('modal-compra');
    loadCompras();

  } catch (e) {
    console.error(e);
    toast('Error al sincronizar con Sheets', 'error');
  }
}