/* ==========================================================================
   NAVEGACIÓN POR TECLADO (FLECHAS, HOME, END, ESCAPE) Y CONTROL ARIA
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const catalogoEstaciones = document.getElementById('catalogoEstaciones');
    const modalOverlay = document.getElementById('modalReservaOverlay');

    // Sincronizar aria-expanded en menú móvil
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            const expandido = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', String(!expandido));
            if (!expandido && navMenu) {
                const primerEnlace = navMenu.querySelector('a');
                if (primerEnlace) primerEnlace.focus();
            }
        });
    }

    // Movimiento circular del foco entre controles visibles
    function moverFocoCircular(elementos, direccion) {
        const lista = Array.from(elementos).filter(el => el.offsetParent !== null && !el.disabled);
        if (lista.length === 0) return;

        const indiceActual = lista.indexOf(document.activeElement);
        const siguienteIndice = indiceActual === -1
            ? 0
            : (indiceActual + direccion + lista.length) % lista.length;

        lista[siguienteIndice].focus();
    }

    // Navegación con flechas en la barra principal
    if (navMenu) {
        navMenu.addEventListener('keydown', (e) => {
            const enlaces = navMenu.querySelectorAll('a');
            if (enlaces.length === 0) return;

            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                moverFocoCircular(enlaces, 1);
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                moverFocoCircular(enlaces, -1);
            } else if (e.key === 'Home') {
                e.preventDefault();
                enlaces[0].focus();
            } else if (e.key === 'End') {
                e.preventDefault();
                enlaces[enlaces.length - 1].focus();
            } else if (e.key === 'Escape' && navMenu.classList.contains('open')) {
                navMenu.classList.remove('open');
                if (navToggle) {
                    navToggle.setAttribute('aria-expanded', 'false');
                    navToggle.focus();
                }
            }
        });
    }

    // Navegación con flechas entre tarjetas del catálogo
    if (catalogoEstaciones) {
        catalogoEstaciones.addEventListener('keydown', (e) => {
            const botonesAcordeon = catalogoEstaciones.querySelectorAll('.accordion-btn');
            if (botonesAcordeon.length === 0) return;

            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                moverFocoCircular(botonesAcordeon, 1);
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                moverFocoCircular(botonesAcordeon, -1);
            } else if (e.key === 'Home') {
                e.preventDefault();
                botonesAcordeon[0].focus();
            } else if (e.key === 'End') {
                e.preventDefault();
                botonesAcordeon[botonesAcordeon.length - 1].focus();
            }
        });
    }

    // Navegación dentro del modal de reserva y cierre con Escape
    document.addEventListener('keydown', (e) => {
        if (!modalOverlay || modalOverlay.style.display === 'none') return;

        if (e.key === 'Escape') {
            modalOverlay.style.display = 'none';
            const btnAbrir = document.getElementById('btnOpenReserva');
            if (btnAbrir) btnAbrir.focus();
            return;
        }

        const etiquetaActiva = document.activeElement.tagName;
        if (etiquetaActiva === 'SELECT' || etiquetaActiva === 'INPUT') return;

        const controlesModal = modalOverlay.querySelectorAll('button, select, input');
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            moverFocoCircular(controlesModal, 1);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            moverFocoCircular(controlesModal, -1);
        }
    });
});