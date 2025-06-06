// Edit.js
const api_local = "https://localhost:7206/api";
const api_prod = "https://api.dataminerd.manatech.do/api";
const API_BASE_URL = api_local; // Cambia a api_prod en producción
const RESOURCE = "DataMinerd";
const API_URL = `${API_BASE_URL}/${RESOURCE}`;

// buscar valor de un campo en un objeto, ignorando mayúsculas/minúsculas
function getField(obj, fieldName) {
  if (obj[fieldName] !== undefined) return obj[fieldName];

  const key = Object.keys(obj).find(
    (k) => k.toLowerCase() === fieldName.toLowerCase()
  );

  return key ? obj[key] : "";
}

// 1) Cuando carga la página
document.addEventListener("DOMContentLoaded", () => {
  // Verificamos que haya un parámetro 'site' en la URL
  const params = new URLSearchParams(window.location.search);
  const site = params.get("site");
  // Si no hay 'site', mostramos un mensaje y salimos
  if (!site) {
    alert("No se indicó ningún 'site' en la URL.");
    return;
  }

  // Rellena un campo de solo lectura (readonly) con el valor del site
  //Llama a la función loadForEdit(site) para cargar los datos existentes del registro
  document.getElementById("edit_Site").value = site;
  loadForEdit(site);

  // Al enviar el form, hacemos el PUT
  document.getElementById("editForm").addEventListener("submit", (e) => {
    e.preventDefault();
    updateRecord(site);
  });
});

// 2) Obtener los datos de un sitio específico desde una API y rellenar automáticamente los campos del formulario de edición.
async function loadForEdit(site) {
  try {
    // Hacer la petición GET al endpoint con el site
    const res = await fetch(`${API_URL}/${encodeURIComponent(site)}`);
    if (!res.ok) {
      alert(`No existe el registro para site "${site}" (HTTP ${res.status})`);
      return;
    }
    // Si la respuesta es exitosa, parsear el JSON
    const dto = await res.json();

    console.log("DTO recibido:", dto);
    // Abre la consola e imprime la respuesta para ver el objeto completo

    // Lista de campos a
    //  mapear (el sufijo del input = el nombre de la propiedad)
    const fields = [
      "Circuito",
      "Nombre_Escuela",
      "WAN_IP",
      "Latitud",
      "Longitud",
      "Long_Name",
      "Nombre_Contacto",
      "Telefono_Contacto",
      "Regional",
      "Distrito",
      "Codigo_Planta_Fisica",
      "Hostname",
      "DDNS",
      "IP_Gestion_FMG",
      "IP_Gestion_SW",
      "SiteType",
    ];

    fields.forEach((field) => {
      const input = document.getElementById(`edit_${field}`);
      if (input) {
        input.value = getField(dto, field) ?? "";
      }
    });
  } catch (err) {
    console.error("Error cargando datos:", err);
    alert(`Ocurrió un error al cargar los datos: ${err.message}`);
  }
}

// 3) Enviar actualización
async function updateBySite() {
  // 1) Leer el 'site' desde el campo readonly
  const site = document.getElementById("edit_Site").value.trim();
  if (!site) {
    alert("Primero carga un registro para editar.");
    return;
  }

  // 2) Construir el DTO como en tu función original
  const dto = {};
  [
    "Circuito",
    "Nombre_Escuela",
    "WAN_IP",
    "Latitud",
    "Longitud",
    "Long_Name",
    "Nombre_Contacto",
    "Telefono_Contacto",
    "Regional",
    "Distrito",
    "Codigo_Planta_Fisica",
    "Hostname",
    "DDNS",
    "IP_Gestion_FMG",
    "IP_Gestion_SW",
    "SiteType",
  ].forEach((field) => {
    const val = document.getElementById(`edit_${field}`).value.trim();
    dto[field] = val === "" ? null : field === "Circuito" ? Number(val) : val;
  });

  // 3) Hacer el PUT al endpoint correcto
  try {
    const res = await fetch(`${API_URL}/${encodeURIComponent(site)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`${res.status} ${res.statusText}: ${errText}`);
    }
    alert("Registro actualizado correctamente.");
    window.location.href = "app.html";
  } catch (err) {
    console.error("Error al actualizar:", err);
    alert(`No se pudo actualizar el registro: ${err.message}`);
  }
}
