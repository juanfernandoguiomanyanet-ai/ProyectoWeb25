/* ═══════════════════════════════════════
   js/utils.js — Funciones utilitarias compartidas
   ═══════════════════════════════════════ */

/**
 * Formatea un número como moneda colombiana
 * @param {number} n
 * @returns {string}
 */
function fmt(n) {
  return '$' + Number(n || 0).toLocaleString('es-CO');
}

/**
 * Genera un ID único corto basado en timestamp
 * @returns {string}
 */
function uid() {
  return Date.now().toString(36).toUpperCase();
}

/**
 * Retorna la fecha de hoy en formato YYYY-MM-DD
 * @returns {string}
 */
function today() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Muestra un mensaje toast temporal en pantalla
 * @param {string} msg - mensaje a mostrar
 * @param {'success'|'error'|'warning'} type
 */
function toast(msg, type = 'success') {
  const container = document.getElementById('toast');
  const el = document.createElement('div');
  el.className = `toast-item ${type}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

/**
 * Abre un modal por su ID
 * @param {string} id
 */
function abrirModal(id) {
  document.getElementById(id).classList.add('open');
}

/**
 * Cierra un modal por su ID
 * @param {string} id
 */
function cerrarModal(id) {
  document.getElementById(id).classList.remove('open');
}

/**
 * Renderiza un SVG de ícono de búsqueda (reutilizable)
 * @returns {string}
 */
function iconoBuscar() {
  return `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"/>
    <path d="M21 21l-4.35-4.35"/>
  </svg>`;
}

/**
 * Renderiza un SVG de ícono de editar (reutilizable)
 * @returns {string}
 */
function iconoEditar() {
  return `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>`;
}

/**
 * Renderiza un SVG de ícono de eliminar/basura
 * @returns {string}
 */
function iconoEliminar() {
  return `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
  </svg>`;
}
