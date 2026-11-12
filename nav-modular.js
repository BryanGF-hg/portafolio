/* nav-modular.js — Barra de enlaces y tema oscuro/claro */
(() => {
  if (customElements.get('site-nav')) return;

  // ID de Google Drive extraído de tu enlace
  const DRIVE_ID = '1sDiyTO3K8WhCrhiZ3d7QIPm8FFA3a3oF';
  const DIRECT_CV_URL = `https://drive.google.com/uc?export=download&id=${DRIVE_ID}`;

  const LINKS = [
    { label: 'Web', href: '../web/index.html' },
    { label: 'Portafolio', href: '../portafolio/index.html' },
    { label: 'Currículum', href: '../curriculum/index.html' },
    { label: 'GitHub', href: 'https://github.com/BryanGF-hg' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/bryan-glot-fong-04082a39a/' },
    { label: 'Descargar CV', href: DIRECT_CV_URL, id: 'enlace_de_descarga', primary: true },
  ];

  // Fuente Victor Mono y estilos base del navbar
  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Victor+Mono:ital,wght@0,100..700;1,100..700&display=swap');
    
    site-nav {
      display: block; position: sticky; top: 0; z-index: 50;
      background: var(--sn-bg, #F6F4EF);
      font-family: 'Victor Mono', monospace !important;
      box-shadow: 0 2px 10px rgba(42,46,43,.12);
      transition: background-color .2s ease;
    }
    site-nav ul {
      list-style: none; margin: 0; padding: 10px 16px;
      display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 8px;
    }
    site-nav li { margin: 0; padding: 0; display: flex; align-items: center; }
    site-nav a, .theme-toggle {
      display: inline-flex; align-items: center; justify-content: center;
      min-height: 44px; padding: 0 20px; border-radius: 999px;
      background: var(--sn-btn-bg, #2A2E2B); color: var(--sn-btn-fg, #F6F4EF);
      text-decoration: none; font-weight: 700; font-size: 14px;
      border: 2px solid transparent; transition: background .15s, transform .15s, box-shadow .15s;
      cursor: pointer;
    }
    site-nav a:hover, .theme-toggle:hover {
      background: var(--sn-accent, #FF8A3D); color: var(--sn-accent-fg, #2A2E2B);
      transform: translateY(-1px);
    }
    site-nav a.is-primary {
      background: var(--sn-accent, #FF8A3D); color: var(--sn-accent-fg, #2A2E2B);
      border-color: var(--sn-accent-fg, #2A2E2B); box-shadow: 2px 2px 0 var(--sn-accent-fg, #2A2E2B);
    }
    site-nav a.is-primary:hover {
      background: var(--sn-accent-fg, #2A2E2B); color: var(--sn-accent, #FF8A3D);
      box-shadow: 4px 4px 0 var(--sn-accent, #FF8A3D);
    }
    site-nav a[aria-current="page"], site-nav a.is-active {
      background: var(--sn-btn-fg, #F6F4EF); color: var(--sn-btn-bg, #2A2E2B);
      border: 2px solid var(--sn-btn-bg, #2A2E2B);
    }
    .theme-toggle {
      background: var(--sn-bg, #F6F4EF); color: var(--sn-btn-bg, #2A2E2B);
      border: 2px solid var(--sn-btn-bg, #2A2E2B);
    }
    
    @media (max-width: 700px) {
      site-nav { position: static; }
      site-nav ul { gap: 6px; padding: 8px 10px; }
      site-nav a, .theme-toggle { min-height: 38px; padding: 0 14px; font-size: 12px; }
    }
    @media print { site-nav { display: none !important; } }
  `;

  class SiteNav extends HTMLElement {
    connectedCallback() {
      // 1. Inyectar estilos
      if (!document.getElementById('site-nav-css')) {
        const s = document.createElement('style');
        s.id = 'site-nav-css';
        s.textContent = CSS;
        document.head.append(s);
      }

      // 2. Inicializar Tema
      const root = document.documentElement;
      const savedTheme = localStorage.getItem("bryan-theme") || "light";
      root.setAttribute("data-theme", savedTheme);

      // 3. Construir Nav
      let links = LINKS;
      if (this.hasAttribute('links')) {
        try { links = JSON.parse(this.getAttribute('links')); } catch (e) {}
      }

      const nav = document.createElement('nav');
      nav.setAttribute('aria-label', 'Enlaces del sitio');
      const ul = document.createElement('ul');

      // Enlaces
      for (const l of links) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.textContent = l.label;
        a.href = l.href;
        if (l.id) a.id = l.id;
        if (l.primary) a.className = 'is-primary';
        
        const u = new URL(l.href, location.href);
        if (u.origin === location.origin) {
          const clean = p => p.replace(/index\.html$/, '').replace(/\/$/, '');
          if (clean(u.pathname) === clean(location.pathname)) a.setAttribute('aria-current', 'page');
        } else {
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
        }
        li.append(a);
        ul.append(li);
      }

      // Botón de Tema
      const themeLi = document.createElement('li');
      const themeBtn = document.createElement('button');
      themeBtn.className = 'theme-toggle';
      
      const updateThemeBtn = () => {
        const isDark = root.getAttribute("data-theme") === "dark";
        themeBtn.textContent = isDark ? "☀ Modo claro" : "☾ Modo oscuro";
        themeBtn.setAttribute("aria-label", isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
      };

      themeBtn.addEventListener("click", () => {
        const nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", nextTheme);
        localStorage.setItem("bryan-theme", nextTheme);
        updateThemeBtn();
      });

      updateThemeBtn();
      themeLi.append(themeBtn);
      ul.append(themeLi);

      nav.append(ul);
      this.replaceChildren(nav);
    }
  }
  customElements.define('site-nav', SiteNav);
})();
