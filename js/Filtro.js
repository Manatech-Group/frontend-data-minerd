// Filtro.js

const API_URL = "https://api.dataminerd.manatech.do/api/DataMinerd";

let allData = [];
let dataTable = null;

// 1) Traer datos del API
async function fetchData() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`Error en la petición: ${res.status}`);
  const json = await res.json();
  return Array.isArray(json) ? json : [json];
}

// 2) Helper case‐insensitive
function getField(obj, fieldName) {
  if (obj[fieldName] !== undefined) return obj[fieldName];
  const foundKey = Object.keys(obj)
    .find(k => k.toLowerCase() === fieldName.toLowerCase());
  return foundKey ? obj[foundKey] : "";
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

    // Construyes las celdas y al final, la de “Editar”
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
          href="html/Edit.html?site=${encodeURIComponent(site)}" 
          class="text-blue-600 hover:underline"
        >
          Editar
        </a>
      </td>
    `;
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
    searchable: true,
    layout: { top: "#table-controls", bottom: true },
    labels: {
      placeholder: "Buscar en la tabla…",
      perPage: "{select} filas por página",
      noRows: "No se encontraron resultados",
      info: "Mostrando {start} a {end} de {rows} entradas",
    },
    columns: [
      {}, // 0: Site
      {}, // 1: Circuito
      {}, // 2: Nombre Escuela
      {}, // 3: WAN IP
      {}, // 4: Contacto
      {}, // 5: Teléfono
      {}, // 6: Distrito
      { select: 7, sortable: false } // 7: Acciones (editar)
    ]
  });
}


// 5) Listeners de búsqueda y limpieza
function setupSearchListeners() {
  const input = document.getElementById("searchInput");
  const btnS  = document.getElementById("btnSearch");
  const btnC  = document.getElementById("btnClear");

  btnS.addEventListener("click", () => {
    const term = input.value.toLowerCase().trim();
    const filtered = allData.filter(item =>
      getField(item, "Site").toLowerCase().includes(term)
    );
    fillTable(filtered);
    dataTable.update();
  });

  btnC.addEventListener("click", () => {
    input.value = "";
    fillTable(allData);
    dataTable.update();
  });

  input.addEventListener("keyup", e => {
    if (e.key === "Enter") btnS.click();
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
    alert("No se pudo cargar la información. Revisa la consola para más detalles.");
  }
});
