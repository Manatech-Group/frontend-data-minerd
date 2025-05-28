const API_BASE_URL = "https://localhost:7206/api";

let devices = [];
let selectedSerialNumber = null;

const allowedSiteTypes = [
  "ENTREGADO_MINERD", "DEVOLUCION",
  "Brigada_1", "Brigada_2", "Brigada_3", "Brigada_4", "Brigada_5", "Brigada_6",
  "Manatech_PUJ", "Manatech_STI", "Manatech_SDQ",
  "Fortinet", "Hybrid"
];

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/device`);
    devices = await res.json();
  } catch (err) {
    console.error("Error cargando dispositivos:", err);
  }

  const input = document.getElementById("deviceSearch");
  const suggestions = document.getElementById("suggestionsList");

  input.addEventListener("input", () => {
    const value = input.value.toLowerCase();
    suggestions.innerHTML = "";

    if (!value) {
      suggestions.classList.add("hidden");
      return;
    }

    const filtered = devices.filter(d =>
      d.serialNumber.toLowerCase().includes(value) ||
      d.siteName.toLowerCase().includes(value)
    ).slice(0, 10);

    if (filtered.length === 0) {
      suggestions.classList.add("hidden");
      return;
    }

    filtered.forEach(device => {
      const li = document.createElement("li");
      li.className = "px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm";
      li.textContent = `${device.serialNumber} - ${device.siteName}`;
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

  document.addEventListener("click", (e) => {
    if (!input.contains(e.target) && !suggestions.contains(e.target)) {
      suggestions.classList.add("hidden");
    }
  });
});

async function createRecord() {
  const payload = {
    Site: document.getElementById("create_Site").value.trim(),
    Circuito: parseInt(document.getElementById("create_Circuito").value) || null,
    Nombre_Escuela: document.getElementById("create_Nombre_Escuela").value.trim(),
    WAN_IP: document.getElementById("create_WAN_IP").value.trim(),
    Latitud: document.getElementById("create_Latitud").value.trim(),
    Longitud: document.getElementById("create_Longitud").value.trim(),
    Long_Name: document.getElementById("create_Long_Name").value.trim(),
    Nombre_Contacto: document.getElementById("create_Nombre_Contacto").value.trim(),
    Telefono_Contacto: document.getElementById("create_Telefono_Contacto").value.trim(),
    Regional: document.getElementById("create_Regional").value.trim(),
    Distrito: document.getElementById("create_Distrito").value.trim(),
    Codigo_Planta_Fisica: document.getElementById("create_Codigo_Planta_Fisica").value.trim(),
    Hostname: document.getElementById("create_Hostname").value.trim(),
    DDNS: document.getElementById("create_DDNS").value.trim(),
    IP_Gestion_FMG: document.getElementById("create_IP_Gestion_FMG").value.trim(),
    IP_Gestion_SW: document.getElementById("create_IP_Gestion_SW").value.trim(),
    SiteType: document.getElementById("create_SiteType").value.trim(),
    Fortigate: selectedSerialNumber
  };

  // ✅ Validaciones previas
  const requiredFields = ["Site", "WAN_IP", "Nombre_Escuela", "Long_Name", "SiteType"];
  for (const field of requiredFields) {
    if (!payload[field]) {
      alert(`El campo ${field} es obligatorio.`);
      return;
    }
  }

  if (!allowedSiteTypes.includes(payload.SiteType)) {
    alert(`El valor de SiteType no es válido. Debe ser uno de: ${allowedSiteTypes.join(", ")}`);
    return;
  }

  if (!payload.Fortigate) {
    alert("Debes seleccionar un Fortigate válido desde la lista.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/dataminerd`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert("Sitio creado correctamente.");
      document.getElementById("createForm").reset();
      selectedSerialNumber = null;
    } else {
      const error = await res.text();
      alert("Error al crear el sitio: " + error);
    }
  } catch (err) {
    console.error("Error en la solicitud:", err);
    alert("Error al enviar los datos.");
  }
}
