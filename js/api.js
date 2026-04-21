const API_URL = 'https://script.google.com/macros/s/AKfycbyfdj5fBNX8mhpx-ZFYbZ0-EGdGm6oaSVX6BsBmX-tnfdZgiPtbLEbZND09Q03l9C3q/exec';

async function apiGet(resource) {
  // Cambiamos a 'sheet' para que tu Google Script lo entienda
  const response = await fetch(`${API_URL}?action=read&sheet=${resource}`);
  const data = await response.json();
  // Tu script devuelve un Array directo, si hay error devuelve el objeto de error
  return Array.isArray(data) ? data : [];
}

async function apiPost(resource, data) {
  const response = await fetch(API_URL, {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Evita el error de CORS
    body: JSON.stringify({
      action: 'write',
      sheet: resource,
      data: data
    })
  });
  return await response.json();
}