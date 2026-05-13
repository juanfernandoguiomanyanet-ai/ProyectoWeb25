/* ═══════════════════════════════════════
   js/proveedores.js — Módulo de Proveedores
   ═══════════════════════════════════════ */

async function loadProveedores() {
  document.getElementById('prov-loading').style.display = 'flex';
  document.getElementById('prov-table').style.display = 'none';

  const data = await apiGet('proveedores');
  state.proveedores = data;

  renderProveedores(data);
}

function renderProveedores(data) {
  document.getElementById('prov-loading').style.display = 'none';
  document.getElementById('prov-table').style.display = 'table';

  const body = document.getElementById('prov-body');

  if (!data.length) {
    body.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center;color:var(--text3);padding:32px">
          Sin proveedores registrados
        </td>
      </tr>`;
    return;
  }

  body.innerHTML = data.map(p => `
    <tr>
      <td>${p.ID || p.id || '—'}</td>
      <td>${p.nombre || '—'}</td>
      <td>${p.telefono || '—'}</td>
      <td>
        <button class="btn-icon"
          onclick='abrirEditProveedor(${JSON.stringify(p).replace(/'/g, "&#39;")})'>
          ${iconoEditar()}
        </button>
      </td>
    </tr>
  `).join('');
}

function abrirModalProveedor() {
  document.getElementById('modal-prov-title').textContent = 'Nuevo proveedor';
  document.getElementById('prov-id').value = 'PROV-' + uid();
  document.getElementById('prov-nombre').value = '';
  document.getElementById('prov-telefono').value = '';
  abrirModal('modal-proveedor');
}

function abrirEditProveedor(prov) {
  document.getElementById('modal-prov-title').textContent = 'Editar proveedor';
  document.getElementById('prov-id').value = prov.ID || prov.id || '';
  document.getElementById('prov-nombre').value = prov.nombre || '';
  document.getElementById('prov-telefono').value = prov.telefono || '';
  abrirModal('modal-proveedor');
}

async function guardarProveedor() {
  const nombre = document.getElementById('prov-nombre').value.trim();
  if (!nombre) {
    toast('El nombre es obligatorio', 'error');
    return;
  }

  const proveedor = {
    id: document.getElementById('prov-id').value,
    nombre,
    telefono: document.getElementById('prov-telefono').value.trim()
  };

  try {
    const result = await apiPost('proveedores', proveedor);

    if (result.ok || result.success) {
      toast('Proveedor guardado');
      cerrarModal('modal-proveedor');
      loadProveedores();
    } else {
      toast('Error al guardar', 'error');
    }
  } catch {
    toast('Error de conexión', 'error');
  }
}