/* ═══════════════════════════════════════
 js/ventas.js — Módulo de Punto de Venta
 ═══════════════════════════════════════ */

// ─── ESTADO LOCAL ────────────────────────────────────────
let carrito = [];
let metodoPago = 'Efectivo';
let ventaAbierta = null;
let prodFiltrados = [];

// ─── INICIALIZACIÓN ──────────────────────────────────────

/**
* Carga productos y clientes si no están en memoria,
* renderiza el catálogo y verifica si hay venta abierta guardada.
*/
async function initVentas() {
  if (!state.productos.length) {
    mostrarLoadingCatalogo(true);
    // Cambio: apiGet devuelve el array directamente
    const data = await apiGet('productos');
    state.productos = data;
    prodFiltrados = [...data];
    mostrarLoadingCatalogo(false);
    poblarFilterCat();
  } else {
    prodFiltrados = [...state.productos];
  }

  if (!state.clientes.length) {
    const clientes = await apiGet('clientes');
    state.clientes = clientes;
  }

  poblarSelectClientes();
  renderCatalog();
  checkVentaAbierta();
}

function mostrarLoadingCatalogo(mostrar) {
  document.getElementById('catalog-loading').style.display = mostrar ? 'flex' : 'none';
  document.getElementById('products-grid').style.display = mostrar ? 'none' : 'grid';
}

// ─── VENTA ABIERTA ───────────────────────────────────────

function checkVentaAbierta() {
  const guardada = localStorage.getItem('ventaAbierta');
  if (guardada) {
    ventaAbierta = JSON.parse(guardada);
    document.getElementById('venta-abierta-bar').style.display = 'flex';
    document.getElementById('venta-abierta-id').textContent = ventaAbierta.id;
  }
}

function guardarVentaAbierta() {
  if (!carrito.length) { toast('El carrito está vacío', 'error'); return; }

  const va = { id: 'V-' + uid(), items: carrito, metodoPago, ts: Date.now() };
  localStorage.setItem('ventaAbierta', JSON.stringify(va));
  ventaAbierta = va;

  document.getElementById('venta-abierta-bar').style.display = 'flex';
  document.getElementById('venta-abierta-id').textContent = va.id;
  toast('Venta guardada como abierta');
}

function retomar() {
  if (!ventaAbierta) return;
  carrito = [...ventaAbierta.items];
  metodoPago = ventaAbierta.metodoPago || 'Efectivo';

  document.querySelectorAll('.pay-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.textContent.trim().startsWith(metodoPago.slice(0, 5)));
  });

  renderCarrito();
  toast('Venta retomada');
}

function descartarVentaAbierta() {
  localStorage.removeItem('ventaAbierta');
  ventaAbierta = null;
  document.getElementById('venta-abierta-bar').style.display = 'none';
  toast('Venta descartada', 'warning');
}

// ─── CATÁLOGO ────────────────────────────────────────────

function renderCatalog() {
  renderProductCards(prodFiltrados.length ? prodFiltrados : state.productos);
}

function renderProductCards(lista) {
  const grid = document.getElementById('products-grid');

  if (!lista.length) {
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1;padding:32px">
   <p>Sin productos que mostrar</p>
  </div>`;
    return;
  }

  grid.innerHTML = lista.map(p => {
    const stock = Number(p.stock || 0);
    const stockClass = stock === 0 ? 'no-stock' : stock < 5 ? 'low-stock' : '';
    const codigoKey = p.codigo || p.nombre;

    return `<div class="product-card ${stockClass}" onclick="addToCart('${codigoKey}')">
   <div class="cat-dot"></div>
   <div class="name">${p.nombre || 'Sin nombre'}</div>
   <div class="price">${fmt(p.precio)}</div>
   <div class="stock ${stockClass}">Stock: ${stock}</div>
   <div class="edit-prod-trigger"
     onclick="event.stopPropagation(); abrirEditProdVenta('${codigoKey}')">
    Editar
   </div>
  </div>`;
  }).join('');
}

function poblarFilterCat() {
  const sel = document.getElementById('filter-cat');
  const cats = [...new Set(state.productos.map(p => p.categoria).filter(Boolean))];
  cats.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    sel.appendChild(opt);
  });
}

function filtrarProductos() {
  const query = document.getElementById('search-prod').value.toLowerCase();
  const cat = document.getElementById('filter-cat').value;

  prodFiltrados = state.productos.filter(p => {
    const matchQuery = !query
      || (p.nombre || '').toLowerCase().includes(query)
      || (p.codigo || '').toLowerCase().includes(query);
    const matchCat = !cat || (p.categoria || '') === cat;
    return matchQuery && matchCat;
  });

  renderProductCards(prodFiltrados);
}

// ─── CARRITO ─────────────────────────────────────────────

function addToCart(codigo) {
  const producto = state.productos.find(p => (p.codigo || p.nombre) === codigo);
  if (!producto) return;

  const stock = Number(producto.stock || 0);
  const enCarrito = carrito.find(x => x.codigo === codigo);

  if (enCarrito) {
    if (enCarrito.qty >= stock && stock > 0) {
      toast('No hay más stock disponible', 'error');
      return;
    }
    enCarrito.qty++;
  } else {
    if (stock === 0) { toast('Producto sin stock', 'error'); return; }
    carrito.push({
      codigo,
      nombre: producto.nombre,
      precio: Number(producto.precio),
      categoria: producto.categoria || '',
      qty: 1,
      stock
    });
  }

  renderCarrito();
}

function changeQty(codigo, delta) {
  const idx = carrito.findIndex(x => x.codigo === codigo);
  if (idx < 0) return;

  carrito[idx].qty += delta;
  if (carrito[idx].qty <= 0) carrito.splice(idx, 1);

  renderCarrito();
}

function limpiarCarrito() {
  carrito = [];
  renderCarrito();
}

function renderCarrito() {
  const el = document.getElementById('cart-items');

  if (!carrito.length) {
    el.innerHTML = `<div class="empty" style="padding:32px 0">
   <svg width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
   </svg>
   <p style="margin-top:8px;font-size:13px">Agrega productos al carrito</p>
  </div>`;
    document.getElementById('subtotal').textContent = '$0';
    document.getElementById('total-cart').textContent = '$0';
    return;
  }

  el.innerHTML = carrito.map(item => `
  <div class="cart-item">
   <div style="flex:1;min-width:0">
    <div class="item-name">${item.nombre}</div>
    <div class="item-cat">${item.categoria}</div>
   </div>
   <div class="qty-ctrl">
    <button onclick="changeQty('${item.codigo}', -1)">−</button>
    <span>${item.qty}</span>
    <button onclick="changeQty('${item.codigo}', +1)">+</button>
   </div>
   <div class="item-total">${fmt(item.precio * item.qty)}</div>
  </div>
 `).join('');

  const total = carrito.reduce((sum, x) => sum + (x.precio * x.qty), 0);
  document.getElementById('subtotal').textContent = fmt(total);
  document.getElementById('total-cart').textContent = fmt(total);
}

function selPago(btn, metodo) {
  metodoPago = metodo;
  document.querySelectorAll('.pay-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function poblarSelectClientes() {
  const sel = document.getElementById('cart-cliente');
  sel.innerHTML = '<option value="">Sin cliente</option>';
  state.clientes.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id || c.ID || c.nombre;
    opt.textContent = c.nombre;
    sel.appendChild(opt);
  });
}

// ─── COBRAR VENTA ────────────────────────────────────────

async function cobrar() {
  if (!carrito.length) { toast('El carrito está vacío', 'error'); return; }

  const total = carrito.reduce((sum, x) => sum + (x.precio * x.qty), 0);
  const ventaId = 'VT-' + uid();

  const venta = {
    id: ventaId, // Cambio: necesario para la llave del Apps Script
    'N venta': ventaId,
    fecha: new Date().toLocaleString('es-CO'),
    items: JSON.stringify(carrito.map(x => ({ n: x.nombre, q: x.qty, p: x.precio }))),
    total,
    metodo: metodoPago,
    clienteId: document.getElementById('cart-cliente').value || ''
  };

  try {
    // Apuntamos a 'historial' que es donde se guardan las ventas
    const result = await apiPost('historial', venta);
    // Cambio: Google responde con ok o success
    if (result.ok || result.success) {
      toast('¡Venta registrada correctamente!');
      limpiarCarrito();
      if (ventaAbierta) descartarVentaAbierta();
    } else {
      // Cambio: Google manda el error en .error o .message
      toast('Error al registrar: ' + (result.error || result.message || ''), 'error');
    }
  } catch (e) {
    toast('Error de conexión con el servidor', 'error');
  }
}

// ─── EDITAR PRODUCTO DESDE VENTA ─────────────────────────

function abrirEditProdVenta(codigo) {
  const p = state.productos.find(x => (x.codigo || x.nombre) === codigo);
  if (!p) return;

  document.getElementById('epv-codigo').value = codigo;
  document.getElementById('epv-nombre').value = p.nombre;
  document.getElementById('epv-precio').value = p.precio;
  document.getElementById('epv-stock').value = p.stock;

  abrirModal('modal-edit-prod-venta');
}

async function guardarEditProdVenta() {
  const codigo = document.getElementById('epv-codigo').value;
  const nombre = document.getElementById('epv-nombre').value;
  const precio = Number(document.getElementById('epv-precio').value);
  const stock = Number(document.getElementById('epv-stock').value);

  const idx = state.productos.findIndex(x => (x.codigo || x.nombre) === codigo);
  if (idx >= 0) {
    state.productos[idx].nombre = nombre;
    state.productos[idx].precio = precio;
    state.productos[idx].stock = stock;
  }

  const ci = carrito.findIndex(x => x.codigo === codigo);
  if (ci >= 0) {
    carrito[ci].nombre = nombre;
    carrito[ci].precio = precio;
    carrito[ci].stock = stock;
  }

  filtrarProductos();
  renderCarrito();
  cerrarModal('modal-edit-prod-venta');
  toast('Producto actualizado en la interfaz');
}