// Verificar sesión activa
const usuarioId = localStorage.getItem('usuarioId');
const usuarioNombre = localStorage.getItem('usuarioNombre');

if (!usuarioId && !window.location.pathname.includes('login')) {
  window.location.href = '/usuario-login';
}

document.addEventListener('DOMContentLoaded', () => {
  const avatarElem = document.querySelector('.sidebar-brand small');
  if (avatarElem && usuarioNombre) {
    avatarElem.textContent = usuarioNombre;
  }

  const homeTrigger = document.querySelector('.nav-home-trigger');
  const navSubmenu = document.querySelector('.nav-submenu');

  if (homeTrigger && navSubmenu) {
    homeTrigger.addEventListener('click', (event) => {
      event.preventDefault();
      const isOpen = navSubmenu.classList.toggle('open');
      homeTrigger.setAttribute('aria-expanded', String(isOpen));
    });

    homeTrigger.addEventListener('mouseenter', () => {
      navSubmenu.classList.add('open');
      homeTrigger.setAttribute('aria-expanded', 'true');
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.nav-home-wrap')) {
        navSubmenu.classList.remove('open');
        homeTrigger.setAttribute('aria-expanded', 'false');
      }
    });
  }
});