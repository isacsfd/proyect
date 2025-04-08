// Función principal que se ejecuta cuando el DOM está cargado
document.addEventListener('DOMContentLoaded', function() {
    // 1. Búsqueda en tiempo real
    setupSearch();
    
    // 2. Filtrado combinado
    setupFilters();
    
    // 3. Validación de formularios
    setupFormValidation();
    
    // 4. Funcionalidad CRUD
    setupCRUD();
    
    // 5. Paginación
    setupPagination();
    
    // 6. Ordenamiento por columnas
    setupColumnSorting();
    
    // 7. Carga dinámica de datos (simulada)
    loadBooks();
    
    // 8. Exportación a CSV
    setupExport();
});

// ==================== FUNCIONES DE BÚSQUEDA ====================
function setupSearch() {
    const searchInput = document.querySelector('input[placeholder="Buscar registro"]');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('tbody tr');
            
            rows.forEach(row => {
                const rowText = row.textContent.toLowerCase();
                row.style.display = rowText.includes(searchTerm) ? '' : 'none';
            });
            
            // Actualizar paginación después de buscar
            if (document.querySelector('.pagination')) {
                setupPagination();
            }
        });
    }
}

// ==================== FUNCIONES DE FILTRADO ====================
function setupFilters() {
    const filterElements = document.querySelectorAll('.form-select, .btn[class*="acp"]');
    filterElements.forEach(element => {
        element.addEventListener('change', applyFilters);
    });
}

function applyFilters() {
    const categoria = document.getElementById('categorias').value.toLowerCase();
    const autor = document.getElementById('autores').value.toLowerCase();
    const anio = document.getElementById('anio').value;
    const tipo = document.getElementById('tipo').value.toLowerCase();
    
    document.querySelectorAll('tbody tr').forEach(row => {
        const rowData = {
            categoria: row.cells[1].textContent.toLowerCase(), // Ajustar índices según tu estructura real
            autor: row.cells[2].textContent.toLowerCase(),
            anio: row.cells[7].textContent,
            tipo: row.cells[9].textContent.toLowerCase()
        };
        
        const matchesCategoria = !categoria || rowData.categoria.includes(categoria);
        const matchesAutor = !autor || rowData.autor.includes(autor);
        const matchesAnio = !anio || rowData.anio === anio;
        const matchesTipo = !tipo || rowData.tipo.includes(tipo);
        
        row.style.display = (matchesCategoria && matchesAutor && matchesAnio && matchesTipo) ? '' : 'none';
    });
    
    // Actualizar paginación después de filtrar
    if (document.querySelector('.pagination')) {
        setupPagination();
    }
}

// ==================== VALIDACIÓN DE FORMULARIOS ====================
function setupFormValidation() {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(e) {
            const searchInput = document.querySelector('input[placeholder="Buscar registro"]');
            if (searchInput && searchInput.value.trim() === '') {
                e.preventDefault();
                showAlert('Por favor ingrese un término de búsqueda', 'warning');
                searchInput.focus();
            }
        });
    }
}

// ==================== FUNCIONALIDAD CRUD ====================
function setupCRUD() {
    document.addEventListener('click', function(e) {
        // Eliminar registro
        if (e.target.classList.contains('bi-trash3')) {
            deleteRow(e.target);
        }
        
        // Editar registro
        if (e.target.classList.contains('bi-pencil-square')) {
            enableEditMode(e.target);
        }
        // Guardar cambios
        else if (e.target.classList.contains('bi-check')) {
            saveChanges(e.target);
        }
    });
}

function deleteRow(deleteButton) {
    if (confirm('¿Está seguro de eliminar este registro?')) {
        const row = deleteButton.closest('tr');
        // Aquí podrías añadir AJAX para eliminar en el servidor
        // fetch(`/api/libros/${row.cells[0].textContent}`, { method: 'DELETE' })
        //     .then(response => {
        //         if (response.ok) row.remove();
        //     });
        
        row.remove();
        showAlert('Registro eliminado correctamente', 'success');
        
        // Actualizar paginación después de eliminar
        if (document.querySelector('.pagination')) {
            setupPagination();
        }
    }
}

function enableEditMode(editButton) {
    const row = editButton.closest('tr');
    const cells = row.querySelectorAll('td:not(:last-child)'); // Excluir columna de acciones
    
    cells.forEach(cell => {
        if (!cell.querySelector('input')) {
            const currentText = cell.textContent;
            cell.innerHTML = `<input type="text" value="${currentText}" class="form-control form-control-sm">`;
        }
    });
    
    // Cambiar ícono de edición a guardar
    editButton.classList.remove('bi-pencil-square');
    editButton.classList.add('bi-check');
}

function saveChanges(saveButton) {
    const row = saveButton.closest('tr');
    const cells = row.querySelectorAll('td:not(:last-child)');
    const rowId = row.cells[0].textContent;
    const updatedData = {};
    
    cells.forEach((cell, index) => {
        if (cell.querySelector('input')) {
            const newValue = cell.querySelector('input').value;
            cell.textContent = newValue;
            
            // Guardar datos para posible envío al servidor
            const columnName = document.querySelector(`th:nth-child(${index + 2})`).textContent.toLowerCase();
            updatedData[columnName] = newValue;
        }
    });
    
    // Cambiar ícono de guardar a editar
    saveButton.classList.remove('bi-check');
    saveButton.classList.add('bi-pencil-square');
    
    // Aquí podrías añadir AJAX para guardar en el servidor
    // fetch(`/api/libros/${rowId}`, {
    //     method: 'PUT',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(updatedData)
    // }).then(response => {
    //     if (response.ok) showAlert('Cambios guardados correctamente', 'success');
    // });
    
    showAlert('Cambios guardados correctamente', 'success');
}

// ==================== PAGINACIÓN ====================
function setupPagination() {
    // Limpiar paginación existente
    const existingPagination = document.querySelector('.pagination');
    if (existingPagination) existingPagination.remove();
    
    const rows = Array.from(document.querySelectorAll('tbody tr')).filter(row => 
        row.style.display !== 'none'
    );
    
    if (rows.length <= 5) {
        // Mostrar todas las filas si hay pocas
        rows.forEach(row => row.style.display = '');
        return;
    }
    
    const pageCount = Math.ceil(rows.length / 5);
    const pagination = document.createElement('div');
    pagination.className = 'pagination justify-content-center mt-3';
    
    for (let i = 1; i <= pageCount; i++) {
        const pageLink = document.createElement('button');
        pageLink.className = 'btn btn-sm mx-1';
        if (i === 1) pageLink.classList.add('btn-primary');
        pageLink.textContent = i;
        pageLink.addEventListener('click', () => showPage(i, rows));
        pagination.appendChild(pageLink);
    }
    
    document.querySelector('.table-responsive').appendChild(pagination);
    showPage(1, rows);
}

function showPage(page, rows) {
    const start = (page - 1) * 5;
    const end = start + 5;
    
    rows.forEach((row, index) => {
        row.style.display = (index >= start && index < end) ? '' : 'none';
    });
    
    // Resaltar botón de página activa
    document.querySelectorAll('.pagination button').forEach(btn => {
        btn.classList.toggle('btn-primary', parseInt(btn.textContent) === page);
    });
}

// ==================== ORDENAMIENTO POR COLUMNAS ====================
function setupColumnSorting() {
    document.querySelectorAll('th[scope="col"]').forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', function() {
            const columnIndex = this.cellIndex;
            const isNumericColumn = ['id', 'año'].includes(this.textContent.toLowerCase());
            const table = this.closest('table');
            const rows = Array.from(table.querySelectorAll('tbody tr')).filter(row => 
                row.style.display !== 'none'
            );
            
            // Resetear indicadores de orden en todas las columnas
            document.querySelectorAll('th[scope="col"]').forEach(h => {
                h.classList.remove('asc', 'desc');
            });
            
            // Determinar dirección de orden
            let isAscending;
            if (this.classList.contains('asc')) {
                this.classList.remove('asc');
                this.classList.add('desc');
                isAscending = false;
            } else if (this.classList.contains('desc')) {
                this.classList.remove('desc');
                isAscending = null; // Volver al orden original
            } else {
                this.classList.add('asc');
                isAscending = true;
            }
            
            if (isAscending !== null) {
                rows.sort((a, b) => {
                    const aText = a.cells[columnIndex].textContent.trim();
                    const bText = b.cells[columnIndex].textContent.trim();
                    
                    if (isNumericColumn) {
                        return isAscending 
                            ? (parseInt(aText) || 0) - (parseInt(bText) || 0)
                            : (parseInt(bText) || 0) - (parseInt(aText) || 0);
                    } else {
                        return isAscending 
                            ? aText.localeCompare(bText)
                            : bText.localeCompare(aText);
                    }
                });
            } else {
                // Restaurar orden original (simulado aquí, en realidad deberías guardar el orden original)
                rows.sort((a, b) => parseInt(a.cells[0].textContent) - parseInt(b.cells[0].textContent));
            }
            
            const tbody = table.querySelector('tbody');
            rows.forEach(row => tbody.appendChild(row));
            
            // Actualizar paginación manteniendo la página actual
            if (document.querySelector('.pagination')) {
                const activePage = document.querySelector('.pagination button.btn-primary');
                if (activePage) showPage(parseInt(activePage.textContent), rows);
            }
        });
    });
}

// ==================== CARGA DINÁMICA DE DATOS ====================
function loadBooks() {
    // En un caso real, esto sería una llamada AJAX a tu backend
    // fetch('/api/libros')
    //     .then(response => response.json())
    //     .then(data => populateTable(data));
    
    // Simulación de datos
    const mockData = [
        { id: 1, autor: "Miguel Pombo", titulo: "Redes Avanzadas", item: "IT-001", signatura: "SIG-001", ejemplar: "E-001", editorial: "Editorial Tec", año: "2021", idioma: "Español", registro_en_linea: "Sí" },
        { id: 2, autor: "Mario Benedetti", titulo: "Poesía Completa", item: "LT-001", signatura: "SIG-002", ejemplar: "E-002", editorial: "Alfaguara", año: "2020", idioma: "Español", registro_en_linea: "No" },
        { id: 3, autor: "Isaac Newton", titulo: "Principia Mathematica", item: "CI-001", signatura: "SIG-003", ejemplar: "E-003", editorial: "University Press", año: "1687", idioma: "Latín", registro_en_linea: "Sí" },
        // Agrega más datos mock según necesites
    ];
    
    populateTable(mockData);
}

function populateTable(books) {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <th scope="row">${book.id}</th>
            <td>${book.autor}</td>
            <td>${book.titulo}</td>
            <td>${book.item}</td>
            <td>${book.signatura}</td>
            <td>${book.ejemplar}</td>
            <td>${book.editorial}</td>
            <td>${book.año}</td>
            <td>${book.idioma}</td>
            <td>${book.registro_en_linea}</td>
            <td>
                <button class="btn acp text-white ms-2" style="height: 38px;"><i class="bi bi-pencil-square"></i></button>
                <button class="btn acp text-white ms-2" style="height: 38px;"><i class="bi bi-trash3"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Configurar paginación con los nuevos datos
    setupPagination();
}

// ==================== EXPORTACIÓN A CSV ====================
function setupExport() {
    // Agregar botón de exportación si no existe
    if (!document.getElementById('exportBtn')) {
        const exportBtn = document.createElement('button');
        exportBtn.id = 'exportBtn';
        exportBtn.className = 'btn acp text-white ms-2';
        exportBtn.style.height = '38px';
        exportBtn.innerHTML = '<i class="bi bi-download"></i> Exportar';
        exportBtn.addEventListener('click', exportToCSV);
        
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
            searchContainer.appendChild(exportBtn);
        }
    }
}

function exportToCSV() {
    const rows = document.querySelectorAll('tbody tr');
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Encabezados
    const headers = Array.from(document.querySelectorAll('thead th')).map(th => th.textContent);
    csvContent += headers.join(",") + "\n";
    
    // Datos
    rows.forEach(row => {
        if (row.style.display !== 'none') {
            const rowData = Array.from(row.cells).map(cell => `"${cell.textContent.replace(/"/g, '""')}"`);
            csvContent += rowData.join(",") + "\n";
        }
    });
    
    // Descargar
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "libros.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showAlert('Exportación completada', 'success');
}

// ==================== FUNCIONES AUXILIARES ====================
function showAlert(message, type) {
    // Eliminar alertas existentes
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) existingAlert.remove();
    
    const alert = document.createElement('div');
    alert.className = `custom-alert alert alert-${type} fixed-top w-50 mx-auto mt-5 text-center`;
    alert.style.zIndex = '2000';
    alert.textContent = message;
    
    document.body.appendChild(alert);
    
    // Auto-ocultar después de 3 segundos
    setTimeout(() => {
        alert.remove();
    }, 3000);
}