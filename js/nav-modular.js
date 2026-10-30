/* nav-modular.js — barra de enlaces reutilizable: <site-nav></site-nav>
   Una sola lista de enlaces para Web, Portafolio y Currículum. Cámbiala SOLO aquí.
   Para una página concreta: <site-nav links='[{"label":"Inicio","href":"/"}]'></site-nav>
   Colores ajustables desde tu CSS: --sn-bg, --sn-btn-bg, --sn-btn-fg, --sn-accent, --sn-accent-fg */
(() => {
  if (customElements.get('site-nav')) return;

  const LINKS = [
    { label: 'Web', href: '../web/index.html' },
    { label: 'Portafolio', href: '../portafolio/index.html' },
    { label: 'Currículum', href: '../curriculum/index.html' },
    { label: 'GitHub', href: 'https://github.com/BryanGF-hg' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/bryan-glot-fong-04082a39a/' },
    { label: 'Descargar CV', href: 'https://drive.google.com/file/d/14Se06f0c0uohh1LpYelg_1c0K56uGte-/view?usp=sharing', id: 'enlace_de_descarga', primary: true },
  ];

  // Paleta del currículum: menta #A9E3CF, menta tenue #DDF5EB, verde té #14594A, naranja suave #F9AB72
  const CSS = `
site-nav{display:block;position:sticky;top:0;z-index:50;background:var(--sn-bg,#A9E3CF);font:700 14px/1.2 'Poppins','Nunito Sans',system-ui,sans-serif;box-shadow:0 2px 10px rgba(18,48,42,.12)}
site-nav ul{list-style:none;margin:0;padding:10px 16px;display:flex;flex-wrap:wrap;justify-content:center;gap:8px}
site-nav li{margin:0;padding:0}
site-nav a{display:inline-flex;align-items:center;min-height:44px;padding:0 20px;border-radius:999px;background:var(--sn-btn-bg,#fff);color:var(--sn-btn-fg,#14594A);text-decoration:none;transition:background .15s}
site-nav a:hover{background:#DDF5EB}
site-nav a.is-primary{background:var(--sn-accent,#F9AB72);color:var(--sn-accent-fg,#2B1D15)}
site-nav a.is-primary:hover{background:#FBC49C}
site-nav a[aria-current]{background:var(--sn-btn-fg,#14594A);color:#fff}
site-nav a:focus-visible{outline:3px solid #14594A;outline-offset:2px}
@media (max-width:700px){site-nav{position:static}site-nav ul{gap:6px;padding:8px 10px}site-nav a{min-height:38px;padding:0 14px;font-size:13px}}
@media (prefers-reduced-motion:reduce){site-nav a{transition:none}}
@media print{site-nav{display:none!important}}
`;

  const clean = p => p.replace(/index\.html$/, '').replace(/\/$/, '');

  class SiteNav extends HTMLElement {
    connectedCallback() {
      if (!document.getElementById('site-nav-css')) {
        const s = document.createElement('style');
        s.id = 'site-nav-css';
        s.textContent = CSS;
        document.head.append(s);
      }
      let links = LINKS;
      if (this.hasAttribute('links')) {
        try { links = JSON.parse(this.getAttribute('links')); }
        catch (e) { console.warn('site-nav: el atributo "links" no es un JSON válido', e); }
      }
      const nav = document.createElement('nav');
      nav.setAttribute('aria-label', this.getAttribute('label') || 'Enlaces del sitio');
      const ul = document.createElement('ul');
      for (const l of links) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.textContent = l.label;
        a.href = l.href;
        if (l.id) a.id = l.id;
        if (l.primary) a.className = 'is-primary';
        let u = null;
        try { u = new URL(l.href, location.href); } catch (e) {}
        if (u && u.origin === location.origin) {
          // Enlace interno: marca la página actual
          if (clean(u.pathname) === clean(location.pathname)) a.setAttribute('aria-current', 'page');
        } else {
          // Enlace externo: pestaña nueva
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
        }
        li.append(a);
        ul.append(li);
      }
      nav.append(ul);
      this.replaceChildren(nav);
    }
  }
  customElements.define('site-nav', SiteNav);
})();
