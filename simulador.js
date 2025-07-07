// Tasas segun el plazo en dias
const tasas = {
  15: 0.08,
  30: 0.16,
  90: 0.45,
  180: 0.90,
  360: 1.80,
};

// Notyf para usar notificaciones
const notyf = new Notyf();

// Función para solicitar datos con prompt + validación usando Notyf para errores
async function solicitarDatos() {
  let monto = parseFloat(prompt("¿Andas necesitando unos pesos extra? (pone solo el numero, sin comas ni signos)"));

  while (isNaN(monto) || monto < 10000) {
    notyf.error("Monto inválido, debe ser mayor o igual a 10000");
    monto = parseFloat(prompt("Monto inválido, ingresa un monto válido, mayor o igual a 10000"));
  }

  let dias = parseInt(prompt("¿En cuantos dias pensas devolverlo? Dias: 15, 30, 90, 180 o 360"));

  while (!tasas[dias]) {
    notyf.error("Plazo inválido, usa uno de estos: 15, 30, 90, 180 o 360");
    dias = parseInt(prompt("Ese plazo es invalido, fijate bien. Usa uno de estos: 15, 30, 90, 180 o 360"));
  }

  return { monto, dias };
}

// Calculo monto + interes
function calcularDevolucion(monto, dias) {
  const interes = tasas[dias] ?? 0;
  const total = monto + (monto * interes);
  return { interes, total };
}

// Mostrar resultado con Notyf y consola
function mostrarResultado(monto, dias, interes, total) {
  const mensaje =
    `--- RESUMEN DEL PRÉSTAMO ---\n` +
    `Pediste: $${monto}\n` +
    `Plazo elegido: ${dias} días\n` +
    `Interés aplicado: ${(interes * 100).toFixed(2)}%\n` +
    `Total a devolver: $${total.toFixed(2)}\n`;

  console.log(mensaje);
  notyf.success(mensaje);
}

// DOM formulario 
document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.createElement("form");
  formulario.innerHTML = `
    <label for="montoInput">¿Queres saber cuanto dinero devolver o cuanto te tienen que devolver?, Ingresal el monto:</label>
    <input type="number" id="montoInput" />

    <label for="plazoSelect">Ingresa el plazo en días:</label>
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

    // Validaciones con Notyf
    if (isNaN(monto)) {
      notyf.error('Ingresa un monto válido (solo números).');
      return;
    }
    if (monto < 10000) {
      notyf.error('Monto inválido, debe ser mayor o igual a 10000.');
      return;
    }
    if (!tasas[dias]) {
      notyf.error('Selecciona un plazo válido.');
      return;
    }

    // Calcular y mostrar resultado en el div
    const { interes, total } = calcularDevolucion(monto, dias);

    resultado.innerHTML = `
      <h3>Resumen del Préstamo</h3>
      <p>Pediste: $${monto}</p>
      <p>Plazo: ${dias} días</p>
      <p>Interés aplicado: ${(interes * 100).toFixed(2)}%</p>
      <p>Total a devolver: $${total.toFixed(2)}</p>
    `;

    notyf.success('Cálculo realizado correctamente.');

    // Guardar historial en localStorage
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

// Conversor de monedas/criptomonedas
document.addEventListener("DOMContentLoaded", () => {
  const conversor = document.createElement("section");
  conversor.id = "conversor-dolar";

 // DOM conversor 
  conversor.innerHTML = `
    <h2>Conversor a Peso Argentino (ARS) en tiempo real</h2>
    <p>Convierte Dólar Blue, USDT o BTC a pesos argentinos usando cotizaciones actualizadas.</p>

    <label for="monto">Cantidad:</label>
    <input type="number" id="monto" value="1" min="0" step="any" />

    <label for="moneda">Moneda origen:</label>
    <select id="moneda">
      <option value="usd_blue">Dólar Blue (USD)</option>
      <option value="usdt">USDT</option>
      <option value="btc">BTC</option>
    </select>

    <div class="resultado">
      <strong>Valor en ARS:</strong> <span id="resultado">Cargando...</span>
    </div>
  `;

  document.body.appendChild(conversor);

  const inputMonto = document.getElementById("monto");
  const selectMoneda = document.getElementById("moneda");
  const spanResultado = document.getElementById("resultado");

  let precios = {
    usd_blue: null,
    usdt: null,
    btc: null,
  };

  async function obtenerPrecios() {
    try {
      const respBlue = await fetch("https://api.bluelytics.com.ar/v2/latest");
      const dataBlue = await respBlue.json();
      precios.usd_blue = dataBlue.blue.value_sell;

      const respCrypto = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=tether,bitcoin&vs_currencies=ars");
      const dataCrypto = await respCrypto.json();
      precios.usdt = dataCrypto.tether.ars;
      precios.btc = dataCrypto.bitcoin.ars;

      actualizarResultado();
    } catch (e) {
      spanResultado.textContent = "Error al obtener cotizaciones.";
      notyf.error("Error al obtener cotizaciones.");
      console.error(e);
    }
  }

  function actualizarResultado() {
    const monto = parseFloat(inputMonto.value);
    if (isNaN(monto) || monto <= 0) {
      spanResultado.textContent = "Ingrese un monto válido";
      return;
    }
    const moneda = selectMoneda.value;
    const precio = precios[moneda];
    if (precio === null) {
      spanResultado.textContent = "Cotización no disponible";
      return;
    }
    const valorARS = monto * precio;
    spanResultado.textContent = valorARS.toLocaleString("es-AR", { style: "currency", currency: "ARS" });
  }

  inputMonto.addEventListener("input", actualizarResultado);
  selectMoneda.addEventListener("change", actualizarResultado);

  obtenerPrecios();
  setInterval(obtenerPrecios, 60000);
});