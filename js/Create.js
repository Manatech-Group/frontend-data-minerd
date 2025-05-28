const api_local     = "https://localhost:7206/api";
const api_prod      = "https://api.dataminerd.manatech.do/api";
const API_BASE_URL  = api_prod;  // Cambia a api_prod en producción
const RESOURCE      = "dataminerd";
const API_URL       = `${API_BASE_URL}/${RESOURCE}`;

let devices = [];
let selectedSerialNumber = null;

const allowedSiteTypes = [
  "ENTREGADO_MINERD", "DEVOLUCION",
  "Brigada_1", "Brigada_2", "Brigada_3", "Brigada_4", "Brigada_5", "Brigada_6",
  "Manatech_PUJ", "Manatech_STI", "Manatech_SDQ",
  "Fortinet", "Hybrid"
];

// 1) Carga de dispositivos desde el API
async function loadDevices() {
  try {
    const res  = await fetch(`${API_BASE_URL}/device`);
    if (!res.ok) throw new Error(`Error ${res.status} ${res.statusText}`);
    const json = await res.json();
    devices = Array.isArray(json) ? json : [json];
  } catch (err) {
    console.error("Error cargando dispositivos:", err);
    alert(`No se pudieron cargar los dispositivos: ${err.message}`);
  }
}

// 2) Setup de autocompletar para Fortigate (igual que antes)
function setupDeviceAutocomplete() {
  const input       = document.getElementById("deviceSearch");
  const suggestions = document.getElementById("suggestionsList");

  input.addEventListener("input", () => {
    const term = input.value.trim().toLowerCase();
    suggestions.innerHTML = "";
    selectedSerialNumber = null;

    if (!term) {
      suggestions.classList.add("hidden");
      return;
    }

    const matches = devices
      .filter(d =>
        d.serialNumber.toLowerCase().includes(term) ||
        d.siteName.toLowerCase().includes(term)
      )
      .slice(0, 10);

    if (!matches.length) {
      suggestions.classList.add("hidden");
      return;
    }

    matches.forEach(device => {
      const li = document.createElement("li");
      li.className = "px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm";
      li.textContent = `${device.serialNumber} — ${device.siteName}`;
      li.dataset.serial = device.serialNumber;
      li.addEventListener("click", () => {
        input.value = device.serialNumber;
        selectedSerialNumber = device.serialNumber;
        suggestions.classList.add("hidden");
      });
      suggestions.appendChild(li);
    });

    suggestions.classList.remove("hidden");
  });

  document.addEventListener("click", e => {
    if (!input.contains(e.target) && !suggestions.contains(e.target)) {
      suggestions.classList.add("hidden");
    }
  });
}

// 3) Envía el formulario para crear un registro
async function createRecord() {
  const getVal = id => document.getElementById(id).value.trim();

  // 3.1) Validar campo Site
  const site = getVal("create_Site");
  if (!site) {
    alert("El campo Site es obligatorio.");
    return;
  }

  // 3.2) Comprobar que no exista ya en BD
  try {
    const check = await fetch(`${API_URL}/${encodeURIComponent(site)}`);
    if (check.ok) {
      alert(`El Site "${site}" ya existe. Elige otro.`);
      return;
    }
    if (check.status !== 404) {
      const errText = await check.text();
      throw new Error(`HTTP ${check.status} — ${errText}`);
    }
    // status 404: no existe, seguimos
  } catch (err) {
    console.error("Error al validar Site:", err);
    alert(`No se pudo validar el Site: ${err.message}`);
    return;
  }

  // 3.3) Construir el payload
  const payload = {
    Site: site,
    Circuito: (() => {
      const n = parseInt(getVal("create_Circuito"), 10);
      return isNaN(n) ? null : n;
    })(),
    Nombre_Escuela: getVal("create_Nombre_Escuela"),
    WAN_IP: getVal("create_WAN_IP"),
    Latitud: getVal("create_Latitud"),
    Longitud: getVal("create_Longitud"),
    Long_Name: getVal("create_Long_Name"),
    Nombre_Contacto: getVal("create_Nombre_Contacto"),
    Telefono_Contacto: getVal("create_Telefono_Contacto"),
    Regional: getVal("create_Regional"),
    Distrito: getVal("create_Distrito"),
    Codigo_Planta_Fisica: getVal("create_Codigo_Planta_Fisica"),
    Hostname: getVal("create_Hostname"),
    DDNS: getVal("create_DDNS"),
    IP_Gestion_FMG: getVal("create_IP_Gestion_FMG"),
    IP_Gestion_SW: getVal("create_IP_Gestion_SW"),
    SiteType: getVal("create_SiteType"),
    Fortigate: selectedSerialNumber
  };

  // 3.4) Validaciones de campos obligatorios
  const required = ["Site", "WAN_IP", "Nombre_Escuela", "Long_Name", "SiteType"];
  for (const f of required) {
    if (!payload[f]) {
      alert(`El campo "${f}" es obligatorio.`);
      return;
    }
  }
  if (!allowedSiteTypes.includes(payload.SiteType)) {
    alert(`"SiteType" inválido. Debe ser: ${allowedSiteTypes.join(", ")}`);
    return;
  }
  if (!payload.Fortigate) {
    alert("Selecciona un Fortigate de la lista.");
    return;
  }

  // 3.5) Envío POST con manejo completo del body de error
  try {
    const res = await fetch(API_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload)
    });

    if (!res.ok) {
      const ct = res.headers.get("content-type") || "";
      let errorBody;
      if (ct.includes("application/json")) {
        errorBody = JSON.stringify(await res.json(), null, 2);
      } else {
        errorBody = await res.text();
      }
      console.error("[create] server error:", res.status, errorBody);
      alert(`Error al crear el sitio (HTTP ${res.status}):\n${errorBody}`);
      return;
    }

    alert("Sitio creado correctamente.");
    document.getElementById("createForm").reset();
    selectedSerialNumber = null;

  } catch (err) {
    console.error("[create] excepción:", err);
    alert(`Excepción al crear el sitio: ${err.message}`);
  }
}

// 4) Arranque al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
  await loadDevices();
  setupDeviceAutocomplete();

  const form = document.getElementById("createForm");
  // Quita cualquier handler inline y usa sólo este listener
  form.removeAttribute("onsubmit");
  form.addEventListener("submit", async e => {
    e.preventDefault();
    await createRecord();
  });
});
