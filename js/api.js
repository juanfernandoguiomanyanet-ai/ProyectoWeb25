const API_URL = 'https://script.google.com/macros/s/AKfycbyfdj5fBNX8mhpx-ZFYbZ0-EGdGm6oaSVX6BsBmX-tnfdZgiPtbLEbZND09Q03l9C3q/exec';

/**
 * GET — obtiene todos los registros de una hoja
 */
async function apiGet(resource) {
  // Cambié "resource" por "sheet" y agregué "action=read" para que coincida con tu App Script
  const response = await fetch(`${API_URL}?action=read&sheet=${resource}`);
  return await response.json(); 
}

/**
 * POST — guarda o edita un registro
 */
async function apiPost(resource, data) {
  const response = await fetch(API_URL, {
    method: 'POST',
    mode: 'cors', // Forzamos modo cors
    headers: { 
      // Usar text/plain evita el error de "Preflight" (CORS) de la imagen que pasaste
      'Content-Type': 'text/plain;charset=utf-8' 
    },
    body: JSON.stringify({
      action: 'write', // Agregamos la acción que espera tu App Script
      sheet: resource,
      data: data
    })
  });
  return await response.json();
}
