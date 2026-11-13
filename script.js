$(function () {
    /* 1. REGISTRO SERVICE WORKER */
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('sw.js').then(reg => {
                console.log('Service Worker PWA Registrado:', reg.scope);
            }).catch(err => {
                console.error('Fallo en Registro de SW:', err);
            });
        });
    }

    /* 2. ESTADO DE RED ONLINE/OFFLINE */
    function actualizarEstadoRed() {
        if (navigator.onLine) {
            $('#estadoRed').text('🟢 En Línea').css({'background': '#dcfce7', 'color': '#166534', 'padding': '2px 6px', 'border-radius': '4px', 'font-size': '11px'});
        } else {
            $('#estadoRed').text('🟠 Offline').css({'background': '#ffedd5', 'color': '#9a3412', 'padding': '2px 6px', 'border-radius': '4px', 'font-size': '11px'});
        }
    }
    $(window).on('online offline', actualizarEstadoRed);
    actualizarEstadoRed();

    /* 3. FUNCIÓN DE REFRESCAR GLOBAL EN BOTONES */
    $(document).on('click', '.btn-refresh-target', function(e) {
        // Ejecuta efecto visual de recarga / refresco suave de la vista
        const $btn = $(this);
        $btn.addClass('pulsing');
        setTimeout(() => $btn.removeClass('pulsing'), 300);
    });

    $('#btnRefrescar').on('click', function() {
        location.reload();
    });

    /* 4. TEMA CLARO / OSCURO */
    const $body = $('body');
    const $themeBtn = $('#themeBtn');
    $themeBtn.on('click', function() {
        const oscuro = !$body.hasClass('dark-mode');
        $body.toggleClass('dark-mode', oscuro);
        $themeBtn.text(oscuro ? '☀️ Claro' : '🌙 Oscuro');
    });

    /* 5. NAVEGACIÓN SPA */
    const $menuBtn = $('#menuBtn');
    const $navMenu = $('#navMenu');
    const $viewTitle = $('#viewTitle');
    const titulos = {};
    let vistaActual = null;

    $('.nav-link').each(function() {
        if($(this).data('view')) titulos[$(this).data('view')] = $(this).text().trim();
    });

    function cerrarNav() { $navMenu.stop(true, true).slideUp(160); }
    $menuBtn.on('click', function(e) {
        e.stopPropagation();
        $navMenu.stop(true, true).slideToggle(180);
    });

    function irA(id) {
        if (!titulos[id] || id === vistaActual) return;
        const $destino = $('#view-' + id);
        if (vistaActual === null) {
            $destino.show();
            vistaActual = id;
            $viewTitle.text(titulos[id]);
            return;
        }
        $('#view-' + vistaActual).fadeOut(120, function() {
            $destino.scrollTop(0).fadeIn(180);
            vistaActual = id;
            $viewTitle.text(titulos[id]);
        });
    }

    $('.nav-link').on('click', function(e) {
        const view = $(this).data('view');
        if(view) {
            e.preventDefault();
            irA(view);
            cerrarNav();
        }
    });
    $('.tile').on('click', function() { irA($(this).data('go')); });

    $(document).on('click', function(e) {
        if (!$(e.target).closest('#navMenu, #menuBtn').length) cerrarNav();
    });

    irA('inicio');

    /* 6. CARRUSEL INICIAL */
    const $slides = $('.slide');
    let slideIdx = 0;
    if ($slides.length > 1) {
        setInterval(function() {
            if (vistaActual !== 'inicio') return;
            const $sale = $slides.eq(slideIdx);
            slideIdx = (slideIdx + 1) % $slides.length;
            $sale.fadeOut(400);
            $slides.eq(slideIdx).fadeIn(400);
        }, 3500);
    }

    /* 7. ACORDEÓN PASATIEMPOS */
    $('.acc-head').on('click', function() {
        const $head = $(this);
        const $body = $head.next('.acc-body');
        const abierto = $body.is(':visible');
        $('.acc-body').not($body).stop(true, true).slideUp(200);
        $body.stop(true, true).slideToggle(200);
        $head.attr('aria-expanded', String(!abierto));
    });

    /* 8. HORARIO HORA ACTUAL */
    const h = new Date().getHours() + new Date().getMinutes() / 60;
    $('.tabla tbody tr').each(function() {
        const $f = $(this);
        $f.toggleClass('ahora', h >= Number($f.data('ini')) && h < Number($f.data('fin')));
    });

    /* 9. MÚSICA & FILTROS */
    const $selGenero = $('#selGenero');
    const $selArtista = $('#selArtista');
    const $tarjetasMusica = $('.card-musica');

    $selGenero.on('change', function() {
        const g = $(this).val();
        $selArtista.html('<option value="todos">Todos los artistas</option>');
        if (g === 'todos') { $selArtista.prop('disabled', true); }
        else {
            $tarjetasMusica.filter("[data-genero='" + g + "']").each(function() {
                const art = $(this).attr('data-artista');
                $('<option>').val(art).text(art).appendTo($selArtista);
            });
            $selArtista.prop('disabled', false);
        }
        filtrarMusica();
    });

    function filtrarMusica() {
        const g = $selGenero.val();
        const a = $selArtista.val();
        $tarjetasMusica.each(function() {
            const $c = $(this);
            const okG = (g === 'todos' || $c.attr('data-genero') === g);
            const okA = (a === 'todos' || $c.attr('data-artista') === a);
            $c.toggle(okG && okA);
        });
    }
    $selArtista.on('change', filtrarMusica);

    /* 10. JUEGOS & MODAL */
    const $juegosMenu = $('#juegosMenu');
    $('#juegosMenuBtn').on('click', function(e) {
        e.stopPropagation();
        $juegosMenu.stop(true, true).slideToggle(150);
    });
    $('.btn-filtro-item').on('click', function() {
        const cat = $(this).attr('data-cat');
        $('#juegosFiltroActual').text($(this).text());
        $juegosMenu.slideUp(100);
        $('.card-juego').each(function() {
            $(this).toggle(cat === 'todos' || $(this).attr('data-categoria') === cat);
        });
    });

    const $modal = $('#modalJuego');
    $('.card-juego').on('click', function() {
        $('#modalTitulo').text($(this).attr('data-titulo'));
        $('#modalDescripcion').text($(this).attr('data-descripcion'));
        $modal.fadeIn(180);
    });
    $('#cerrarModal, .modal-overlay').on('click', function(e) {
        if (e.target === this) $modal.fadeOut(150);
    });

    /* 11. MÓDULO KARAOKE (BLINDADO ANTI-XSS + 44PX) CON DELEGACIÓN */
    $('#btnPedir').on('click', function() {
        let tema = $('#inputCancion').val().trim();
        if (!tema) return;
        let $fila = $('<div>').addClass('fila-cancion');
        let $titulo = $('<span>').addClass('titulo-truncado').text(tema); // Anti-XSS con .text()
        let $btnQuitar = $('<button>').addClass('btn-tactil btn-quitar').text('x');
        $fila.append($titulo, $btnQuitar);
        $('#listaCanciones').append($fila);
        $('#inputCancion').val('');
    });

    // Delegación por Event Bubbling
    $('#listaCanciones').off('click', '.btn-quitar').on('click', '.btn-quitar', function() {
        $(this).closest('.fila-cancion').remove();
    });

    /* 12. MÓDULO RESERVAS VIP (ANTI-XSS CON .TEXT()) */
    $('#formReserva').off('submit').on('submit', function(e) {
        e.preventDefault();
        let nombre = $('#clienteNombre').val().trim();
        let sala = $('#salaSelect').val();
        if (!nombre) return;
        let $item = $('<li>').addClass('item-reserva');
        let $textoSeguro = $('<strong>').text(nombre + ' — ');
        let $detalleSala = $('<span>').text(sala);
        $item.append($textoSeguro, $detalleSala);
        $('#listaReservas').append($item);
        this.reset();
    });

    /* 13. FORMULARIO MULTIPASOS */
    const $pasos = $('.paso');
    const $dots = $('.dot');
    let paso = 0;

    function actualizarPasos() {
        $('#pasoTexto').text('Paso ' + (paso + 1) + ' de 3');
        $dots.each(function(i) { $(this).toggleClass('active', i <= paso); });
        $('#btnAtras').prop('disabled', paso === 0);
        $('#btnSiguiente').toggle(paso < 2);
        $pasos.hide().eq(paso).show();
        $('#btnEnviar').toggle(paso === 2);
    }

    $('#btnSiguiente').on('click', function() { if(paso < 2) { paso++; actualizarPasos(); } });
    $('#btnAtras').on('click', function() { if(paso > 0) { paso--; actualizarPasos(); } });
    actualizarPasos();
});
