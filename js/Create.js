
   const API_URL = "http://localhost:5293/api/DataMinerd"; 
    
    // Crear
    async function createRecord() {
      const dto = {};
      // toma cada input de create_
      document.querySelectorAll('[id^="create_"]').forEach(i => { 
        const key = i.id.replace("create_", "");
        let val = i.value;
        if (i.type === "number") val = val ? Number(val) : null;
        if (i.tagName === "SELECT" && val === "") val = null;
        if (i.type === "datetime-local") val = val ? new Date(val).toISOString() : null;
        dto[key] = val;
      });
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto)
      });
      if (res.ok) {
        alert("Creado con éxito");
        fetchAllData();
      } else {
        alert("Error al crear");
      }
    }
