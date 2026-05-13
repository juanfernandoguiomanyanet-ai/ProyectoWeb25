/* ═══════════════════════════════════════
   js/productos.js — Módulo de Gestión de Productos
   ═══════════════════════════════════════ */

// ─── CARGA Y RENDER ──────────────────────────────────────

/** Carga productos y categorías desde la API y renderiza la tabla */
async function loadProductos() {
  document.getElementById('prod-loading').style.display = 'flex';
  document.getElementById('prod-table').style.display   = 'none';

  const [productos, categorias] = await Promise.all([
    apiGet('productos'),
    state.categorias.length ? Promise.resolve(state.categorias) : apiGet('categorias')
  ]);

  state.productos  = productos;
  if (!state.categorias.length) state.categorias = categorias;

  renderTablaProductos(productos);
}

/**
 * Renderiza la tabla de productos
 * @param {Array} data
 */
function renderTablaProductos(data) {
  document.getElementById('prod-loading').style.display = 'none';
  document.getElementById('prod-table').style.display   = 'table';

  const body = document.getElementById('prod-body');

  if (!data.length) {
    body.innerHTML = `<tr>
      <td colspan="7" style="text-align:center;color:var(--text3);padding:32px">
        Sin productos registrados
      </td>
    </tr>`;
    return;
  }

  body.innerHTML = data.map(p => {
    const stock = Number(p.stock || 0);
    const stockBadge = stock === 0 ? 'badge-red' : stock < 5 ? 'badge-amber' : 'badge-green';

    return `<tr>
      <td>
        <code style="font-size:12px;background:var(--surface2);padding:2px 7px;border-radius:4px">
          ${p.codigo || '—'}
        </code>
      </td>
      <td style="font-weight:500">${p.nombre || '—'}</td>
      <td>${p.categoria ? `<span class="badge badge-info">${p.categoria}</span>` : '—'}</td>
      <td>${fmt(p.precio)}</td>
      <td style="color:var(--text2)">${fmt(p.costo)}</td>
      <td><span class="badge ${stockBadge}">${stock}</span></td>
      <td>
        <button class="btn-icon" title="Editar producto"
                onclick='abrirEditProducto(${JSON.stringify(p).replace(/'/g, "&#39;")})'>
          ${iconoEditar()}
        </button>
      </td>
    </tr>`;
  }).join('');
}

/** Filtra la tabla de productos por texto de búsqueda */
function filtrarTablaProductos() {
  const query = document.getElementById('search-prod-table').value.toLowerCase();
  const filtrados = state.productos.filter(p =>
    (p.nombre || '').toLowerCase().includes(query) ||
    (p.codigo || '').toLowerCase().includes(query)
  );
  renderTablaProductos(filtrados);
}

// ─── MODAL PRODUCTO ──────────────────────────────────────

/** Abre el modal en modo creación */
function abrirModalProducto() {
  document.getElementById('modal-prod-title').textContent = 'Nuevo producto';
  document.getElementById('prod-edit-codigo').value = '';

  ['prod-codigo', 'prod-nombre', 'prod-precio', 'prod-costo', 'prod-stock']
    .forEach(id => document.getElementById(id).value = '');

  poblarSelectCatProducto('');
  abrirModal('modal-producto');
}

/**
 * Abre el modal en modo edición con los datos del producto
 * @param {Object} producto
 */
function abrirEditProducto(producto) {
  document.getElementById('modal-prod-title').textContent = 'Editar producto';
  document.getElementById('prod-edit-codigo').value = producto.codigo || '';
  document.getElementById('prod-codigo').value      = producto.codigo || '';
  document.getElementById('prod-nombre').value      = producto.nombre || '';
  document.getElementById('prod-precio').value      = producto.precio || '';
  document.getElementById('prod-costo').value       = producto.costo  || '';
  document.getElementById('prod-stock').value       = producto.stock  || '';

  poblarSelectCatProducto(producto.categoria || '');
  abrirModal('modal-producto');
}

/**
 * Llena el select de categorías en el formulario de producto
 * @param {string} seleccionada - categoría actualmente seleccionada
 */
function poblarSelectCatProducto(seleccionada = '') {
  const sel = document.getElementById('prod-categoria');
  sel.innerHTML = '<option value="">Sin categoría</option>';
  state.categorias.forEach(c => {
    const opt = document.createElement('option');
    opt.value       = c.nombre || c.ID;
    opt.textContent = c.nombre;
    if (c.nombre === seleccionada || c.ID === seleccionada) opt.selected = true;
    sel.appendChild(opt);
  });
}

// ─── GUARDAR PRODUCTO ────────────────────────────────────

/** Valida y envía el producto al Google Sheets */
async function guardarProducto() {
  const nombre = document.getElementById('prod-nombre').value.trim();
  const codigo = document.getElementById('prod-codigo').value.trim();
  
  if (!nombre) { toast('El nombre es obligatorio', 'error'); return; }

  const producto = {
    id: codigo, // <-- Google Script usa esto para buscar la fila
    codigo: codigo,
    nombre: nombre,
    categoria: document.getElementById('prod-categoria').value,
    precio: Number(document.getElementById('prod-precio').value) || 0,
    costo: Number(document.getElementById('prod-costo').value) || 0,
    stock: Number(document.getElementById('prod-stock').value) || 0,
  };

  try {
    const result = await apiPost('productos', producto);
    
    // Tu script devuelve { ok: true }
    if (result.ok || result.success) { 
      toast('¡Producto guardado en Excel!');
      cerrarModal('modal-producto');
      loadProductos(); // Recarga la tabla
    } else {
      toast('Error: ' + (result.error || 'No se pudo guardar'), 'error');
    }
  } catch (e) {
    toast('Error de conexión', 'error');
  }
}
