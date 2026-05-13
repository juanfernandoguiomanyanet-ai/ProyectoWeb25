/* ═══════════════════════════════════════
   js/categorias.js — Módulo de Gestión de Categorías
   ═══════════════════════════════════════ */

// ─── CARGA Y RENDER ──────────────────────────────────────

/** Carga las categorías desde la API y renderiza la tabla */
async function loadCategorias() {
  document.getElementById('cat-loading').style.display = 'flex';
  document.getElementById('cat-table').style.display = 'none';

  try {
    const data = await apiGet('categorias') || [];
    state.categorias = data;
    renderCategorias(data);
  } catch (e) {
    console.error(e);
    alert('Error cargando categorías');
    document.getElementById('cat-loading').style.display = 'none';
  }
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
    body.innerHTML = `
      <tr>
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
      <td style="color:var(--text2);font-size:13px">
        ${c.descripcion || c.Descripcion || '—'}
      </td>
      <td>
        <button class="btn-icon"
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
  if (!nombre) { alert('El nombre de la categoría es obligatorio'); return; }

  const catId = document.getElementById('cat-id').value;

  const categoria = {
    id: catId,
    ID: catId,
    nombre,
    descripcion: document.getElementById('cat-desc').value.trim()
  };

  try {
    const result = await apiPost('categorias', categoria);

    if (result?.ok || result?.success) {
      cerrarModal('modal-categoria');
      loadCategorias();
    } else {
      alert('Error: ' + (result?.error || result?.message || ''));
    }
  } catch (e) {
    console.error(e);
    alert('Error de conexión con el servidor');
  }
}