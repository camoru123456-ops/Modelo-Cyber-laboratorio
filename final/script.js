const PRECIO_HORA = 40;      // BOB por hora
const SEGUNDOS_PAGO = 300;   // 5 minutos

// Valida disponibilidad en servidor (Online) o en caché local (Offline-First)
function verificarDisponibilidadReserva(datosReserva) {
    return new Promise((resolve) => {
        const tiempoRespuesta = OfflineFirstManager.estaEnLinea() ? 700 : 250;
        setTimeout(() => {
            if (OfflineFirstManager.estaEnLinea()) {
                resolve({
                    exito: true,
                    modo: 'online',
                    mensaje: `¡Horario ${datosReserva.horario} disponible! Completa tu pago.`
                });
            } else {
                resolve({
                    exito: true,
                    modo: 'offline',
                    mensaje: `Modo Offline: Cupo pre-asignado para las ${datosReserva.horario}. Confirma para guardar en cola.`
                });
            }
        }, tiempoRespuesta);
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

function renderizarEstaciones(estaciones) {
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
}

// Carga Offline-First: muestra caché al instante si existe y actualiza desde red en segundo plano
function cargarCatalogoEstaciones() {
    const cacheLocal = OfflineFirstManager.obtenerCatalogoCache();
    if (cacheLocal && Array.isArray(cacheLocal) && cacheLocal.length > 0) {
        renderizarEstaciones(cacheLocal);
    }

    fetch('data/estaciones.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP ${response.status} al cargar el catálogo`);
            }
            return response.json();
        })
        .then(estaciones => {
            OfflineFirstManager.guardarCatalogoCache(estaciones);
            renderizarEstaciones(estaciones);
        })
        .catch(() => {
            if (!cacheLocal || cacheLocal.length === 0) {
                $('#catalogoEstaciones').html(
                    '<p class="mensaje-estado-grid" role="alert">⚠️ Sin conexión y sin datos en caché. Conéctate una vez para descargar el catálogo.</p>'
                );
            }
        });
}

// ==========================================================================
// VALIDACIONES ESPECÍFICAS EN VIVO CON CHECK VISUAL AL LADO DE CADA CAMPO
// ==========================================================================
function actualizarEstadoCampo($input, $check, $msg, esValido, textoMensaje) {
    $input.removeClass('input-ok input-err');
    $check.removeClass('valido invalido');
    $msg.removeClass('ok error');

    if (esValido) {
        $input.addClass('input-ok');
        $check.addClass('valido').text('✓');
        $msg.addClass('ok').text(textoMensaje || 'Correcto');
    } else {
        $input.addClass('input-err');
        $check.addClass('invalido').text('✕');
        $msg.addClass('error').text(textoMensaje);
    }
    return esValido;
}

function validarNombre() {
    const $input = $('#clienteNombre');
    const val = $input.val().trim();
    const regexSoloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]{2,30}$/;
    const ok = regexSoloLetras.test(val);
    return actualizarEstadoCampo(
        $input,
        $('#checkNombre'),
        $('#msgNombre'),
        ok,
        ok ? 'Nombre válido' : 'Solo letras (mín. 2 caracteres)'
    );
}

function validarApellido() {
    const $input = $('#clienteApellido');
    const val = $input.val().trim();
    const regexSoloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]{2,35}$/;
    const ok = regexSoloLetras.test(val);
    return actualizarEstadoCampo(
        $input,
        $('#checkApellido'),
        $('#msgApellido'),
        ok,
        ok ? 'Apellido válido' : 'Solo letras (mín. 2 caracteres)'
    );
}

function validarCarnet() {
    const $input = $('#clienteCarnet');
    const val = $input.val().trim().toUpperCase();
    const regexCI = /^\d{6,9}(-[0-9A-Z]{1,2})?$/;
    const ok = regexCI.test(val);
    return actualizarEstadoCampo(
        $input,
        $('#checkCarnet'),
        $('#msgCarnet'),
        ok,
        ok ? 'CI válido' : '6 a 9 dígitos (ej. 8451234)'
    );
}

function validarCelular() {
    const $input = $('#clienteCelular');
    const val = $input.val().trim();
    const regexCel = /^[67]\d{7}$/;
    const ok = regexCel.test(val);
    return actualizarEstadoCampo(
        $input,
        $('#checkCelular'),
        $('#msgCelular'),
        ok,
        ok ? 'Celular válido' : '8 dígitos iniciando en 6 o 7'
    );
}

function validarHorario() {
    const $select = $('#horarioReserva');
    const val = $select.val();
    const ok = val !== '';
    return actualizarEstadoCampo(
        $select,
        $('#checkHorario'),
        $('#msgHorario'),
        ok,
        ok ? 'Horario seleccionado' : 'Elige una hora de inicio'
    );
}

function validarTodoElFormulario() {
    const okNombre = validarNombre();
    const okApellido = validarApellido();
    const okCarnet = validarCarnet();
    const okCelular = validarCelular();
    const okHorario = validarHorario();

    if (!okNombre) return { valido: false, campo: '#clienteNombre' };
    if (!okApellido) return { valido: false, campo: '#clienteApellido' };
    if (!okCarnet) return { valido: false, campo: '#clienteCarnet' };
    if (!okCelular) return { valido: false, campo: '#clienteCelular' };
    if (!okHorario) return { valido: false, campo: '#horarioReserva' };

    return {
        valido: true,
        datos: {
            nombre: $('#clienteNombre').val().trim(),
            apellido: $('#clienteApellido').val().trim(),
            carnet: $('#clienteCarnet').val().trim().toUpperCase(),
            celular: $('#clienteCelular').val().trim(),
            estacion: $('#estacion').val(),
            horario: $('#horarioReserva').val(),
            horas: leerHoras(),
            totalBOB: leerHoras() * PRECIO_HORA
        }
    };
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
        OfflineFirstManager.actualizarIndicadoresRed();
        $('#modalReservaOverlay').fadeIn('fast', function () {
            $('#clienteNombre').focus();
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

    // Filtros de entrada y validación en tiempo real con check lateral
    $('#clienteNombre').on('input blur', function () {
        this.value = this.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]/g, '');
        validarNombre();
    });

    $('#clienteApellido').on('input blur', function () {
        this.value = this.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]/g, '');
        validarApellido();
    });

    $('#clienteCarnet').on('input blur', function () {
        this.value = this.value.toUpperCase().replace(/[^0-9A-Z-]/g, '').slice(0, 11);
        validarCarnet();
    });

    $('#clienteCelular').on('input blur', function () {
        this.value = this.value.replace(/[^0-9]/g, '').slice(0, 8);
        validarCelular();
    });

    $('#horarioReserva').on('change blur', function () {
        validarHorario();
    });

    $('#hrs').on('input', function () {
        $('#total').text(leerHoras() * PRECIO_HORA);
    });

    $('#hrs').on('blur', function () {
        $(this).val(leerHoras());
        $('#total').text(leerHoras() * PRECIO_HORA);
    });

    function bloquearCamposFormulario(bloqueado) {
        $('#clienteNombre, #clienteApellido, #clienteCarnet, #clienteCelular, #estacion, #horarioReserva, #hrs')
            .prop('disabled', bloqueado);
    }

    function resetReserva(mensaje, color) {
        clearInterval(window.timerInterval);
        $('#timer-container').hide();
        $('#status-msg').text(mensaje).css('color', color);
        bloquearCamposFormulario(false);
        $('#btnModal').prop('disabled', false).text('Confirmar Reserva');
    }

    // Envío del formulario de reserva con validación completa + Offline-First
    $('#formReserva').on('submit', async function (e) {
        e.preventDefault();

        const resultado = validarTodoElFormulario();
        if (!resultado.valido) {
            $('#status-msg').text('⚠️ Corrige los campos marcados con ✕ antes de continuar.').css('color', '#fca5a5').show();
            $(resultado.campo).focus();
            return;
        }

        const datos = resultado.datos;
        const $btn = $('#btnModal');

        $btn.prop('disabled', true).text('Verificando horario...');
        bloquearCamposFormulario(true);
        $('#status-msg').text('Comprobando disponibilidad de estación y horario...').css('color', '#ffffff').show();
        $('#timer-container').hide();
        if (window.timerInterval) clearInterval(window.timerInterval);

        try {
            const respuesta = await verificarDisponibilidadReserva(datos);
            if (!respuesta.exito) throw new Error(respuesta.mensaje);

            window.reservaActual = { ...datos, modoRed: respuesta.modo };

            $('#status-msg')
                .text(`${respuesta.mensaje} (${datos.estacion} · ${datos.horario} · ${datos.horas} h · ${datos.totalBOB} BOB)`)
                .css('color', '#facc15');
            $btn.text('Esperando confirmación...');

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

    // Confirmar equipo -> Abre el menú opcional de Snacks y Carrito
    $('#btnPagar').click(function () {
        const r = window.reservaActual;
        if (!r) return;

        clearInterval(window.timerInterval);
        $('#timer-container').hide();
        cerrarModalReserva();

        SnacksCarritoManager.abrirMenuSnacks(r, (pedidoCompleto) => {
            const detalleSnacks = pedidoCompleto.snacks.length > 0
                ? ' + Snacks: ' + pedidoCompleto.snacks.map(s => `${s.cantidad}x ${s.nombre}`).join(', ')
                : ' (Sin snacks)';

            // Reabrimos brevemente o mostramos el comprobante final en el modal de reserva
            $('#modalReservaOverlay').fadeIn('fast');

            if (OfflineFirstManager.estaEnLinea()) {
                OfflineFirstManager.guardarConfirmada(pedidoCompleto);
                resetReserva(
                    `🎉 ¡Reserva confirmada para ${pedidoCompleto.nombre} ${pedidoCompleto.apellido} (CI: ${pedidoCompleto.carnet})! ${pedidoCompleto.estacion} a las ${pedidoCompleto.horario}${detalleSnacks}. Total: ${pedidoCompleto.totalFinalBOB} BOB. Detalles enviados al ${pedidoCompleto.celular}.`,
                    '#22c55e'
                );
            } else {
                OfflineFirstManager.guardarPendiente(pedidoCompleto);
                resetReserva(
                    `📥 ¡Guardada Offline para ${pedidoCompleto.nombre} ${pedidoCompleto.apellido} (CI: ${pedidoCompleto.carnet})! ${pedidoCompleto.estacion} a las ${pedidoCompleto.horario}${detalleSnacks}. Total: ${pedidoCompleto.totalFinalBOB} BOB. Se sincronizará al volver internet.`,
                    '#facc15'
                );
            }
        });
    });

    $('#btnCancelar').click(function () {
        resetReserva('Reserva cancelada.', '#ffffff');
    });
});