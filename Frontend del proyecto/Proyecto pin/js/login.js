document.addEventListener('DOMContentLoaded', function() {
    // Elementos del formulario
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const cancelBtn = document.querySelector('.c');
    const acceptBtn = document.querySelector('.acp');
    const loginForm = document.querySelector('form');

    // URL base de la API (ajusta según tu configuración)
    const API_BASE_URL = 'http://localhost:8000';
    
    // Manejar el evento de cancelar
    cancelBtn.addEventListener('click', function() {
        // Limpiar el formulario
        loginForm.reset();
    });

    // Manejar el evento de aceptar/iniciar sesión
    acceptBtn.addEventListener('click', async function() {
        // Validar campos
        if (!validateForm()) {
            return;
        }

        // Mostrar indicador de carga
        acceptBtn.disabled = true;
        acceptBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Cargando...';

        try {
            // Crear objeto con los datos del login
            const loginData = {
                email: emailInput.value.trim(),
                password: passwordInput.value
            };

            // Realizar la petición a la API
            const response = await fetch(`${API_BASE_URL}/login/usuario`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            const data = await response.json();

            if (!response.ok) {
                // Mostrar error de autenticación
                throw new Error(data.detail || 'Error al iniciar sesión');
            }

            // Login exitoso - guardar token y redirigir
            handleSuccessfulLogin(data);

        } catch (error) {
            // Mostrar mensaje de error
            showAlert('error', error.message);
        } finally {
            // Restaurar botón
            acceptBtn.disabled = false;
            acceptBtn.textContent = 'ACEPTAR';
        }
    });

    // Función para validar el formulario
    function validateForm() {
        // Validar email
        if (!emailInput.value.trim()) {
            showAlert('error', 'Por favor ingrese su correo electrónico');
            emailInput.focus();
            return false;
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
            showAlert('error', 'Por favor ingrese un correo electrónico válido');
            emailInput.focus();
            return false;
        }

        // Validar contraseña
        if (!passwordInput.value) {
            showAlert('error', 'Por favor ingrese su contraseña');
            passwordInput.focus();
            return false;
        }

        return true;
    }

    // Función para manejar login exitoso
    function handleSuccessfulLogin(data) {
        // Guardar token y datos de usuario en localStorage
        localStorage.setItem('authToken', data.access_token);
        localStorage.setItem('userData', JSON.stringify(data.user));

        // Mostrar mensaje de éxito
        showAlert('success', 'Inicio de sesión exitoso. Redirigiendo...');

        // Redirigir según el rol del usuario después de 2 segundos
        setTimeout(() => {
            // Verificar el rol del usuario (1 = admin, otros = usuario normal)
            if (data.user.role_id === 1) {
                window.location.href = '../Interfaces de usuario/inicio.html';
            } else {
                window.location.href = 'user-dashboard.html';
            }
        }, 2000);
    }

    // Función para mostrar alertas
    function showAlert(type, message) {
        // Eliminar alertas anteriores
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        // Crear elemento de alerta
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show mt-3`;
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        // Insertar después del formulario
        loginForm.appendChild(alertDiv);

        // Cerrar automáticamente después de 5 segundos
        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 150);
        }, 5000);
    }

    // Permitir enviar el formulario con Enter
    loginForm.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            acceptBtn.click();
        }
    });
});