const PRECIO_HORA = 40;      // BOB por hora
const SEGUNDOS_PAGO = 300;   // 5 minutos

function verificarDisponibilidadServidor() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ exito: true, mensaje: "¡Estación disponible! Completa tu pago." });
        }, 1500);
    });
}

function leerHoras() {
    let horas = parseInt($('#hrs').val(), 10);
    if (isNaN(horas) || horas < 1) horas = 1;
    if (horas > 12) horas = 12;
    return horas;
}

function formatearTiempo(seg) {
    const m = String(Math.floor(seg / 60)).padStart(2, '0');
    const s = String(seg % 60).padStart(2, '0');
    return `${m}:${s}`;
}

function generarListaHTML(items) {
    return items.map(item => `<li>${item}</li>`).join('');
}

function cargarCatalogoEstaciones() {
    fetch('data/estaciones.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP ${response.status} al cargar el catálogo de estaciones`);
            }
            return response.json();
        })
        .then(estaciones => {
            let htmlTarjetas = '';
            let htmlOpcionesSelect = '';

            estaciones.forEach(est => {
                const textoAlt = est.alt || `Fotografía de ${est.nombre}`;
                const idPanel = `panel-${est.id}`;

                htmlTarjetas += `
                    <article class="estacion-card card-item ${est.tema}" data-id="${est.id}">
                        <div class="card-header">
                            <img src="${est.imagen}" alt="${textoAlt}" class="card-thumb" loading="lazy" width="48" height="48">
                            <h3>${est.icono} ${est.nombre}</h3>
                        </div>
                        <p class="card-desc">${est.descripcion}</p>
                        <button type="button" class="accordion-btn" aria-expanded="false" aria-controls="${idPanel}">
                            📌 Ver Detalles del Servicio
                        </button>
                        <div id="${idPanel}" class="accordion-panel" style="display:none;">
                            <h4>Componentes</h4>
                            <ul>${generarListaHTML(est.componentes)}</ul>
                            <h4>Monitores</h4>
                            <ul>${generarListaHTML(est.monitores)}</ul>
                            <h4>Periféricos</h4>
                            <ul>${generarListaHTML(est.perifericos)}</ul>
                            <h4>Catálogo de juegos</h4>
                            <ul>${generarListaHTML(est.catalogo)}</ul>
                        </div>
                    </article>
                `;

                htmlOpcionesSelect += `<option value="${est.nombre}">${est.nombre}</option>`;
            });

            $('#catalogoEstaciones').html(htmlTarjetas);
            $('#estacion').html(htmlOpcionesSelect);
        })
        .catch(() => {
            $('#catalogoEstaciones').html(
                '<p class="mensaje-estado-grid" role="alert">⚠️ No se pudo cargar el catálogo de estaciones. Verifica tu conexión o recarga la página.</p>'
            );
        });
}

$(document).ready(function () {

    cargarCatalogoEstaciones();

    $('#catalogoEstaciones')
        .off('click', '.accordion-btn')
        .on('click', '.accordion-btn', function () {
            const $btnActual = $(this);
            const $cardActual = $btnActual.closest('.estacion-card');
            const $panelActual = $btnActual.next('.accordion-panel');
            const $todasLasTarjetas = $('#catalogoEstaciones .estacion-card');
            const $todosLosPaneles = $('#catalogoEstaciones .accordion-panel');
            const $todosLosBotones = $('#catalogoEstaciones .accordion-btn');

            if ($panelActual.is(':visible')) {
                $panelActual.slideToggle('fast');
                $btnActual.attr('aria-expanded', 'false');
                $todasLasTarjetas.show();
            } else {
                $todosLosPaneles.slideUp('fast');
                $todosLosBotones.attr('aria-expanded', 'false');
                $todasLasTarjetas.show();
                $todasLasTarjetas.not($cardActual).hide();
                $panelActual.slideToggle('fast');
                $btnActual.attr('aria-expanded', 'true');
            }
        });

    $('#navToggle').click(() => $('#navMenu').toggleClass('open'));
    $('#navMenu a').click(() => {
        $('#navMenu').removeClass('open');
        $('#navToggle').attr('aria-expanded', 'false');
    });

    function abrirModalReserva() {
        $('#modalReservaOverlay').fadeIn('fast', function () {
            $('#estacion').focus();
        });
    }

    function cerrarModalReserva() {
        $('#modalReservaOverlay').fadeOut('fast');
    }

    $('#btnOpenReserva, #navReservaLink').click(function (e) {
        e.preventDefault();
        abrirModalReserva();
    });

    $('#btnCloseModal').click(function () {
        cerrarModalReserva();
    });

    $('#modalReservaOverlay').click(function (e) {
        if ($(e.target).is('#modalReservaOverlay')) {
            cerrarModalReserva();
        }
    });

    $('#hrs').on('input', function () {
        $('#total').text(leerHoras() * PRECIO_HORA);
    });

    $('#hrs').on('blur', function () {
        $(this).val(leerHoras());
        $('#total').text(leerHoras() * PRECIO_HORA);
    });

    function resetReserva(mensaje, color) {
        clearInterval(window.timerInterval);
        $('#timer-container').hide();
        $('#status-msg').text(mensaje).css('color', color);
        $('#hrs, #estacion').prop('disabled', false);
        $('#btnModal').prop('disabled', false).text('Confirmar Reserva');
    }

    $('#btnModal').click(async function () {
        const $btn = $(this);
        const horas = leerHoras();
        const estacion = $('#estacion').val();
        const totalBOB = horas * PRECIO_HORA;

        $btn.prop('disabled', true).text('Validando disponibilidad...');
        $('#hrs, #estacion').prop('disabled', true);
        $('#status-msg').text('Conectando con el servidor...').css('color', '#ffffff').show();
        $('#timer-container').hide();
        if (window.timerInterval) clearInterval(window.timerInterval);

        try {
            const respuesta = await verificarDisponibilidadServidor();
            if (!respuesta.exito) throw new Error(respuesta.mensaje);

            window.reservaActual = { estacion, horas, totalBOB };

            $('#status-msg')
                .text(`${respuesta.mensaje} (${estacion} · ${horas} h · ${totalBOB} BOB)`)
                .css('color', '#facc15');
            $btn.text('Esperando pago...');

            let tiempoRestante = SEGUNDOS_PAGO;
            $('#countdown').text(formatearTiempo(tiempoRestante));
            $('#timer-container').show();

            window.timerInterval = setInterval(() => {
                tiempoRestante--;
                $('#countdown').text(formatearTiempo(Math.max(tiempoRestante, 0)));
                if (tiempoRestante <= 0) {
                    resetReserva('⚠️ El tiempo de reserva ha expirado.', '#facc15');
                }
            }, 1000);

        } catch (error) {
            resetReserva('Error al procesar la reserva. Intenta de nuevo.', '#ffffff');
        }
    });

    $('#btnPagar').click(function () {
        const r = window.reservaActual;
        resetReserva(
            `🎉 ¡Reserva confirmada! ${r.estacion} · ${r.horas} h · ${r.totalBOB} BOB. Te esperamos en CyberZone.`,
            '#facc15'
        );
    });

    $('#btnCancelar').click(function () {
        resetReserva('Reserva cancelada.', '#ffffff');
    });
});