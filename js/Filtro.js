const api_local    = "https://localhost:7206/api";
const api_prod     = "https://api.dataminerd.manatech.do/api";
const API_BASE_URL = api_prod;                   // Cambia a api_prod en producción
const RESOURCE     = "dataminerd";
const API_URL      = `${API_BASE_URL}/${RESOURCE}`;

let allData = [];
let dataTable = null;

// 1) Traer datos del API
async function fetchData() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`Error en la petición: ${res.status} ${res.statusText}`);
  const json = await res.json();
  return Array.isArray(json) ? json : [json];
}

// 2) Helper case‐insensitive
function getField(obj, fieldName) {
  if (obj[fieldName] !== undefined) return obj[fieldName];
  const found = Object.keys(obj)
    .find(k => k.toLowerCase() === fieldName.toLowerCase());
  return found ? obj[found] : "";
}

// 3) Rellenar la tabla
function fillTable(data) {
  const tbody = document.querySelector("#export-table tbody");
  tbody.innerHTML = "";

  if (data.length === 0) {
    tbody.innerHTML = `
      <tr><td class="px-6 py-4 text-center text-gray-500" colspan="8">
        No hay registros
      </td></tr>`;
    return;
  }

  data.forEach(item => {
    const tr = document.createElement("tr");
    tr.classList.add("bg-white", "border-b", "hover:bg-gray-50");

    const site             = getField(item, "Site");
    const circuito         = getField(item, "Circuito");
    const nombreEscuela    = getField(item, "Nombre_Escuela");
    const wanIp            = getField(item, "WAN_IP");
    const nombreContacto   = getField(item, "Nombre_Contacto");
    const telefonoContacto = getField(item, "Telefono_Contacto");
    const distrito         = getField(item, "Distrito");

    tr.innerHTML = `
      <td class="px-6 py-4 font-medium text-gray-900">${site}</td>
      <td class="px-6 py-4">${circuito}</td>
      <td class="px-6 py-4">${nombreEscuela}</td>
      <td class="px-6 py-4">${wanIp}</td>
      <td class="px-6 py-4">${nombreContacto}</td>
      <td class="px-6 py-4">${telefonoContacto}</td>
      <td class="px-6 py-4">${distrito}</td>
      <td class="px-6 py-4">
        <a 
          href="Edit.html?site=${encodeURIComponent(site)}" 
          class="text-blue-600 hover:underline"
        >
          Editar
        </a>
      </td>`;
    tbody.appendChild(tr);
  });
}

// 4) Inicializar/reiniciar simple-datatables
function initDataTable() {
  if (dataTable) {
    dataTable.destroy();
    document.querySelector("#table-controls").innerHTML = "";
  }

  dataTable = new simpleDatatables.DataTable("#export-table", {
    perPage: 10,
    perPageSelect: [10, 25, 50, 100],
    fixedHeight: true,
    searchable: false,
    layout: { top: "#table-controls", bottom: true },
    labels: {
      placeholder: "Buscar en la tabla…",
      perPage: "{select} filas por página",
      noRows: "No se encontraron resultados",
      info: "Mostrando {start} a {end} de {rows} entradas",
    },
    columns: [
      {}, {}, {}, {}, {}, {}, {},
      { select: 7, sortable: false } // índice 7 → acciones
    ]
  });
}

// 5) Listeners de búsqueda y limpieza
async function setupSearchListeners() {
  const input = document.getElementById("searchInput");
  const btnS  = document.getElementById("btnSearch");
  const btnC  = document.getElementById("btnClear");

  async function fetchAndFill(term = "") {
    const url = term
      ? `${API_URL}/search?search=${encodeURIComponent(term)}`
      : API_URL;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      allData = Array.isArray(data) ? data : [data];

      // 1) Destruye la instancia existente y limpia controles
      dataTable.destroy();
      document.querySelector("#table-controls").innerHTML = "";

      // 2) Rellena el <tbody> con los nuevos datos
      fillTable(allData);

      // 3) Inicializa de nuevo el DataTable sobre el DOM actualizado
      initDataTable();
    } catch (err) {
      console.error("Error al buscar:", err);
      alert(`No se pudo realizar la búsqueda: ${err.message}`);
    }
  }

  btnS.addEventListener("click", () => fetchAndFill(input.value.trim()));
  btnC.addEventListener("click", () => {
    input.value = "";
    fetchAndFill();
  });
  input.addEventListener("keyup", e => {
    if (e.key === "Enter") fetchAndFill(input.value.trim());
  });
}



// 6) Arranque
document.addEventListener("DOMContentLoaded", async () => {
  try {
    allData = await fetchData();
    fillTable(allData);
    initDataTable();
    setupSearchListeners();
  } catch (err) {
    console.error("Error al inicializar la tabla:", err);
    alert(`No se pudo cargar la información: ${err.message}`);
  }
});
