document.addEventListener('DOMContentLoaded', function() {
    const agregarBtn = document.querySelector('.btn-primary'); // Botón "AGREGAR"
    const cancelarBtn = document.querySelector('.btn-warning'); // Botón "CANCELAR"

    // Función para guardar en localStorage
    function guardarPrestamo() {
        const nuevoPrestamo = {
            id: Date.now(),
            codigo_referencia: document.getElementById('codigo_libro').value,
            titulo: document.getElementById('titulo').value,
            fecha_prestamo: document.getElementById('fecha_prestamo').value,
            fecha_devolucion: document.getElementById('fecha_devolucion').value,
            datos_libro: document.getElementById('datos_libro').value,
            nombre: document.getElementById('nombre').value,
            datos: document.getElementById('datos').value,
            estado: document.getElementById('estado').value
        };

        let prestamos = JSON.parse(localStorage.getItem('prestamos')) || [];
        prestamos.push(nuevoPrestamo);
        localStorage.setItem('prestamos', JSON.stringify(prestamos));
        
        alert('¡Préstamo agregado!');
        window.location.href = 'Prestamos.html'; // Redirección
    }

    // Evento para el botón "AGREGAR"
    agregarBtn.addEventListener('click', function() {
        // Validar campos requeridos
        const camposRequeridos = document.querySelectorAll('[required]');
        let valido = true;

        camposRequeridos.forEach(campo => {
            if (!campo.value.trim()) {
                campo.classList.add('is-invalid');
                valido = false;
            }
        });

        if (valido) {
            guardarPrestamo();
        } else {
            alert('Por favor, complete todos los campos requeridos.');
        }
    });

    // Evento para el botón "CANCELAR"
    cancelarBtn.addEventListener('click', function() {
        window.location.href = 'Prestamos.html';
    });
});