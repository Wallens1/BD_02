document.addEventListener('DOMContentLoaded', async () => {
    const listaServicios = document.querySelector('.listaServicios');
    try {
        const res = await fetch('http://localhost:3000/servicios');
        const servicios = await res.json();
        listaServicios.innerHTML = '';
        servicios.forEach(servicio => {
            const div = document.createElement('div');
            div.className = 'servicio';

            const precio = Number(servicio.costoservicio).toLocaleString('es-CO', {
                style: 'currency',
                currency: 'COP'
            });
            div.innerHTML = `
                <h3>${servicio.nombreservicio}</h3>
                <p>Costo: ${precio}</p>
            `;
            listaServicios.appendChild(div);
        });
    } catch (err) {
        listaServicios.innerHTML = '<p>Error loading services.</p>';
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    const listaMedicos = document.querySelector('.medicosDisponibles');
    try {
        const res = await fetch('http://localhost:3000/medicos');
        const medicos = await res.json();
        listaMedicos.innerHTML = '';
        medicos.forEach(medico => {
            const div = document.createElement('div');
            div.className = 'medico';

            let horarioFormatted = medico.horario;
            const date = new Date(medico.horario);
            if (!isNaN(date)) {
                horarioFormatted = date.toLocaleTimeString('es-CO', {
                    dataStyle: 'medium',
                    timeStyle: 'short'
                });
            }
            div.innerHTML = `
                <h3>${medico.nombre}</h3>
                <p>Horario: ${horarioFormatted}</p>
                <p>Especialidad: ${medico.especialidad}</p>
            `;
            listaMedicos.appendChild(div);
        });
    } catch (err) {
        listaMedicos.innerHTML = '<p>Error loading doctors.</p>';
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    const listaMedicos = document.querySelector('.medicoNoD');
    try {
        const res = await fetch('http://localhost:3000/medicos/ocupado');
        const medicos = await res.json();
        listaMedicos.innerHTML = '';
        medicos.forEach(medico => {
            const div = document.createElement('div');
            div.className = 'medico';

            let horarioFormatted = medico.horario;
            const date = new Date(medico.horario);
            if (!isNaN(date)) {
                horarioFormatted = date.toLocaleTimeString('es-CO', {
                    dataStyle: 'medium',
                    timeStyle: 'short'
                });
            }
            div.innerHTML = `
                <h3>${medico.nombre}</h3>
                <p>Horario: ${horarioFormatted}</p>
                <p>Especialidad: ${medico.especialidad}</p>
            `;
            listaMedicos.appendChild(div);
        });
    } catch (err) {
        listaMedicos.innerHTML = '<p>Error loading doctors.</p>';
    }
});