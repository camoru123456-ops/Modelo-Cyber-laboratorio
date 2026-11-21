/* ==========================================================================
   MÓDULO DE ACCESIBILIDAD WEB (a11y): CONTRASTE Y NAVEGACIÓN CON FLECHAS
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const btnSimularContraste = document.getElementById('btnSimularContraste');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const catalogoEstaciones = document.getElementById('catalogoEstaciones');
    const modalOverlay = document.getElementById('modalReservaOverlay');

    // 1. Alternar Modo Alto Contraste
    if (btnSimularContraste) {
        btnSimularContraste.addEventListener('click', () => {
            const estaActivo = document.body.classList.toggle('alto-contraste');
            btnSimularContraste.setAttribute('aria-pressed', String(estaActivo));
            btnSimularContraste.textContent = estaActivo
                ? '👁️ Desactivar Contraste'
                : '👁️ Simular Alto Contraste';
        });
    }

    // 2. Actualizar aria-expanded en el menú móvil
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

    // Función auxiliar para mover el foco circularmente entre una lista de elementos
    function moverFocoCircular(elementos, direccion) {
        const lista = Array.from(elementos).filter(el => el.offsetParent !== null && !el.disabled);
        if (lista.length === 0) return;

        const indiceActual = lista.indexOf(document.activeElement);
        let siguienteIndice = 0;

        if (indiceActual === -1) {
            siguienteIndice = 0;
        } else {
            siguienteIndice = (indiceActual + direccion + lista.length) % lista.length;
        }

        lista[siguienteIndice].focus();
    }

    // 3. Navegación con flechas en el Menú Principal (#navMenu)
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

    // 4. Navegación con flechas en las Tarjetas de Estaciones (PS5, PC Gamer, Arcade)
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

    // 5. Navegación con flechas Arriba/Abajo dentro del Modal de Reserva y cierre con Escape
    document.addEventListener('keydown', (e) => {
        if (!modalOverlay || modalOverlay.style.display === 'none') return;

        if (e.key === 'Escape') {
            modalOverlay.style.display = 'none';
            const btnAbrir = document.getElementById('btnOpenReserva');
            if (btnAbrir) btnAbrir.focus();
            return;
        }

        // Evita interceptar flechas Arriba/Abajo cuando el usuario cambia opciones en <select> o números en <input type="number">
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