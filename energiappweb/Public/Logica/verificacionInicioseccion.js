// Verificar sesión activa
const usuarioId = localStorage.getItem('usuarioId');
const usuarioNombre = localStorage.getItem('usuarioNombre');

if (!usuarioId && !window.location.pathname.includes('login')) {
  window.location.href = 'usuario-login.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const avatarElem = document.querySelector('.sidebar-brand small');
  if (avatarElem && usuarioNombre) {
    avatarElem.textContent = usuarioNombre;
  }
});