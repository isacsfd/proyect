// Simulación de datos iniciales (se combinarán con localStorage)
const initialData = [
    {
        id: 1,
        codigo_referencia: "LIB-001",
        titulo: "Introducción a JavaScript",
        fecha_prestamo: "2023-10-15",
        fecha_devolucion: "2023-11-15",
        datos_libro: "Disponible",
        nombre: "Juan Pérez",
        datos: "Estudiante - Ingeniería",
        estado: "Activo"
    }
];

// Obtener datos guardados o usar los iniciales
let prestamosData = JSON.parse(localStorage.getItem('prestamos')) || initialData;

// Renderizar la tabla
function renderTable(data) {
    const tbody = document.querySelector('tbody');
    tbody.innerHTML = '';

    data.forEach(prestamo => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <th scope="row">${prestamo.id}</th>
            <td>${prestamo.codigo_referencia}</td>
            <td>${prestamo.titulo}</td>
            <td>${prestamo.fecha_prestamo}</td>
            <td>${prestamo.fecha_devolucion}</td>
            <td>${prestamo.datos_libro}</td>
            <td>${prestamo.nombre}</td>
            <td>${prestamo.datos}</td>
            <td><span class="badge ${getEstadoClass(prestamo.estado)}">${prestamo.estado}</span></td>
        `;
        tbody.appendChild(row);
    });
}

// Clase CSS para el estado
function getEstadoClass(estado) {
    const estados = {
        'Activo': 'bg-success',
        'Vencido': 'bg-danger',
        'Pendiente': 'bg-warning',
        'Disponible': 'bg-primary',
        'Prestado': 'bg-secondary',
        'Reservado': 'bg-info'
    };
    return estados[estado] || 'bg-secondary';
}

// Búsqueda en tiempo real
function setupSearch() {
    const searchInput = document.querySelector('.form-control[type="text"]');
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = prestamosData.filter(item => 
            item.titulo.toLowerCase().includes(term) || 
            item.nombre.toLowerCase().includes(term) ||
            item.codigo_referencia.toLowerCase().includes(term)
        );
        renderTable(filtered);
    });
}

// Filtros por fecha y categoría
function setupFilters() {
    const filterBtn = document.querySelector('.bi-funnel').closest('button');
    
    filterBtn.addEventListener('click', () => {
        const fecha = document.getElementById('fecha').value;
        const categoria = document.querySelector('.form-select').value;
        
        let filtered = prestamosData;
        
        if (fecha) {
            filtered = filtered.filter(item => item.fecha_prestamo === fecha);
        }
        
        if (categoria) {
            filtered = filtered.filter(item => item.datos.includes(categoria));
        }
        
        renderTable(filtered);
    });
}

// Botones de acción
function setupActionButtons() {
    // Editar
    document.querySelector('.bi-pencil-square').closest('button').addEventListener('click', () => {
        alert('Seleccione un registro para editar (implementar lógica de selección).');
    });
    
    // Eliminar
    document.querySelector('.bi-trash3').closest('button').addEventListener('click', () => {
        if (confirm('¿Eliminar el registro seleccionado?')) {
            alert('Registro eliminado (lógica real requerirá conexión al backend).');
        }
    });
}

// Inicialización
function init() {
    renderTable(prestamosData);
    setupSearch();
    setupFilters();
    setupActionButtons();
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('storage', function() {
    prestamosData = JSON.parse(localStorage.getItem('prestamos')) || [];
    renderTable(prestamosData);
});