const API_URL = "https://api.dataminerd.manatech.do/api/DataMinerd";

// Al cargar la página, extrae ?site=XYZ y llama a loadForEdit
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const site = params.get("site");
  if (site) {
    loadForEdit(site);
  }
});

// Cargar datos existentes en el form de edición
async function loadForEdit(site) {
  // Rellenar el input readonly
  document.getElementById("edit_Site").value = site;

  try {
    const res = await fetch(`${API_URL}/${encodeURIComponent(site)}`);
    if (!res.ok) {
      alert("No existe el registro para site: " + site);
      return;
    }
    const dto = await res.json();

    // Asigna cada campo del DTO al formulario
    document.getElementById("edit_Circuito").value            = dto.circuito            ?? "";
    document.getElementById("edit_Nombre_Escuela").value      = dto.nombre_Escuela      ?? "";
    document.getElementById("edit_WAN_IP").value              = dto.waN_IP               ?? "";
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
  } catch (err) {
    console.error("Error cargando datos:", err);
    alert("Ocurrió un error al cargar los datos.");
  }
}

// Actualizar el registro con PUT
async function updateBySite() {
  const site = document.getElementById("edit_Site").value;
  if (!site) {
    alert("Primero carga un registro para editar.");
    return;
  }

  const dto = {
    Circuito:       NumberOrNull("edit_Circuito"),
    Nombre_Escuela: valueOrNull("edit_Nombre_Escuela"),
    WAN_IP:         valueOrNull("edit_WAN_IP"),
    Latitud:        valueOrNull("edit_Latitud"),
    Longitud:       valueOrNull("edit_Longitud"),
    Long_Name:      valueOrNull("edit_Long_Name"),
    Nombre_Contacto:valueOrNull("edit_Nombre_Contacto"),
    Telefono_Contacto: valueOrNull("edit_Telefono_Contacto"),
    Regional:       valueOrNull("edit_Regional"),
    Distrito:       valueOrNull("edit_Distrito"),
    Codigo_Planta_Fisica: valueOrNull("edit_Codigo_Planta_Fisica"),
    Hostname:       valueOrNull("edit_Hostname"),
    DDNS:           valueOrNull("edit_DDNS"),
    IP_Gestion_FMG: valueOrNull("edit_IP_Gestion_FMG"),
    IP_Gestion_SW:  valueOrNull("edit_IP_Gestion_SW"),
    SiteType:       valueOrNull("edit_SiteType")
  };

  try {
    const res = await fetch(`${API_URL}/${encodeURIComponent(site)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto)
    });

    if (res.ok) {
      alert("Registro actualizado correctamente.");
      // Opcional: redirigir o recargar
      window.location.href = "app.html";
    } else {
      const errText = await res.text();
      console.error("Error al actualizar:", errText);
      alert("Error al actualizar: " + res.status);
    }
  } catch (err) {
    console.error("Error en la petición PUT:", err);
    alert("Ocurrió un error al actualizar.");
  }
}

async function promptForSite() {
  const current = document.getElementById('edit_Site').value;
  const site = prompt('Por favor, ingresa el Site (ID):', current);
  if (site !== null) {
    const id = site.trim();
    if (!id) return;

    // Actualiza el input
    document.getElementById('edit_Site').value = id;
    // Vuelve a cargar los datos de ese Site
    await loadForEdit(id);
  }
}


// Helpers para convertir valores vacíos a null o Number
function valueOrNull(id) {
  const val = document.getElementById(id).value.trim();
  return val === "" ? null : val;
}

function NumberOrNull(id) {
  const val = document.getElementById(id).value;
  return val === "" ? null : Number(val);
}
