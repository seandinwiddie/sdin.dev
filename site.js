// sdin.dev shared behavior — AOS init and accessible mobile navigation.
document.addEventListener('DOMContentLoaded', function () {
  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 800, easing: 'ease-in-out', once: true, offset: 100 });
  }

  const button = document.getElementById('mobile-menu-button');
  const menu = document.getElementById('mobile-menu');
  if (button && menu) {
    const setMenuOpen = function (isOpen) {
      menu.classList.toggle('hidden', !isOpen);
      button.setAttribute('aria-expanded', String(isOpen));
    };

    button.addEventListener('click', function () {
      setMenuOpen(button.getAttribute('aria-expanded') !== 'true');
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
        setMenuOpen(false);
        button.focus();
      }
    });

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setMenuOpen(false);
      });
    });
  }
});
