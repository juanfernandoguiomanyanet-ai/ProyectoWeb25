/* ═══════════════════════════════════════
   js/app.js — Estado global y navegación
   ═══════════════════════════════════════ */

// ─── ESTADO GLOBAL ───────────────────────────────────────
// Cada módulo lee y escribe sobre estas variables compartidas.
const state = {
  productos:    [],
  categorias:   [],
  proveedores:  [],
  clientes:     [],
  historial:    [],
  compras:      [],
};

// ─── NAVEGACIÓN ──────────────────────────────────────────

/**
 * Muestra una vista y oculta el resto.
 * Llama al loader correspondiente si la vista lo necesita.
 * @param {string} nombre - clave de la vista (ej: 'ventas')
 */
function showView(nombre) {
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(el => el.classList.remove('active'));

  const targetView = document.getElementById('view-' + nombre);
  const targetNav  = document.getElementById('nav-'  + nombre);

  if (targetView) targetView.classList.add('active');
  if (targetNav)  targetNav.classList.add('active');

  // Llamar al cargador de cada sección al entrar
  const loaders = {
    ventas:      () => initVentas(),
    historial:   () => loadHistorial(),
    compras:     () => loadCompras(),
    productos:   () => loadProductos(),
    categorias:  () => loadCategorias(),
    proveedores: () => loadProveedores(),
  };

  if (loaders[nombre]) loaders[nombre]();
}

// ─── INICIO ──────────────────────────────────────────────
// Se ejecuta al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  // Verificamos que estemos en la vista de ventas por defecto
  showView('ventas');
});