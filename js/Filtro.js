const api_local = "https://localhost:7206/api";
const api_prod = "https://api.dataminerd.manatech.do/api";
const API_BASE_URL = api_local; // Cambia a api_prod en producción
const RESOURCE = "DataMinerd";
const API_URL = `${API_BASE_URL}/${RESOURCE}`;

let allData = [];
let dataTable = null;

// 1) Traer datos del API
async function fetchData() {
  const res = await fetch(API_URL);
  if (!res.ok)
    throw new Error(`Error en la petición: ${res.status} ${res.statusText}`);
  const json = await res.json();
  return Array.isArray(json) ? json : [json];
}

// 2) Helper case‐insensitive
function getField(obj, fieldName) {
  if (obj[fieldName] !== undefined) return obj[fieldName];
  const found = Object.keys(obj).find(
    (k) => k.toLowerCase() === fieldName.toLowerCase()
  );
  return found ? obj[found] : "";
}

// 3) Rellenar la tabla
function fillTable(data) {
  const tbody = document.querySelector("#export-table tbody");
  tbody.innerHTML = "";

  //un log para ver el número de registros y th
  const thCount = document.querySelectorAll("#export-table thead th").length;
  console.log(`fillTable: registros=${data.length}, thCount=${thCount}`);

  if (data.length === 0) {
    console.log("🍂 Rama NO-REGISTROS: generando 1 <td> con colspan");
    //generar 8 td auqnue no haya datos para que datatables no falle
    // y no se vea un error de "No hay registros"
    const thCount = document.querySelectorAll("#export-table thead th").length;
    let emptyRow = "<tr>";
    for (let i = 0; i < thCount; i++) {
      emptyRow +=
        i === 0
          ? `<td class="px-6 py-4 text-center text-gray-500">No hay registros</td>`
          : "<td></td>";
    }
    emptyRow += "</tr>";
    tbody.innerHTML = emptyRow;
    return;
  }

  data.forEach((item) => {
    const tr = document.createElement("tr");
    tr.classList.add("bg-white", "border-b", "hover:bg-gray-50");

    const site = getField(item, "Site");
    const circuito = getField(item, "Circuito");
    const nombreEscuela = getField(item, "Nombre_Escuela");
    const wanIp = getField(item, "WAN_IP");
    const nombreContacto = getField(item, "Nombre_Contacto");
    const telefonoContacto = getField(item, "Telefono_Contacto");
    const distrito = getField(item, "Distrito");
    // el whitespace-pre-wrap es para que el texto no quite los espacios extra
    tr.innerHTML = `
      <td class="px-6 py-4 font-medium text-gray-900">${site}</td>
      <td class="px-6 py-4">${circuito}</td>
      <td class="px-6 py-4 whitespace-pre-wrap">${nombreEscuela}</td>
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
  // 1) Verificar recuento de encabezados y columnas configuradas
  const thCount = document.querySelectorAll("#export-table thead th").length;
  const colConfigCount = 8; // aquí 8 porque tienes 7 vacíos + 1 con select en tu array columns
  console.log(`TH en thead: ${thCount}, columnas en config: ${colConfigCount}`);

  if (dataTable) {
    dataTable.destroy();
    document.querySelector("#table-controls").innerHTML = "";
  }

  dataTable = new simpleDatatables.DataTable("#export-table", {
    perPage: 10,
    searchable: false, // Deshabilitado porque ya tenemos un buscador propio
    columns: [{}, {}, {}, {}, {}, {}, {}, { select: 7, sortable: false }],
  });
}

// 5) Listeners de búsqueda y limpieza
async function setupSearchListeners() {
  const input = document.getElementById("searchInput");
  const btnS = document.getElementById("btnSearch");
  const btnC = document.getElementById("btnClear");

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

      // tras fillTable(allData);
      const thCount = document.querySelectorAll(
        "#export-table thead th"
      ).length;
      const tdCount = document.querySelectorAll(
        "#export-table tbody tr:first-child td"
      ).length;
      console.log(
        `Tras fetchAndFill: thCount=${thCount}, tdCount primeras <td>=${tdCount}`
      );

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
  input.addEventListener("keyup", (e) => {
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
