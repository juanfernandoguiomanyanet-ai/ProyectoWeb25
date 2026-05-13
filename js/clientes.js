/* ═══════════════════════════════════════
   js/clientes.js — Módulo de Gestión de Clientes
   ═══════════════════════════════════════ */

async function loadClientes() {
  document.getElementById('clie-loading').style.display = 'flex';
  document.getElementById('clie-table').style.display   = 'none';

  const data = await apiGet('clientes');
  state.clientes = data; // Lo guardamos en el estado global

  renderClientes(data);
}

function renderClientes(data) {
  document.getElementById('clie-loading').style.display = 'none';
  document.getElementById('clie-table').style.display   = 'table';

  const body = document.getElementById('clie-body');

  if (!data.length) {
    body.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:32px">Sin clientes registrados</td></tr>`;
    return;
  }

  body.innerHTML = data.map(c => `
    <tr>
      <td><code style="font-size:12px;background:var(--surface2);padding:2px 7px;border-radius:4px">${c.id || c.ID || '—'}</code></td>
      <td style="font-weight:500">${c.nombre || '—'}</td>
      <td>${c.telefono || '—'}</td>
      <td style="color:var(--info)">${c.email || '—'}</td>
      <td>
        <button class="btn-icon" title="Editar cliente"
                onclick='abrirEditCliente(${JSON.stringify(c).replace(/'/g, "&#39;")})'>
          ${iconoEditar()}
        </button>
      </td>
    </tr>
  `).join('');
}

function abrirModalCliente() {
  // 1. Cambiamos el título del modal
  const titulo = document.getElementById('modal-clie-title');
  if (titulo) titulo.textContent = 'Nuevo Cliente';

  // 2. Limpiamos los campos para que no aparezca info vieja
  document.getElementById('clie-edit-id').value = '';
  document.getElementById('clie-id').value = 'CL-' + uid(); // Genera ID nuevo
  document.getElementById('clie-nombre').value = '';
  document.getElementById('clie-tel').value = '';
  document.getElementById('clie-email').value = '';

  // 3. MOSTRAMOS EL MODAL
  // Usamos 'flex' para que las reglas de centrado del CSS funcionen
  const modal = document.getElementById('modal-cliente');
  if (modal) {
    modal.style.display = 'flex';
  } else {
    console.error("No se encontró el elemento con ID 'modal-cliente'");
  }
}

function abrirEditCliente(cliente) {
  document.getElementById('modal-clie-title').textContent = 'Editar cliente';
  const idValue = cliente.id || cliente.ID || '';
  document.getElementById('clie-edit-id').value = idValue;
  document.getElementById('clie-id').value      = idValue;
  document.getElementById('clie-nombre').value  = cliente.nombre   || '';
  document.getElementById('clie-tel').value     = cliente.telefono || '';
  document.getElementById('clie-email').value    = cliente.email    || '';
  abrirModal('modal-cliente');
}

async function guardarCliente() {
  const nombre = document.getElementById('clie-nombre').value.trim();
  if (!nombre) { toast('El nombre es obligatorio', 'error'); return; }

  const cliente = {
    id: document.getElementById('clie-id').value, 
    nombre: nombre,
    telefono: document.getElementById('clie-tel').value.trim(),
    email: document.getElementById('clie-email').value.trim()
  };

  try {
    const result = await apiPost('clientes', cliente);
    if (result.ok || result.success) {
      toast('Cliente guardado correctamente');
      cerrarModal('modal-cliente');
      loadClientes();
    }
  } catch (e) {
    toast('Error al conectar con el servidor', 'error');
  }
}