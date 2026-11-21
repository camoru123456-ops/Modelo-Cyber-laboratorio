/* ==========================================================================
   MÓDULO DE SNACKS Y CARRITO POST-RESERVA (PAPAS FRITAS, PALITOS DE TARWI, REFRESCOS)
   ========================================================================== */
const SnacksCarritoManager = (() => {
    let carrito = [];
    let reservaBase = null;
    let onFinalizarCallback = null;

    function calcularTotalSnacks() {
        return carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    }

    function renderizarCarrito() {
        const $lista = $('#listaCarritoSnacks');
        const totalEquipo = reservaBase ? reservaBase.totalBOB : 0;
        const totalSnacks = calcularTotalSnacks();
        const totalGeneral = totalEquipo + totalSnacks;

        if (carrito.length === 0) {
            $lista.html('<li class="carrito-vacio">Aún no agregaste snacks (opcional).</li>');
        } else {
            const html = carrito.map(item => `
                <li class="carrito-fila">
                    <span><strong>${item.nombre}</strong> (${item.precio * item.cantidad} BOB)</span>
                    <div class="carrito-controles">
                        <button type="button" class="btn-qty" data-accion="restar" data-id="${item.id}" aria-label="Quitar una unidad de ${item.nombre}">-</button>
                        <span>${item.cantidad}</span>
                        <button type="button" class="btn-qty" data-accion="sumar" data-id="${item.id}" aria-label="Agregar una unidad más de ${item.nombre}">+</button>
                    </div>
                </li>
            `).join('');
            $lista.html(html);
        }

        $('#subtotalEquipo').text(totalEquipo);
        $('#subtotalSnacks').text(totalSnacks);
        $('#totalGeneralReserva').text(totalGeneral);
    }

    function agregarItem(id, nombre, precio) {
        const existente = carrito.find(i => i.id === id);
        if (existente) {
            existente.cantidad += 1;
        } else {
            carrito.push({ id, nombre, precio: Number(precio), cantidad: 1 });
        }
        renderizarCarrito();
    }

    function modificarCantidad(id, delta) {
        const idx = carrito.findIndex(i => i.id === id);
        if (idx === -1) return;
        carrito[idx].cantidad += delta;
        if (carrito[idx].cantidad <= 0) {
            carrito.splice(idx, 1);
        }
        renderizarCarrito();
    }

    function abrirMenuSnacks(datosReserva, callbackFinalizar) {
        reservaBase = datosReserva;
        onFinalizarCallback = callbackFinalizar;
        carrito = [];

        $('#resumenEquipoSnacks').text(
            `🎮 Equipo reservado: ${datosReserva.estacion} · ${datosReserva.horario} (${datosReserva.horas} h · ${datosReserva.totalBOB} BOB)`
        );
        renderizarCarrito();

        $('#modalSnacksOverlay').fadeIn('fast', () => {
            const primerBtn = document.querySelector('#modalSnacksOverlay .btn-add-snack');
            if (primerBtn) primerBtn.focus();
        });
    }

    function cerrarMenuSnacks() {
        $('#modalSnacksOverlay').fadeOut('fast');
    }

    function finalizarConOpcional(incluirSnacks) {
        const itemsFinales = incluirSnacks ? [...carrito] : [];
        const totalSnacks = incluirSnacks ? calcularTotalSnacks() : 0;
        const pedidoCompleto = {
            ...reservaBase,
            snacks: itemsFinales,
            totalSnacksBOB: totalSnacks,
            totalFinalBOB: (reservaBase ? reservaBase.totalBOB : 0) + totalSnacks
        };
        cerrarMenuSnacks();
        if (typeof onFinalizarCallback === 'function') {
            onFinalizarCallback(pedidoCompleto);
        }
    }

    $(document).ready(() => {
        $('.btn-add-snack').on('click', function () {
            const id = $(this).data('id');
            const nombre = $(this).data('nombre');
            const precio = $(this).data('precio');
            agregarItem(id, nombre, precio);
        });

        $('#listaCarritoSnacks').on('click', '.btn-qty', function () {
            const id = $(this).data('id');
            const accion = $(this).data('accion');
            modificarCantidad(id, accion === 'sumar' ? 1 : -1);
        });

        $('#btnOmitirSnacks, #btnCloseSnacks').on('click', () => {
            finalizarConOpcional(false);
        });

        $('#btnConfirmarConSnacks').on('click', () => {
            finalizarConOpcional(true);
        });

        $('#modalSnacksOverlay').on('click', function (e) {
            if ($(e.target).is('#modalSnacksOverlay')) {
                finalizarConOpcional(false);
            }
        });
    });

    return {
        abrirMenuSnacks
    };
})();