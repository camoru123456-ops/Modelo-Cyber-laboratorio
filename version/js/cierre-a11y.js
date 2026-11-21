/* ==========================================================================
   MÓDULO DE CIERRE: AUDITORÍA SEMÁNTICA HTML5 Y ACTUALIZACIÓN SIN RECARGA
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const btnAuditarA11Y = document.getElementById('btnAuditarA11Y');
    const reporteA11Y = document.getElementById('reporteA11Y');

    if (btnAuditarA11Y && reporteA11Y) {
        btnAuditarA11Y.addEventListener('click', () => {
            // 1. Inspección de etiquetas semánticas estructurales HTML5 (Pregunta 35)
            const zonas = document.querySelectorAll('header, nav, main, article, footer').length;
            const sinAlt = document.querySelectorAll('img:not([alt]), img[alt=""]').length;

            // 2. Actualización del estado en el DOM sin recargar la página (Concepto Pregunta 36)
            reporteA11Y.textContent = `Auditoría en vivo: ${zonas} etiquetas semánticas HTML5 detectadas | Imágenes sin alt: ${sinAlt}.`;

            // Retroalimentación visual instantánea sin alterar el estado de tarjetas o modal
            reporteA11Y.classList.remove('audit-ok', 'audit-warn');
            reporteA11Y.classList.add(sinAlt === 0 && zonas >= 5 ? 'audit-ok' : 'audit-warn');
        });
    }
});