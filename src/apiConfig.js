
//API DE DOLAR USD Y EUR
export const API_KEY = "2ba96ae66f6deb72572261fe";

export const obtenerTasas = async () => {
  try {
    const response = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`);
    const data = await response.json();
    if (data.result === "success") {
      const usdToArs = data.conversion_rates.ARS;
      const eurToUsd = data.conversion_rates.EUR;
      const eurToArs = (1 / eurToUsd) * usdToArs;
      return { USD: Number(usdToArs).toFixed(2), EUR: Number(eurToArs).toFixed(2) };
    }
  } catch (error) {
    console.error("Error al obtener tasas:", error);
    return { USD: 1300, EUR: 1450 };
  }
};