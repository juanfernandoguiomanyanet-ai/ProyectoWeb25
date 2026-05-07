/* ═══════════════════════════════════════
   js/proveedores.js — Módulo de Gestión de Proveedores
   ═══════════════════════════════════════ */

// ─── CARGA Y RENDER ──────────────────────────────────────

async function loadProveedores() {
  document.getElementById('prov-loading').style.display = 'flex';
  document.getElementById('prov-table').style.display   = 'none';

  // Ajuste: apiGet ahora devuelve el array directamente o []
  const data = await apiGet('proveedores');
  state.proveedores = data;

  renderProveedores(data);
}

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
          ${p.id || p.ID || '—'}
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

function abrirModalProveedor() {
  document.getElementById('modal-prov-title').textContent = 'Nuevo proveedor';
  document.getElementById('prov-edit-id').value  = '';
  document.getElementById('prov-id').value       = 'PR-' + uid(); // Mantenemos tu generador de ID
  document.getElementById('prov-nombre').value   = '';
  document.getElementById('prov-tel').value      = '';
  document.getElementById('prov-email').value    = '';
  abrirModal('modal-proveedor');
}

function abrirEditProveedor(proveedor) {
  document.getElementById('modal-prov-title').textContent = 'Editar proveedor';
  // Ajuste: Intentar leer id o ID indistintamente
  const idValue = proveedor.id || proveedor.ID || '';
  document.getElementById('prov-edit-id').value = idValue;
  document.getElementById('prov-id').value      = idValue;
  document.getElementById('prov-nombre').value  = proveedor.nombre   || '';
  document.getElementById('prov-tel').value     = proveedor.telefono || '';
  document.getElementById('prov-email').value    = proveedor.email    || '';
  abrirModal('modal-proveedor');
}

// ─── GUARDAR PROVEEDOR ───────────────────────────────────

async function guardarProveedor() {
  const nombre = document.getElementById('prov-nombre').value.trim();
  if (!nombre) { toast('El nombre del proveedor es obligatorio', 'error'); return; }

  // Ajuste: Mandar 'id' en minúsculas para que el Apps Script lo reconozca como llave
  const currentId = document.getElementById('prov-id').value;

  const proveedor = {
    id: currentId, 
    nombre: nombre,
    telefono: document.getElementById('prov-tel').value.trim(),
    email: document.getElementById('prov-email').value.trim()
  };

  try {
    const result = await apiPost('proveedores', proveedor);
    
    // Ajuste: Validar 'result.ok' que es lo que devuelve tu Apps Script
    if (result.ok || result.success) {
      toast('Proveedor guardado correctamente');
      cerrarModal('modal-proveedor');
      loadProveedores();
    } else {
      toast('Error: ' + (result.error || result.message || 'Error desconocido'), 'error');
    }
  } catch (e) {
    console.error("Error en guardarProveedor:", e);
    toast('Error de conexión con el servidor', 'error');
  }
}