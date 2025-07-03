// File: admin/jsadmin_utils/ajustar_convenios.js

document.addEventListener('DOMContentLoaded', () => {
    const empresaInput = document.getElementById('empresa');
    const confirmarBtn = document.getElementById('confirmarEmpresa');
    const beneficiosInput = document.getElementById('beneficios');
    const descuentoInput = document.getElementById('descuento');
    const guardarBtn = document.getElementById('guardarCambios');

    confirmarBtn.addEventListener('click', async () => {
        const empresa = empresaInput.value.trim();
        if (!empresa) return;

        try {
            // Adjust the endpoint as needed for your backend
            const res = await fetch(`http://localhost:3000/convenios?empresa=${encodeURIComponent(empresa)}`);
            if (!res.ok) {
                beneficiosInput.value = '';
                descuentoInput.value = '';
                alert('Empresa not found');
                return;
            }
            const convenio = await res.json();

            // Update fields
            beneficiosInput.value = convenio.beneficio || '';
            descuentoInput.value = convenio.descuento || '';
        } catch (err) {
            beneficiosInput.value = '';
            descuentoInput.value = '';
            alert('Error fetching convenio');
        }
    });

    guardarBtn.addEventListener('click', async () => {
        const empresa = empresaInput.value.trim();
        const beneficio = beneficiosInput.value.trim();
        const descuento = descuentoInput.value.trim();

        if (!empresa) {
            alert('Empresa is required');
            return;
        }

        try {
            const res = await fetch(`http://localhost:3000/convenios/${encodeURIComponent(empresa)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ beneficio, descuento })
            });

            if (!res.ok) {
                alert('Error updating convenio');
                return;
            }

            alert('Convenio updated successfully');
        } catch (err) {
            alert('Error updating convenio');
        }
    });
});