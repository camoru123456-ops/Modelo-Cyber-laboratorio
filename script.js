const PRECIO_HORA = 40;      // BOB por hora
const SEGUNDOS_PAGO = 300;   // 5 minutos

// Simula la validación de disponibilidad en el servidor
function verificarDisponibilidadServidor() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ exito: true, mensaje: "¡Estación disponible! Completa tu pago." });
        }, 1500);
    });
}

// Lee y normaliza las horas (entero entre 1 y 12)
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

$(document).ready(function () {

    // Menú móvil
    $('#navToggle').click(() => $('#navMenu').toggleClass('open'));
    $('#navMenu a').click(() => $('#navMenu').removeClass('open'));

    // --- MANEJO DEL MODAL DE RESERVA ---
    function abrirModalReserva() {
        $('#modalReservaOverlay').fadeIn('fast');
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

    // Cerrar modal al hacer clic en el fondo oscuro
    $('#modalReservaOverlay').click(function (e) {
        if ($(e.target).is('#modalReservaOverlay')) {
            cerrarModalReserva();
        }
    });
    // Acordeón exclusivo con uso de .hide() y .show() para ocultar las demás opciones
    $('.accordion-btn').click(function () {
        const $cardActual = $(this).closest('.estacion-card');
        const $panelActual = $(this).next('.accordion-panel');
        const $todasLasTarjetas = $('.estacion-card');
        const $todosLosPaneles = $('.accordion-panel');

        // Si el panel actual ya está abierto, lo cerramos y mostramos todas las tarjetas de nuevo
        if ($panelActual.is(':visible')) {
            $panelActual.slideToggle('fast');
            $todasLasTarjetas.show(); // Vuelve a mostrar las otras tarjetas
        } else {
            // Primero ocultamos todos los paneles y mostramos todas las tarjetas para reiniciar el estado
            $todosLosPaneles.slideUp('fast');
            $todasLasTarjetas.show();

            // Ocultamos las otras dos tarjetas usando .hide()
            $todasLasTarjetas.not($cardActual).hide();

            // Desplegamos únicamente el panel de la tarjeta seleccionada con .slideToggle()
            $panelActual.slideToggle('fast');
        }
    });

    // Cálculo del total en vivo
    $('#hrs').on('input', function () {
        $('#total').text(leerHoras() * PRECIO_HORA);
    });
    
    $('#hrs').on('blur', function () {
        $(this).val(leerHoras());
        $('#total').text(leerHoras() * PRECIO_HORA);
    });

    // Finaliza o reinicia el flujo de reserva
    function resetReserva(mensaje, color) {
        clearInterval(window.timerInterval);
        $('#timer-container').hide();
        $('#status-msg').text(mensaje).css('color', color);
        $('#hrs, #estacion').prop('disabled', false);
        $('#btnModal').prop('disabled', false).text('Confirmar Reserva');
    }

    // Confirmar reserva (asíncrono)
    $('#btnModal').click(async function () {
        const $btn = $(this);
        const horas = leerHoras();
        const estacion = $('#estacion').val();
        const totalBOB = horas * PRECIO_HORA;

        $btn.prop('disabled', true).text('Validando disponibilidad...');
        $('#hrs, #estacion').prop('disabled', true);
        $('#status-msg').text('Conectando con el servidor...').css('color', '#00d2ff').show();
        $('#timer-container').hide();
        if (window.timerInterval) clearInterval(window.timerInterval);

        try {
            const respuesta = await verificarDisponibilidadServidor();
            if (!respuesta.exito) throw new Error(respuesta.mensaje);

            window.reservaActual = { estacion, horas, totalBOB };

            $('#status-msg')
                .text(`${respuesta.mensaje} (${estacion} · ${horas} h · ${totalBOB} BOB)`)
                .css('color', '#00ff66');
            $btn.text('Esperando pago...');

            let tiempoRestante = SEGUNDOS_PAGO;
            $('#countdown').text(formatearTiempo(tiempoRestante));
            $('#timer-container').show();

            window.timerInterval = setInterval(() => {
                tiempoRestante--;
                $('#countdown').text(formatearTiempo(Math.max(tiempoRestante, 0)));
                if (tiempoRestante <= 0) {
                    resetReserva('⚠️ El tiempo de reserva ha expirado.', '#ff007f');
                }
            }, 1000);

        } catch (error) {
            resetReserva('Error al procesar la reserva. Intenta de nuevo.', '#ff3b3b');
        }
    });

    // Pagar y confirmar la reserva
    $('#btnPagar').click(function () {
        const r = window.reservaActual;
        resetReserva(
            `🎉 ¡Reserva confirmada! ${r.estacion} · ${r.horas} h · ${r.totalBOB} BOB. Te esperamos en CyberZone.`,
            '#00ff66'
        );
    });

    // Cancelar la reserva
    $('#btnCancelar').click(function () {
        resetReserva('Reserva cancelada.', '#ff007f');
    });
});