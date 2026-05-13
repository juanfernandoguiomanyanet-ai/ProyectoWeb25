const API_URL = 'https://script.google.com/macros/s/AKfycbyfdj5fBNX8mhpx-ZFYbZ0-EGdGm6oaSVX6BsBmX-tnfdZgiPtbLEbZND09Q03l9C3q/exec';

// Función interna para manejar el estado visual
function toggleLoader(show) {
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.style.display = show ? 'flex' : 'none';
    }
}

async function apiGet(resource) {
    toggleLoader(true);
    try {
        const response = await fetch(`${API_URL}?action=read&sheet=${resource}`);
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Error en apiGet:", error);
        return [];
    } finally {
        toggleLoader(false);
    }
}

async function apiPost(resource, data) {
    toggleLoader(true);
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
                action: 'write',
                sheet: resource,
                data: data
            })
        });
        return await response.json();
    } catch (error) {
        console.error("Error en apiPost:", error);
        throw error;
    } finally {
        toggleLoader(false);
    }
}