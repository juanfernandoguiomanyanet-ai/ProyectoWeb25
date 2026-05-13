export function abrirModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add("active");
  document.body.classList.add("modal-open");
}

export function cerrarModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove("active");
  document.body.classList.remove("modal-open");
}

function handleOutsideClick(e) {
  if (e.target.classList.contains("modal")) {
    e.target.classList.remove("active");
    document.body.classList.remove("modal-open");
  }
}