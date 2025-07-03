document.addEventListener('DOMContentLoaded', async () => {
    const ingresosBody = document.getElementById('ingresosBody');
    try {
        const res = await fetch('http://localhost:3000/consulta/ingresos/mensuales');
        const data = await res.json();
        ingresosBody.innerHTML = '';
        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.mes}</td>
                <td>$${Number(row.ingresos).toLocaleString()}</td>
            `;
            ingresosBody.appendChild(tr);
        });
    } catch (err) {
        ingresosBody.innerHTML = '<tr><td colspan="2">Error loading data</td></tr>';
    }
});