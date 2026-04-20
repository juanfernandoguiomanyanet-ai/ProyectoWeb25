/* ═══════════════════════════════════════
   js/proveedores.js — Módulo de Gestión de Proveedores
   ═══════════════════════════════════════ */

// ─── CARGA Y RENDER ──────────────────────────────────────

/** Carga los proveedores desde la API y renderiza la tabla */
async function loadProveedores() {
  document.getElementById('prov-loading').style.display = 'flex';
  document.getElementById('prov-table').style.display   = 'none';

  const data = await apiGet('proveedores');
  state.proveedores = data;

  renderProveedores(data);
}

/**
 * Renderiza la tabla de proveedores
 * @param {Array} data
 */
function renderProveedores(data) {
  document.getElementById('prov-loading').style.display = 'none';
  document.getElementById('prov-table').style.display   = 'table';

  const body = document.getElementById('prov-body');

  if (!data.length) {
    body.innerHTML = `<tr>
      <td colspan="5" style="text-align:center;color:var(--text3);padding:32px">
        Sin proveedores registrados
      </td>
    </tr>`;
    return;
  }

  body.innerHTML = data.map(p => `
    <tr>
      <td>
        <code style="font-size:12px;background:var(--surface2);padding:2px 7px;border-radius:4px">
          ${p.ID || p.id || '—'}
        </code>
      </td>
      <td style="font-weight:500">${p.nombre || '—'}</td>
      <td>${p.telefono || '—'}</td>
      <td style="color:var(--info)">${p.email || '—'}</td>
      <td>
        <button class="btn-icon" title="Editar proveedor"
                onclick='abrirEditProveedor(${JSON.stringify(p).replace(/'/g, "&#39;")})'>
          ${iconoEditar()}
        </button>
      </td>
    </tr>
  `).join('');
}

// ─── MODAL PROVEEDOR ─────────────────────────────────────

/** Abre el modal en modo creación */
function abrirModalProveedor() {
  document.getElementById('modal-prov-title').textContent = 'Nuevo proveedor';
  document.getElementById('prov-edit-id').value  = '';
  document.getElementById('prov-id').value       = 'PR-' + uid();
  document.getElementById('prov-nombre').value   = '';
  document.getElementById('prov-tel').value      = '';
  document.getElementById('prov-email').value    = '';
  abrirModal('modal-proveedor');
}

/**
 * Abre el modal en modo edición con los datos del proveedor
 * @param {Object} proveedor
 */
function abrirEditProveedor(proveedor) {
  document.getElementById('modal-prov-title').textContent = 'Editar proveedor';
  document.getElementById('prov-edit-id').value = proveedor.ID || proveedor.id || '';
  document.getElementById('prov-id').value      = proveedor.ID || proveedor.id || '';
  document.getElementById('prov-nombre').value  = proveedor.nombre   || '';
  document.getElementById('prov-tel').value     = proveedor.telefono || '';
  document.getElementById('prov-email').value   = proveedor.email    || '';
  abrirModal('modal-proveedor');
}

// ─── GUARDAR PROVEEDOR ───────────────────────────────────

/** Valida y envía el proveedor al Google Sheets */
async function guardarProveedor() {
  const nombre = document.getElementById('prov-nombre').value.trim();
  if (!nombre) { toast('El nombre del proveedor es obligatorio', 'error'); return; }

  const proveedor = {
    ID:       document.getElementById('prov-id').value,
    nombre,
    telefono: document.getElementById('prov-tel').value.trim(),
    email:    document.getElementById('prov-email').value.trim()
  };

  try {
    const result = await apiPost('proveedores', proveedor);
    if (result.success) {
      toast('Proveedor guardado correctamente');
      cerrarModal('modal-proveedor');
      loadProveedores();
    } else {
      toast('Error: ' + (result.message || ''), 'error');
    }
  } catch (e) {
    toast('Error de conexión con el servidor', 'error');
  }
}
