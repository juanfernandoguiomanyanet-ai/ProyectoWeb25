import { state } from './core/state.js';
import { initVentas } from './modules/ventas.js';
import { loadHistorial } from './modules/historial.js';
import { loadCompras } from './modules/compras.js';
import { loadProductos } from './modules/productos.js';
import { loadCategorias } from './modules/categorias.js';
import { loadProveedores } from './modules/proveedores.js';
import { loadClientes } from './modules/clientes.js'; // ← AGREGADO

function showView(nombre) {
  
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(el => el.classList.remove('active'));

  const targetView = document.getElementById('view-' + nombre);
  const targetNav = document.getElementById('nav-' + nombre);

  if (targetView) targetView.classList.add('active');
  if (targetNav) targetNav.classList.add('active');

  const loaders = {
    ventas: () => initVentas(),
    historial: () => loadHistorial(),
    compras: () => loadCompras(),
    productos: () => loadProductos(),
    categorias: () => loadCategorias(),
    proveedores: () => loadProveedores(),
    clientes: () => loadClientes() // ← AGREGADO
  };

  if (loaders[nombre]) loaders[nombre]();
}

document.addEventListener('DOMContentLoaded', () => {
  showView('ventas');
});

window.showView = showView;