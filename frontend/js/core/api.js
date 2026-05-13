const API_URL = "https://script.google.com/macros/s/AKfycbyDQnlzlxwjIa1CwWSbxFeTgDcQBzqn0q4Uz-0Wd_nnTFQtjDG1Tg4fcbekRZEpLUPK/exec";

export async function api(endpoint, method = "GET", body = null) {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json"
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(`${API_URL}${endpoint}`, options);

    let data = null;

    try {
      data = await res.json();
    } catch (e) {
      data = null;
    }

    if (!res.ok) {
      throw new Error(data?.message || "Error en la petición");
    }

    return data;

  } catch (error) {
    console.error("API ERROR:", error.message);
    alert(error.message); // reemplaza cualquier toast
    throw error;
  }
}
