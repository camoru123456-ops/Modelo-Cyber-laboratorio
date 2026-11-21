/* ==========================================================================
   MÓDULO INDEPENDIENTE: SIMULACIÓN DE SMOKE TEST DEL DOM (PARTE 2)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const btnSmokeTest = document.getElementById('btnSmokeTest');
    const salidaAudit = document.getElementById('salidaAudit');

    if (btnSmokeTest && salidaAudit) {
        btnSmokeTest.addEventListener('click', () => {
            // Conteo exacto exigido por la Guía Práctica Parte 2
            const imgsSinAlt = document.querySelectorAll('img:not([alt]), img[alt=""]').length;
            const enlacesVacios = document.querySelectorAll('a[href=""], a:not([href])').length;
            const botones = document.querySelectorAll('button').length;
            
            // Verificación adicional del flujo crítico MVP (tarjetas renderizadas desde JSON)
            const tarjetasCargadas = document.querySelectorAll('#catalogoEstaciones .estacion-card').length;

            const estado = (imgsSinAlt === 0 && enlacesVacios === 0 && tarjetasCargadas > 0)
                ? 'Smoke Test OK'
                : 'Smoke Test con observaciones';

            salidaAudit.textContent = `${estado} | Botones: ${botones} | Imágenes sin alt: ${imgsSinAlt} | Enlaces vacíos: ${enlacesVacios} | Estaciones MVP: ${tarjetasCargadas}`;
            
            // Resaltar visualmente el resultado según el diagnóstico
            salidaAudit.classList.remove('audit-ok', 'audit-warn');
            salidaAudit.classList.add(
                (imgsSinAlt === 0 && enlacesVacios === 0 && tarjetasCargadas > 0) ? 'audit-ok' : 'audit-warn'
            );
        });
    }
});