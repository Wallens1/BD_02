// Variables globales
let aseguradoras = [];

// Cargar aseguradoras cuando la página esté lista
document.addEventListener('DOMContentLoaded', function() {
    cargarAseguradoras();
    configurarEventos();
});

// Función para cargar aseguradoras desde la base de datos
async function cargarAseguradoras() {
    try {
        console.log('Cargando aseguradoras...');
        const response = await fetch('http://localhost:3000/aseguradoras');
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        aseguradoras = await response.json();
        console.log('Aseguradoras cargadas:', aseguradoras);
        
        llenarSelectAseguradoras();
        
    } catch (error) {
        console.error('Error al cargar aseguradoras:', error);
        alert('Error al conectar con el servidor. Verifique que esté funcionando en http://localhost:3000');
    }
}

// Función para llenar el select con las aseguradoras
function llenarSelectAseguradoras() {
    const select = document.getElementById('aseguradora');
    
    // Limpiar opciones existentes (excepto la primera)
    select.innerHTML = '<option value="">Seleccione una aseguradora...</option>';
    
    if (!Array.isArray(aseguradoras) || aseguradoras.length === 0) {
        console.log('No se encontraron aseguradoras');
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "No hay aseguradoras disponibles";
        select.appendChild(option);
        return;
    }
    
    // Agregar cada aseguradora como opción
    aseguradoras.forEach(aseguradora => {
        const option = document.createElement('option');
        option.value = aseguradora.idaseguradora;
        option.textContent = aseguradora.nombreaseguradora;
        option.dataset.beneficio = aseguradora.beneficio;
        option.dataset.descuento = aseguradora.descuento;
        select.appendChild(option);
    });
    
    console.log('Select de aseguradoras llenado correctamente');
}

// Configurar eventos
function configurarEventos() {
    const select = document.getElementById('aseguradora');
    const btnGuardar = document.getElementById('guardarCambios');
    const beneficiosInput = document.getElementById('beneficios');
    const descuentoInput = document.getElementById('descuento');
    
    // Evento para mostrar información cuando se selecciona una aseguradora
    select.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        
        if (selectedOption.value === '') {
            limpiarInformacionActual();
            limpiarFormulario();
        } else {
            mostrarInformacionActual(selectedOption);
            llenarFormulario(selectedOption);
        }
    });
    
    // Evento para guardar cambios
    btnGuardar.addEventListener('click', guardarCambios);
    
    // Validación del campo de descuento
    descuentoInput.addEventListener('input', function() {
        let valor = parseFloat(this.value);
        if (valor < 0) this.value = 0;
        if (valor > 100) this.value = 100;
    });
}

// Mostrar información actual de la aseguradora seleccionada
function mostrarInformacionActual(option) {
    document.getElementById('nombreActual').textContent = option.textContent;
    document.getElementById('beneficioActual').textContent = option.dataset.beneficio || 'No especificado';
    document.getElementById('descuentoActual').textContent = `${option.dataset.descuento || '0'}%`;
}

// Llenar formulario con datos actuales
function llenarFormulario(option) {
    document.getElementById('beneficios').value = option.dataset.beneficio || '';
    document.getElementById('descuento').value = option.dataset.descuento || '';
}

// Limpiar información actual
function limpiarInformacionActual() {
    document.getElementById('nombreActual').textContent = '-';
    document.getElementById('beneficioActual').textContent = '-';
    document.getElementById('descuentoActual').textContent = '-';
}

// Limpiar formulario
function limpiarFormulario() {
    document.getElementById('beneficios').value = '';
    document.getElementById('descuento').value = '';
}

// Función para guardar cambios
async function guardarCambios() {
    const select = document.getElementById('aseguradora');
    const beneficiosInput = document.getElementById('beneficios');
    const descuentoInput = document.getElementById('descuento');
    
    const aseguradoraId = select.value;
    const nuevoBeneficio = beneficiosInput.value.trim();
    const nuevoDescuento = parseFloat(descuentoInput.value);
    
    // Validaciones
    if (!aseguradoraId || aseguradoraId === '') {
        alert('Por favor seleccione una aseguradora');
        return;
    }
    
    if (!nuevoBeneficio) {
        alert('Por favor ingrese el beneficio');
        return;
    }
    
    if (isNaN(nuevoDescuento) || nuevoDescuento < 0 || nuevoDescuento > 100) {
        alert('Por favor ingrese un descuento válido (0-100)');
        return;
    }
    
    // Confirmar cambios
    const selectedOption = select.options[select.selectedIndex];
    const nombreAseguradora = selectedOption.textContent;
    const beneficioActual = selectedOption.dataset.beneficio;
    const descuentoActual = selectedOption.dataset.descuento;
    
    const confirmacion = confirm(
        `¿Está seguro de actualizar el convenio de "${nombreAseguradora}"?\n\n` +
        `Beneficio actual: ${beneficioActual}\n` +
        `Nuevo beneficio: ${nuevoBeneficio}\n\n` +
        `Descuento actual: ${descuentoActual}%\n` +
        `Nuevo descuento: ${nuevoDescuento}%`
    );
    
    if (!confirmacion) {
        return;
    }
    
    try {
        console.log(`Actualizando aseguradora ID: ${aseguradoraId}`);
        console.log('Nuevo beneficio:', nuevoBeneficio);
        console.log('Nuevo descuento:', nuevoDescuento);
        
        const response = await fetch(`http://localhost:3000/aseguradoras/${aseguradoraId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                beneficio: nuevoBeneficio,
                descuento: nuevoDescuento 
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error HTTP: ${response.status}`);
        }
        
        const resultado = await response.json();
        console.log('Respuesta del servidor:', resultado);
        
        // Actualizar la opción en el select
        selectedOption.dataset.beneficio = nuevoBeneficio;
        selectedOption.dataset.descuento = nuevoDescuento;
        
        // Actualizar la visualización de información actual
        mostrarInformacionActual(selectedOption);
        
        alert('✅ Convenio actualizado exitosamente');
        
        // Opcional: recargar aseguradoras para asegurar que están actualizadas
        // await cargarAseguradoras();
        
    } catch (error) {
        console.error('Error al actualizar convenio:', error);
        alert(`❌ Error al actualizar el convenio: ${error.message}`);
    }
}
