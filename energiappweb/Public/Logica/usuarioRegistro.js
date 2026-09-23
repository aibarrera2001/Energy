function verificarContrasena() {
  const contrasena = document.getElementById('contrasena').value;

  const minimo8 = contrasena.length >= 8;
  const tieneMayuscula = /[A-Z]/.test(contrasena);
  const tieneMinuscula = /[a-z]/.test(contrasena);
  const tieneNumero = /[0-9]/.test(contrasena);

  actualizarRequisito('req-length', minimo8);
  actualizarRequisito('req-upper', tieneMayuscula);
  actualizarRequisito('req-lower', tieneMinuscula);
  actualizarRequisito('req-number', tieneNumero);
}

function actualizarRequisito(id, cumplido) {
  const elemento = document.getElementById(id);
  if (!elemento) return;

  if (cumplido) {
    elemento.classList.remove('unmet');
    elemento.classList.add('met');
    elemento.querySelector('.check-icon').textContent = '✓';
  } else {
    elemento.classList.remove('met');
    elemento.classList.add('unmet');
    elemento.querySelector('.check-icon').textContent = '○';
  }
}

function mostrarError(mensaje) {
  const errorDiv = document.getElementById('errorMessage');
  const successDiv = document.getElementById('successMessage');

  if (mensaje) {
    errorDiv.textContent = mensaje;
    errorDiv.classList.add('show');
    successDiv.classList.remove('show');
  } else {
    errorDiv.classList.remove('show');
  }
}

function mostrarExito(mensaje) {
  const successDiv = document.getElementById('successMessage');
  const errorDiv = document.getElementById('errorMessage');

  successDiv.textContent = mensaje;
  successDiv.classList.add('show');
  errorDiv.classList.remove('show');
}

async function parseJsonSeguro(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return {
      exito: false,
      mensaje: text || 'Error de conexión con el servidor'
    };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registroForm');
  if (!form) return;

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const ciudad = document.getElementById('ciudad').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const contrasena = document.getElementById('contrasena').value;
    const contrasenaConf = document.getElementById('contrasenaConf').value;

    if (!nombre || !apellido || !correo || !ciudad || !contrasena) {
      mostrarError('Por favor completa todos los campos obligatorios');
      return;
    }

    if (contrasena !== contrasenaConf) {
      mostrarError('Las contraseñas no coinciden');
      return;
    }

    if (contrasena.length < 8) {
      mostrarError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (!/[A-Z]/.test(contrasena)) {
      mostrarError('La contraseña debe contener una mayúscula');
      return;
    }

    if (!/[a-z]/.test(contrasena)) {
      mostrarError('La contraseña debe contener una minúscula');
      return;
    }

    if (!/[0-9]/.test(contrasena)) {
      mostrarError('La contraseña debe contener un número');
      return;
    }

    const datosRegistro = {
      nombre,
      apellido,
      correo,
      ciudad,
      telefono,
      contrasena
    };

    try {
      const response = await fetch('/api/usuarios/registrar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosRegistro)
      });

      const data = await parseJsonSeguro(response);

      if (!response.ok || !data.exito) {
        throw new Error(data.mensaje || 'No se pudo registrar el usuario');
      }

      mostrarExito('✓ Cuenta creada exitosamente. Serás redirigido...');

      setTimeout(() => {
        window.location.href = '/usuario-login';
      }, 1500);
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      mostrarError(error.message || 'Error de conexión con el servidor');
    }
  });
});
