/* ═══════════════════════════════════════
   js/clientes.js — Módulo de Clientes
   ═══════════════════════════════════════ */

async function loadClientes() {
  document.getElementById('cli-loading').style.display = 'flex';
  document.getElementById('cli-table').style.display = 'none';

  try {
    const data = await apiGet('clientes');
    state.clientes = data || [];
    renderClientes(state.clientes);
  } catch (error) {
    console.error('Error cargando clientes:', error);
    state.clientes = [];
    renderClientes([]);
  }
}

function renderClientes(data) {
  document.getElementById('cli-loading').style.display = 'none';
  document.getElementById('cli-table').style.display = 'table';

  const body = document.getElementById('cli-body');

  if (!data || !data.length) {
    body.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;color:var(--text3);padding:32px">
          Sin clientes registrados
        </td>
      </tr>`;
    return;
  }

  body.innerHTML = data.map(c => `
    <tr>
      <td>${c.ID || c.id || '—'}</td>
      <td>${c.nombre || '—'}</td>
      <td>${c.telefono || '—'}</td>
      <td>${c.email || '—'}</td>
      <td>
        <button class="btn-icon"
          onclick='abrirEditCliente(${JSON.stringify(c).replace(/'/g, "&#39;")})'>
          ${iconoEditar()}
        </button>
      </td>
    </tr>
  `).join('');
}

function abrirModalCliente() {
  document.getElementById('modal-cli-title').textContent = 'Nuevo cliente';

  document.getElementById('cli-id').value = 'CLI-' + uid();
  document.getElementById('cli-nombre').value = '';
  document.getElementById('cli-telefono').value = '';
  document.getElementById('cli-email').value = '';

  abrirModal('modal-cliente');
}

function abrirEditCliente(cliente) {
  document.getElementById('modal-cli-title').textContent = 'Editar cliente';

  document.getElementById('cli-id').value = cliente.ID || cliente.id || '';
  document.getElementById('cli-nombre').value = cliente.nombre || '';
  document.getElementById('cli-telefono').value = cliente.telefono || '';
  document.getElementById('cli-email').value = cliente.email || '';

  abrirModal('modal-cliente');
}

async function guardarCliente() {
  const nombre = document.getElementById('cli-nombre').value.trim();

  if (!nombre) {
    alert('El nombre del cliente es obligatorio');
    return;
  }

  const cliente = {
    id: document.getElementById('cli-id').value,
    nombre,
    telefono: document.getElementById('cli-telefono').value.trim(),
    email: document.getElementById('cli-email').value.trim()
  };

  try {
    const result = await apiPost('clientes', cliente);

    if (result && (result.ok || result.success || result.id)) {
      cerrarModal('modal-cliente');
      await loadClientes();
    } else {
      alert('No se pudo guardar el cliente');
    }
  } catch (error) {
    console.error('Error guardando cliente:', error);
    alert('Error de conexión al guardar');
  }
}