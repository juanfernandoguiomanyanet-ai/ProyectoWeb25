/* ═══════════════════════════════════════
   js/api.js — Configuración y helpers de API
   ═══════════════════════════════════════ */

const API_URL = 'https://script.google.com/macros/s/AKfycbyfdj5fBNX8mhpx-ZFYbZ0-EGdGm6oaSVX6BsBmX-tnfdZgiPtbLEbZND09Q03l9C3q/exec';

/**
 * GET — obtiene todos los registros de una hoja
 * @param {string} resource - nombre de la hoja
 * @returns {Promise<Array>}
 */
async function apiGet(resource) {
  const response = await fetch(`${API_URL}?resource=${resource}`);
  const data = await response.json();
  return data.success ? data.data : [];
}

/**
 * POST — guarda un registro en una hoja
 * @param {string} resource - nombre de la hoja
 * @param {Object} data - objeto a guardar
 * @returns {Promise<Object>}
 */
async function apiPost(resource, data) {
  const response = await fetch(`${API_URL}?resource=${resource}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await response.json();
}
