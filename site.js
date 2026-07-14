// sdin.dev shared behavior — AOS init, mobile menu, smooth scroll. Linked by every page.
document.addEventListener('DOMContentLoaded', function () {
  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 800, easing: 'ease-in-out', once: true, offset: 100 });
  }

  const button = document.getElementById('mobile-menu-button');
  const menu = document.getElementById('mobile-menu');
  if (button && menu) {
    button.addEventListener('click', function () { menu.classList.toggle('hidden'); });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const id = link.getAttribute('href');
      if (id.length <= 1) return; // ignore bare "#"
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});
