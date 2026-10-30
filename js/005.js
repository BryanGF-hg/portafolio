// Constantes
const principal = document.querySelector(".principal");
const slides = Array.from(principal.querySelectorAll(".section"));

// track/tira del carrusel: crea un div, le da estilo, pasamos los slides a la tira
// y se le añade esta tira al section .principal
const track = document.createElement("div");
track.style.display = "flex";
track.style.transition = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "none" : "transform 0.3s ease";
slides.forEach(slide => track.appendChild(slide));
principal.appendChild(track);

// Botones: se crean, se les da texto, una clase y una etiqueta accesible, y se añaden a section .principal
const btnPrev = document.createElement("button");
btnPrev.type = "button";
btnPrev.textContent = "◀";
btnPrev.classList.add("boton-atras");
btnPrev.setAttribute("aria-label", "Proyecto anterior");
const btnNext = document.createElement("button");
btnNext.type = "button";
btnNext.textContent = "▶";
btnNext.classList.add("boton-delante");
btnNext.setAttribute("aria-label", "Proyecto siguiente");
principal.appendChild(btnPrev);
principal.appendChild(btnNext);

// Una constante y una función donde se muestra el ancho visible y se transforma según la pantalla (diseño responsive)
// para el botón next: avanza hasta que alcanza el máximo del slides.length y vuelve al inicio
// para el botón prev: retrocede hasta que alcanza el mínimo del slides.length y va al último
let index = 0;
function actualizar() {
  const width = principal.clientWidth;
  track.style.transform = `translateX(${-index * width}px)`;
}
btnNext.onclick = () => { index = (index + 1) % slides.length;                 actualizar(); };
btnPrev.onclick = () => { index = (index - 1 + slides.length) % slides.length; actualizar(); };

// Flechas del teclado
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") btnNext.click();
  if (e.key === "ArrowLeft") btnPrev.click();
});

window.addEventListener("resize", actualizar);
actualizar();
