// Tasas segun el plazo en dias
const tasas = {
  15: 0.08,
  30: 0.16,
  90: 0.45,
  180: 0.90,
  360: 1.80,
};

// Pide los datos necesarios al usuario mediante promps y aclara condiciones 
function solicitarDatos() {
  let monto = parseFloat(prompt("¿Andas necesitando unos pesos extra? (pone solo el numero, sin comas ni signos)"));
  
  while (isNaN(monto) || monto < 10000) {
    monto = parseFloat(prompt("Monto invalido ingresa un monto valido, mayor o igual a 10000"));
  }

  let dias = parseInt(prompt("¿En cuantos dias pensas devolverlo? Dias: 15, 30, 90, 180 o 360"));
  
  while (!tasas[dias]) {
    dias = parseInt(prompt("Ese plazo es invalido, fijate bien. Usa uno de estos: 15, 30, 90, 180 o 360"));
  }

  return { monto, dias };
}

// Se hace el calculo/cuenta monto+interes
function calcularDevolucion(monto, dias) {
  const interes = tasas[dias] ?? 0; // Si no encuentra la tasa, iria con 0 (aunque no debe pasar)
  const total = monto + (monto * interes);
  return {
    interes,
    total
  };
}

// Muestra todo por consola y tambien tira un alert
function mostrarResultado(monto, dias, interes, total) {
  const mensaje = 
    `--- RESUMEN DEL PRÉSTAMO ---\n` +
    `Pediste: $${monto}\n` +
    `Plazo elegido: ${dias} días\n` +
    `Interés aplicado: ${(interes * 100).toFixed(2)}%\n` +
    `Total a devolver: $${total.toFixed(2)}\n`;

  console.log(mensaje);
  alert(mensaje);
}

// Muestra el resultado segun lo elegido por el usuario, ejecuta el simulador
function ejecutarSimulador() {
  const datos = solicitarDatos();
  const resultado = calcularDevolucion(datos.monto, datos.dias);
  mostrarResultado(datos.monto, datos.dias, resultado.interes, resultado.total);
}

// Corre el simulado cuando cargas el archivo
//ejecutarSimulador();


// DOM 
document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.createElement("form");
  formulario.innerHTML = `
    <label for="montoInput">¿Andas necesitando unos pesos extra? (pone solo el numero, sin comas ni signos)</label>
    <input type="number" id="montoInput" >

    <label for="plazoSelect">¿En cuántos días pensas devolverlo?</label>
    <select id="plazoSelect">
      <option value="">Elegí un plazo</option>
      <option value="15">15 días</option>
      <option value="30">30 días</option>
      <option value="90">90 días</option>
      <option value="180">180 días</option>
      <option value="360">360 días</option>
    </select>

    <button type="submit">Calcular</button>
  `;

  const resultado = document.createElement("div");
  resultado.id = "resultadoPrestamo";
  resultado.style.marginTop = "1em";

  document.body.appendChild(formulario);
  document.body.appendChild(resultado);

  formulario.addEventListener("submit", (e) => {
    e.preventDefault(); 

    const monto = parseFloat(document.getElementById("montoInput").value);
    const dias = parseInt(document.getElementById("plazoSelect").value);

    // Validaciones personalizadas:
    if (isNaN(monto)) {
      resultado.innerHTML = `<p style="color:red;">Ingresa un monto valido (solo numeros).</p>`;
      return;
    }

    if (monto < 10000) {
      resultado.innerHTML = `<p style="color:red;">Monto invalido, ingresa un monto mayor o igual a 10000!.</p>`;
      return;
    }

    if (!tasas[dias]) {
      resultado.innerHTML = `<p style="color:red;">Selecciona un plazo valido!.</p>`;
      return;
    }

    // Cálculo y muestra resultado
    const { interes, total } = calcularDevolucion(monto, dias);

    resultado.innerHTML = `
      <h3>Resumen del Préstamo</h3>
      <p>Pediste: $${monto}</p>
      <p>Plazo: ${dias} días</p>
      <p>Interés aplicado: ${(interes * 100).toFixed(2)}%</p>
      <p>Total a devolver: $${total.toFixed(2)}</p>
    `;

    // Guardar en localStorage
    const prestamo = {
      fecha: new Date().toLocaleString(),
      monto,
      dias,
      interes,
      total
    };

    let historial = JSON.parse(localStorage.getItem("historialPrestamos")) || [];
    historial.push(prestamo);
    localStorage.setItem("historialPrestamos", JSON.stringify(historial));
  });
});