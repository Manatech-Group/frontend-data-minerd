const API_URL = "http://localhost:5293/api/DataMinerd";

// Cargar datos existentes en el form de edición
   async function loadForEdit() {
  const siteInput = document.getElementById("edit_Site");
  const site = prompt("Ingrese el site a editar:");
  if (!site) return;

  const res = await fetch(`${API_URL}/${site}`); // ← aquí corregido
  if (!res.ok) return alert("No existe");

  const dto = await res.json();
  console.log(dto); // para verificar la forma del objeto

  siteInput.value = site;

  document.getElementById("edit_Circuito").value            = dto.circuito            ?? "";
  document.getElementById("edit_Nombre_Escuela").value      = dto.nombre_Escuela      ?? "";
  console.log("Antes de WAN_IP", dto.wan_IP);
  document.getElementById("edit_WAN_IP").value              = dto.waN_IP             ?? "";
  console.log("Después de WAN_IP");
  document.getElementById("edit_Latitud").value             = dto.latitud             ?? "";
  document.getElementById("edit_Longitud").value            = dto.longitud            ?? "";
  document.getElementById("edit_Long_Name").value           = dto.long_Name           ?? "";
  document.getElementById("edit_Nombre_Contacto").value     = dto.nombre_Contacto     ?? "";
  document.getElementById("edit_Telefono_Contacto").value   = dto.telefono_Contacto   ?? "";
  document.getElementById("edit_Regional").value            = dto.regional            ?? "";
  document.getElementById("edit_Distrito").value            = dto.distrito            ?? "";
  document.getElementById("edit_Codigo_Planta_Fisica").value= dto.codigo_Planta_Fisica?? "";
  document.getElementById("edit_Hostname").value            = dto.hostname            ?? "";
  document.getElementById("edit_DDNS").value                = dto.ddns                ?? "";
  document.getElementById("edit_IP_Gestion_FMG").value      = dto.iP_Gestion_FMG      ?? "";
  document.getElementById("edit_IP_Gestion_SW").value       = dto.iP_Gestion_SW       ?? "";
  document.getElementById("edit_SiteType").value            = dto.siteType            ?? "";
}


// Actualizar
   async function updateBySite() {
  const site = document.getElementById("edit_Site").value;
  if (!site) return alert("Carga primero");

  const dto = {
    Circuito: NumberOrNull("edit_Circuito"),
    Nombre_Escuela: valueOrNull("edit_Nombre_Escuela"),
    WAN_IP: valueOrNull("edit_WAN_IP"),
    Latitud: valueOrNull("edit_Latitud"),
    Longitud: valueOrNull("edit_Longitud"),
    Long_Name: valueOrNull("edit_Long_Name"),
    Nombre_Contacto: valueOrNull("edit_Nombre_Contacto"),
    Telefono_Contacto: valueOrNull("edit_Telefono_Contacto"),
    Regional: valueOrNull("edit_Regional"),
    Distrito: valueOrNull("edit_Distrito"),
    Codigo_Planta_Fisica: valueOrNull("edit_Codigo_Planta_Fisica"),
    Hostname: valueOrNull("edit_Hostname"),
    DDNS: valueOrNull("edit_DDNS"),
    IP_Gestion_FMG: valueOrNull("edit_IP_Gestion_FMG"),
    IP_Gestion_SW: valueOrNull("edit_IP_Gestion_SW"),
    SiteType: valueOrNull("edit_SiteType")
  };

  const res = await fetch(`${API_URL}/${site}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto)
  });

  if (res.ok) {
    alert("Actualizado");
    fetchAllData();
  } else {
    alert("Error al actualizar");
  }
}

function valueOrNull(id) {
  const val = document.getElementById(id).value.trim();
  return val === "" ? null : val;
}

function NumberOrNull(id) {
  const val = document.getElementById(id).value;
  return val === "" ? null : Number(val);
}
