/* ==========================================================================
   GESTIÓN OFFLINE-FIRST: DETECCIÓN DE RED, CACHÉ DE CATÁLOGO Y COLA LOCAL
   ========================================================================== */
const OfflineFirstManager = (() => {
    const KEY_CATALOGO = 'cyberzone_catalogo_cache_v1';
    const KEY_PENDIENTES = 'cyberzone_reservas_pendientes_v1';
    const KEY_CONFIRMADAS = 'cyberzone_reservas_confirmadas_v1';

    function estaEnLinea() {
        return navigator.onLine;
    }

    function obtenerPendientes() {
        try {
            return JSON.parse(localStorage.getItem(KEY_PENDIENTES)) || [];
        } catch {
            return [];
        }
    }

    function guardarPendiente(reserva) {
        const lista = obtenerPendientes();
        lista.push({
            ...reserva,
            idLocal: 'OFF-' + Date.now().toString().slice(-6),
            fechaRegistro: new Date().toISOString(),
            sincronizada: false
        });
        localStorage.setItem(KEY_PENDIENTES, JSON.stringify(lista));
        actualizarIndicadoresRed();
    }

    function guardarConfirmada(reserva) {
        try {
            const lista = JSON.parse(localStorage.getItem(KEY_CONFIRMADAS)) || [];
            lista.push({
                ...reserva,
                idConfirmacion: 'CZ-' + Date.now().toString().slice(-6),
                fechaConfirmacion: new Date().toISOString()
            });
            localStorage.setItem(KEY_CONFIRMADAS, JSON.stringify(lista));
        } catch (e) {
            console.warn('No se pudo persistir el historial local:', e);
        }
    }

    function sincronizarPendientes() {
        if (!estaEnLinea()) return 0;
        const pendientes = obtenerPendientes();
        if (pendientes.length === 0) return 0;

        pendientes.forEach(item => guardarConfirmada({ ...item, sincronizada: true }));
        localStorage.removeItem(KEY_PENDIENTES);
        actualizarIndicadoresRed();
        return pendientes.length;
    }

    function actualizarIndicadoresRed() {
        const badgeNav = document.getElementById('estadoRedBadge');
        const infoModal = document.getElementById('modalRedInfo');
        const pendientes = obtenerPendientes().length;
        const online = estaEnLinea();

        if (badgeNav) {
            if (online) {
                badgeNav.classList.remove('offline');
                badgeNav.classList.add('online');
                badgeNav.textContent = pendientes > 0
                    ? `🟢 En línea (${pendientes} sinc.)`
                    : '🟢 En línea';
            } else {
                badgeNav.classList.remove('online');
                badgeNav.classList.add('offline');
                badgeNav.textContent = pendientes > 0
                    ? `🟠 Sin conexión (${pendientes} en cola)`
                    : '🟠 Sin conexión (Offline)';
            }
        }

        if (infoModal) {
            if (online) {
                infoModal.textContent = '🟢 En línea: Validación en tiempo real y horarios activos';
            } else {
                infoModal.textContent = '🟠 Modo Offline-First: Tu reserva se guardará localmente y se sincronizará al volver internet';
            }
        }
    }

    function guardarCatalogoCache(datos) {
        try {
            localStorage.setItem(KEY_CATALOGO, JSON.stringify(datos));
        } catch (e) {
            console.warn('No se pudo cachear el catálogo:', e);
        }
    }

    function obtenerCatalogoCache() {
        try {
            return JSON.parse(localStorage.getItem(KEY_CATALOGO));
        } catch {
            return null;
        }
    }

    window.addEventListener('online', () => {
        const sincronizadas = sincronizarPendientes();
        actualizarIndicadoresRed();
        if (sincronizadas > 0) {
            const statusMsg = document.getElementById('status-msg');
            if (statusMsg) {
                statusMsg.textContent = `🟢 Conexión recuperada: Se sincronizaron ${sincronizadas} reserva(s) guardada(s) offline.`;
                statusMsg.style.color = '#facc15';
            }
        }
    });

    window.addEventListener('offline', () => {
        actualizarIndicadoresRed();
    });

    document.addEventListener('DOMContentLoaded', () => {
        sincronizarPendientes();
        actualizarIndicadoresRed();
    });

    return {
        estaEnLinea,
        guardarPendiente,
        guardarConfirmada,
        guardarCatalogoCache,
        obtenerCatalogoCache,
        actualizarIndicadoresRed
    };
})();