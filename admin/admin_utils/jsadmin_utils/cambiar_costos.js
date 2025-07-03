document.addEventListener('DOMContentLoaded', async () => {
    const consultaSelect = document.getElementById('consulta');
    const costoInput = document.getElementById('costoActualConsulta');
    const nuevoCostoInput = document.getElementById('nuevoCostoConsulta');
    const guardarBtn = document.getElementById('guardarCostoConsulta');
    let tipos = [];

    try {
        const res = await fetch('http://localhost:3000/tipoconsulta');
        tipos = await res.json();
        consultaSelect.innerHTML = '<option value="">Seleccione un tipo de consulta</option>';
        tipos.forEach(tipo => {
            const option = document.createElement('option');
            option.value = tipo.tipoconsulta;
            option.textContent = tipo.tipoconsulta;
            consultaSelect.appendChild(option);
        });
    } catch (err) {
        consultaSelect.innerHTML = '<option value="">No hay tipos de consulta</option>';
    }

    consultaSelect.addEventListener('change', () => {
        const selected = consultaSelect.value;
        const tipo = tipos.find(t => t.tipoconsulta === selected);
        costoInput.textContent = tipo ? tipo.costoconsulta : '';
    });

    guardarBtn.addEventListener('click', async () => {
        const selected = consultaSelect.value;
        const nuevoCosto = nuevoCostoInput.value;
        if (!selected || !nuevoCosto) return;

        try {
            const res = await fetch(`http://localhost:3000/tipoconsulta/${selected}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ costoconsulta: nuevoCosto })
            });
            if (res.ok) {
                // Update UI
                const tipo = tipos.find(t => t.tipoconsulta === selected);
                if (tipo) tipo.costoconsulta = nuevoCosto;
                costoInput.textContent = nuevoCosto;
                nuevoCostoInput.value = '';
            } else {
                alert('Error updating cost');
            }
        } catch (err) {
            alert('Network error');
        }
    });
});