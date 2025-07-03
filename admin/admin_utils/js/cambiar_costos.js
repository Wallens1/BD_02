// Variable global para almacenar servicios
let serviciosGlobales = [];

// Cargar servicios cuando la página esté lista
document.addEventListener('DOMContentLoaded', function() {
    cargarServicios();
    
    // Configurar evento de cambio en el select
    const select = document.getElementById('servicio');
    const costoActual = document.getElementById('costoActualServicio');
    const btnGuardar = document.getElementById('guardarCostoServicio');
    const nuevoCostoInput = document.getElementById('nuevoCostoServicio');
    
    // Evento para mostrar costo al seleccionar servicio
    select.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        
        if (selectedOption.value === '') {
            costoActual.textContent = '$$$$';
        } else {
            const costo = selectedOption.dataset.costo;
            if (costo && !isNaN(costo)) {
                costoActual.textContent = `$${parseFloat(costo).toLocaleString('es-CO')}`;
            } else {
                costoActual.textContent = 'Costo no disponible';
            }
        }
    });
    
    // Evento para guardar cambios
    btnGuardar.addEventListener('click', guardarCambiosCosto);
    
    // Evento para validar entrada numérica
    nuevoCostoInput.addEventListener('input', function() {
        // Remover caracteres no numéricos excepto punto decimal
        this.value = this.value.replace(/[^0-9.]/g, '');
        
        // Evitar múltiples puntos decimales
        const parts = this.value.split('.');
        if (parts.length > 2) {
            this.value = parts[0] + '.' + parts.slice(1).join('');
        }
    });
    
    // Evento para Enter en el campo de nuevo costo
    nuevoCostoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            guardarCambiosCosto();
        }
    });
});

// Función para cargar servicios desde la base de datos
async function cargarServicios() {
    try {
        console.log('Intentando cargar servicios...');
        const response = await fetch('http://localhost:3000/servicios');
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const servicios = await response.json();
        serviciosGlobales = servicios; // Guardar en variable global
        console.log('Respuesta completa del servidor:', servicios);
        console.log('Tipo de datos recibidos:', typeof servicios);
        console.log('Es array?', Array.isArray(servicios));
        
        const select = document.getElementById('servicio');
        
        // Limpiar opciones existentes (excepto la primera)
        select.innerHTML = '<option value="">Seleccione un servicio...</option>';
        
        if (!Array.isArray(servicios) || servicios.length === 0) {
            console.log('No se encontraron servicios o no es un array');
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "No hay servicios disponibles";
            select.appendChild(option);
            return;
        }
        
        // Agregar cada servicio como opción
        servicios.forEach((servicio, index) => {
            console.log(`Servicio ${index}:`, servicio);
            console.log('Propiedades del servicio:', Object.keys(servicio));
            
            const option = document.createElement('option');
            
            // Usar los nombres correctos de las columnas de la base de datos
            const id = servicio.idservicio;
            const nombre = servicio.nombreservicio;
            const costo = servicio.costoservicio;
            
            console.log('ID encontrado:', id);
            console.log('Nombre encontrado:', nombre);
            console.log('Costo encontrado:', costo);
            
            option.value = id || index; // Usar el ID como valor
            option.textContent = nombre || `Servicio ${index + 1}`;
            option.dataset.costo = costo || 0;
            option.dataset.id = id || index; // Guardar también el ID
            select.appendChild(option);
        });
        
        console.log('Servicios cargados exitosamente');
        
    } catch (error) {
        console.error('Error detallado al cargar servicios:', error);
        alert('Error al conectar con el servidor. Verifique que esté funcionando en http://localhost:3000');
    }
}

// Función para guardar cambios en el costo
async function guardarCambiosCosto() {
    const select = document.getElementById('servicio');
    const nuevoCostoInput = document.getElementById('nuevoCostoServicio');
    const costoActualElement = document.getElementById('costoActualServicio');
    
    const servicioId = select.value;
    const nuevoCosto = parseFloat(nuevoCostoInput.value);
    
    // Validaciones
    if (!servicioId || servicioId === '') {
        alert('Por favor seleccione un servicio');
        return;
    }
    
    if (!nuevoCosto || nuevoCosto <= 0 || isNaN(nuevoCosto)) {
        alert('Por favor ingrese un costo válido (número mayor a 0)');
        return;
    }
    
    // Confirmar el cambio
    const selectedOption = select.options[select.selectedIndex];
    const nombreServicio = selectedOption.textContent;
    const costoActual = selectedOption.dataset.costo;
    
    const confirmacion = confirm(
        `¿Está seguro de cambiar el costo del servicio "${nombreServicio}" de $${parseFloat(costoActual).toLocaleString('es-CO')} a $${nuevoCosto.toLocaleString('es-CO')}?`
    );
    
    if (!confirmacion) {
        return;
    }
    
    try {
        console.log(`Enviando actualización: ID ${servicioId}, nuevo costo: ${nuevoCosto}`);
        
        const response = await fetch(`http://localhost:3000/servicios/${servicioId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ costo: nuevoCosto })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error HTTP: ${response.status}`);
        }
        
        const resultado = await response.json();
        console.log('Respuesta del servidor:', resultado);
        
        // Actualizar la opción en el select
        selectedOption.dataset.costo = nuevoCosto;
        
        // Actualizar la visualización del costo actual
        costoActualElement.textContent = `$${nuevoCosto.toLocaleString('es-CO')}`;
        
        // Limpiar el campo de nuevo costo
        nuevoCostoInput.value = '';
        
        alert('✅ Costo actualizado exitosamente');
        
        // Opcional: recargar servicios para asegurar que están actualizados
        // await cargarServicios();
        
    } catch (error) {
        console.error('Error al actualizar costo:', error);
        alert(`❌ Error al actualizar el costo: ${error.message}`);
    }
}