/* ═══════════════════════════════════════
   js/categorias.js — Módulo de Gestión de Categorías
   ═══════════════════════════════════════ */

// ─── CARGA Y RENDER ──────────────────────────────────────

/** Carga las categorías desde la API y renderiza la tabla */
async function loadCategorias() {
  document.getElementById('cat-loading').style.display = 'flex';
  document.getElementById('cat-table').style.display = 'none';

  // Cambio: apiGet ahora devuelve el array directamente
  const data = await apiGet('categorias');
  state.categorias = data;

  renderCategorias(data);
}

/**
 * Renderiza la tabla de categorías
 * @param {Array} data
 */
function renderCategorias(data) {
  document.getElementById('cat-loading').style.display = 'none';
  document.getElementById('cat-table').style.display = 'table';

  const body = document.getElementById('cat-body');

  if (!data.length) {
    body.innerHTML = `<tr>
      <td colspan="4" style="text-align:center;color:var(--text3);padding:32px">
        Sin categorías registradas
      </td>
    </tr>`;
    return;
  }

  body.innerHTML = data.map(c => `
    <tr>
      <td>
        <code style="font-size:12px;background:var(--surface2);padding:2px 7px;border-radius:4px">
          ${c.ID || c.id || '—'}
        </code>
      </td>
      <td style="font-weight:500">${c.nombre || '—'}</td>
      <td style="color:var(--text2);font-size:13px">${c.descripcion || c.Descripcion || '—'}</td>
      <td>
        <button class="btn-icon" title="Editar categoría"
                onclick='abrirEditCategoria(${JSON.stringify(c).replace(/'/g, "&#39;")})'>
          ${iconoEditar()}
        </button>
      </td>
    </tr>
  `).join('');
}

// ─── MODAL CATEGORÍA ─────────────────────────────────────

/** Abre el modal en modo creación */
function abrirModalCategoria() {
  document.getElementById('modal-cat-title').textContent = 'Nueva categoría';
  document.getElementById('cat-edit-id').value = '';
  document.getElementById('cat-id').value = 'CAT-' + uid();
  document.getElementById('cat-nombre').value = '';
  document.getElementById('cat-desc').value = '';
  abrirModal('modal-categoria');
}

/**
 * Abre el modal en modo edición con los datos de la categoría
 * @param {Object} categoria
 */
function abrirEditCategoria(categoria) {
  document.getElementById('modal-cat-title').textContent = 'Editar categoría';
  document.getElementById('cat-edit-id').value = categoria.ID || categoria.id || '';
  document.getElementById('cat-id').value = categoria.ID || categoria.id || '';
  document.getElementById('cat-nombre').value = categoria.nombre || '';
  document.getElementById('cat-desc').value = categoria.descripcion || categoria.Descripcion || '';
  abrirModal('modal-categoria');
}

// ─── GUARDAR CATEGORÍA ───────────────────────────────────

/** Valida y envía la categoría al Google Sheets */
async function guardarCategoria() {
  const nombre = document.getElementById('cat-nombre').value.trim();
  if (!nombre) { toast('El nombre de la categoría es obligatorio', 'error'); return; }

  const catId = document.getElementById('cat-id').value;

  const categoria = {
    id: catId, // Cambio: necesario para que Google lo reconozca como ID
    ID: catId,
    nombre,
    descripcion: document.getElementById('cat-desc').value.trim()
  };

  try {
    const result = await apiPost('categorias', categoria);
    // Cambio: Google responde con .ok o .success
    if (result.ok || result.success) {
      toast('Categoría guardada correctamente');
      cerrarModal('modal-categoria');
      loadCategorias();
    } else {
      // Cambio: Google manda el error en .error o .message
      toast('Error: ' + (result.error || result.message || ''), 'error');
    }
  } catch (e) {
    toast('Error de conexión con el servidor', 'error');
  }
}