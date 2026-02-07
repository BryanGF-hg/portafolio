// Constantes
const principal = document.querySelector(".principal");
const slides = Array.from(principal.querySelectorAll(".section"));

// track/tira del carrusel crea divs, les da estilo, pasamos los slides a la tira, ahora se le añade esta modificación/tira al section .principal
const track = document.createElement("div");
track.style.display = "flex";
track.style.transition = "transform 0.3s ease";
slides.forEach(slide => track.appendChild(slide));
principal.appendChild(track);

// Botones: Se crean, se le dan texto y una clase, y se le añade a section .principal
const btnPrev = document.createElement("button");
btnPrev.textContent = "◀";
btnPrev.classList.add("boton-atras");
const btnNext = document.createElement("button");
btnNext.textContent = "▶";
btnNext.classList.add("boton-delante");
principal.appendChild(btnPrev);
principal.appendChild(btnNext);

// Creamos una constante y una funcion donde muestra el ancho visible y lo transforma dependiendo de la pantalla (diseño responsive) 
// para el boton next: avanza hasta que alcanza el maximo del slides.length y vuelve al inicio
// para el boton prev: retrocede hasta que alcanza el minimo del slides.length y va al último
let index = 0;
function actualizar() {
  const width = principal.clientWidth;track.style.transform = `translateX(${-index * width}px)`;
}
btnNext.onclick = () => {  index = (index + 1) % slides.length;                  actualizar();              };
btnPrev.onclick = () => {  index = (index - 1 + slides.length) % slides.length;  actualizar();              };

window.addEventListener("resize", actualizar);
actualizar();
