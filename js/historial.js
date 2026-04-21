/* ═══════════════════════════════════════
   js/historial.js — Módulo de Historial de Ventas
   ═══════════════════════════════════════ */

// ─── CARGA Y RENDER ──────────────────────────────────────

/** Carga el historial desde la API y lo renderiza */
async function loadHistorial() {
  document.getElementById('hist-loading').style.display = 'flex';
  document.getElementById('hist-table').style.display   = 'none';

  // Cambio: apiGet ahora devuelve el array directamente o []
  const data = await apiGet('historial');
  state.historial = data;

  renderHistorial(data);
}

/**
 * Renderiza la tabla del historial y las estadísticas
 * @param {Array} data
 */
function renderHistorial(data) {
  document.getElementById('hist-loading').style.display = 'none';
  document.getElementById('hist-table').style.display   = 'table';

  const body = document.getElementById('hist-body');

  if (!data.length) {
    body.innerHTML = `<tr>
      <td colspan="6" style="text-align:center;color:var(--text3);padding:32px">
        Sin ventas registradas
      </td>
    </tr>`;
    return;
  }

  body.innerHTML = data.map(venta => {
    const items = parsearItems(venta.items || venta.itemsJson);
    const resumen = items.length
      ? items.map(x => `${x.n || x.nombre} ×${x.q || x.qty}`).join(', ')
      : '—';

    const badgeMetodo = {
      'Efectivo':      'badge-green',
      'Tarjeta':       'badge-info',
      'Transferencia': 'badge-amber',
    }[venta.metodo] || 'badge-amber';

    return `<tr>
            <td><span class="badge badge-info">${venta.id || venta['N venta'] || '—'}</span></td>
      <td>${venta.fecha || '—'}</td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px">
        ${resumen}
      </td>
      <td style="font-weight:600">${fmt(venta.total)}</td>
      <td><span class="badge ${badgeMetodo}">${venta.metodo || '—'}</span></td>
      <td>
        <button class="btn-icon" title="Ver detalle"
                onclick='verDetalleVenta(${JSON.stringify(venta).replace(/'/g, "&#39;")})'>
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
      </td>
    </tr>`;
  }).join('');

  renderEstadisticas(data);
}

// ─── ESTADÍSTICAS ────────────────────────────────────────

/**
 * Calcula y muestra las tarjetas de estadísticas
 * @param {Array} data
 */
function renderEstadisticas(data) {
  const total    = data.length;
  const ingresos = data.reduce((sum, v) => sum + Number(v.total || 0), 0);
  const ticket   = total ? ingresos / total : 0;

  // Contar frecuencia de cada método de pago
  const metodos = data.reduce((acc, v) => {
    acc[v.metodo] = (acc[v.metodo] || 0) + 1;
    return acc;
  }, {});
  const topMetodo = Object.entries(metodos).sort((a, b) => b[1] - a[1])[0];

  document.getElementById('st-ventas').textContent  = total;
  document.getElementById('st-ingresos').textContent = fmt(ingresos);
  document.getElementById('st-ticket').textContent  = fmt(Math.round(ticket));
  document.getElementById('st-metodo').textContent  = topMetodo ? topMetodo[0] : '—';
}

// ─── DETALLE ─────────────────────────────────────────────

/**
 * Abre el modal con el detalle completo de una venta
 * @param {Object} venta
 */
function verDetalleVenta(venta) {
  const items = parsearItems(venta.items || venta.itemsJson);

  const itemsHtml = items.length
    ? `<ul style="list-style:none;padding:0">
        ${items.map(x => `
          <li style="display:flex;justify-content:space-between;padding:6px 0;
                     border-bottom:1px solid var(--border);font-size:13.5px">
            <span>${x.n || x.nombre} × ${x.q || x.qty}</span>
            <span style="font-weight:600">${fmt((x.p || x.precio) * (x.q || x.qty))}</span>
          </li>`).join('')}
       </ul>`
    : '<p style="color:var(--text3);font-size:13px">Sin detalle de items</p>';

  // Cambio: Soporte para 'id' en el título del modal
  document.getElementById('detalle-title').textContent = 'Venta ' + (venta.id || venta['N venta'] || '');
  document.getElementById('detalle-body').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
      <div>
        <p style="font-size:12px;color:var(--text2)">Fecha</p>
        <p style="font-weight:500">${venta.fecha || '—'}</p>
      </div>
      <div>
        <p style="font-size:12px;color:var(--text2)">Método de pago</p>
        <p style="font-weight:500">${venta.metodo || '—'}</p>
      </div>
    </div>
    <p style="font-size:12.5px;font-weight:500;color:var(--text2);text-transform:uppercase;
              letter-spacing:0.04em;margin-bottom:8px">Productos</p>
    ${itemsHtml}
    <div style="text-align:right;margin-top:14px;font-size:18px;
                font-family:'DM Serif Display',serif">
      Total: ${fmt(venta.total)}
    </div>`;

  abrirModal('modal-detalle');
}

// ─── HELPERS ─────────────────────────────────────────────

/**
 * Parsea el campo items/itemsJson de una venta de forma segura
 * @param {string} json
 * @returns {Array}
 */
function parsearItems(json) {
  try {
    // Si ya es un objeto/array, lo devolvemos; si es string, lo parseamos
    const parsed = typeof json === 'string' ? JSON.parse(json || '[]') : json;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}