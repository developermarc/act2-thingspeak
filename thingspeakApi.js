const THINGSPEAK_BASE_URL = "https://api.thingspeak.com";

const DEFAULT_CONFIG = {
  channelId: "3378694",
  writeApiKey:
    process.env.REACT_APP_THINGSPEAK_WRITE_API_KEY ||
    "FLGKH46BQVZGOLDH",
};

/**
 * Comprueba que un valor sea entero.
 */
function validarEntero(valor, nombreCampo = "valor") {
  if (!Number.isInteger(valor)) {
    throw new Error(`${nombreCampo} debe ser un número entero.`);
  }
}

/**
 * Comprueba que el número de campo sea válido en ThingSpeak.
 * ThingSpeak permite hasta 8 campos por canal.
 */
function validarNumeroCampo(fieldNumber) {
  if (!Number.isInteger(fieldNumber) || fieldNumber < 1 || fieldNumber > 8) {
    throw new Error("El número de campo debe ser un entero entre 1 y 8.");
  }
}

/**
 * Ejecuta una petición GET y devuelve JSON.
 */
async function getJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  // ThingSpeak puede devolver -1 si no se tiene acceso al canal.
  if (data === -1) {
    throw new Error("No se tiene acceso al canal o la API Key no es válida.");
  }

  return data;
}

/**
 * Ejecuta una petición GET de escritura.
 * ThingSpeak devuelve normalmente el entry_id insertado.
 * Si devuelve 0, significa que no se ha insertado el dato.
 */
async function writeGet(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
  }

  const text = await response.text();
  const entryId = Number(text);

  if (entryId === 0) {
    throw new Error(
      "ThingSpeak ha devuelto 0. El dato no se ha insertado. Puede ser por límite de frecuencia o por API Key incorrecta."
    );
  }

  return {
    success: true,
    entryId,
    rawResponse: text,
  };
}

/**
 * Write a Channel Feed
 *
 * Inserta valores enteros en uno o varios campos.
 *
 * Ejemplo:
 * await writeChannelFeed({
 *   field1: 70,
 *   field2: 85,
 *   field3: 40,
 *   field4: 230,
 *   field5: 18
 * });
 */
export async function writeChannelFeed(fields, config = {}) {
  const finalConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  if (!finalConfig.writeApiKey) {
    throw new Error("No se ha configurado la Write API Key.");
  }

  const params = new URLSearchParams();
  params.append("api_key", finalConfig.writeApiKey);

  Object.entries(fields).forEach(([key, value]) => {
    if (!/^field[1-8]$/.test(key)) {
      throw new Error(`Campo no válido: ${key}. Usa field1, field2, ..., field8.`);
    }

    validarEntero(value, key);
    params.append(key, value);
  });

  const url = `${THINGSPEAK_BASE_URL}/update?${params.toString()}`;

  return await writeGet(url);
}

/**
 * Write a Channel Feed para los 5 campos concretos de la actividad.
 *
 * field1 = Carga cognitiva (%)
 * field2 = Nivel de coherencia (0-100)
 * field3 = Intensidad emocional (0-100)
 * field4 = Latencia de inferencia (ms)
 * field5 = Consumo energético (w)
 *
 * Ejemplo:
 * await writeActivityData({
 *   cargaCognitiva: 70,
 *   nivelCoherencia: 85,
 *   intensidadEmocional: 40,
 *   latenciaInferencia: 230,
 *   consumoEnergetico: 18
 * });
 */
export async function writeActivityData(
  {
    cargaCognitiva,
    nivelCoherencia,
    intensidadEmocional,
    latenciaInferencia,
    consumoEnergetico,
  },
  config = {}
) {
  validarEntero(cargaCognitiva, "cargaCognitiva");
  validarEntero(nivelCoherencia, "nivelCoherencia");
  validarEntero(intensidadEmocional, "intensidadEmocional");
  validarEntero(latenciaInferencia, "latenciaInferencia");
  validarEntero(consumoEnergetico, "consumoEnergetico");

  return await writeChannelFeed(
    {
      field1: cargaCognitiva,
      field2: nivelCoherencia,
      field3: intensidadEmocional,
      field4: latenciaInferencia,
      field5: consumoEnergetico,
    },
    config
  );
}

/**
 * Read a Channel Feed
 *
 * Lee los últimos registros del canal.
 *
 * Endpoint base:
 * GET https://api.thingspeak.com/channels/3378694/feeds.json?results=2
 *
 * Ejemplo:
 * const data = await readChannelFeed(10);
 */
export async function readChannelFeed(results = 2, config = {}) {
  const finalConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  validarEntero(results, "results");

  const params = new URLSearchParams();
  params.append("results", results);

  const url = `${THINGSPEAK_BASE_URL}/channels/${finalConfig.channelId}/feeds.json?${params.toString()}`;

  return await getJson(url);
}

/**
 * Read a Channel Field
 *
 * Lee los últimos registros de un campo concreto.
 *
 * Endpoint base:
 * GET https://api.thingspeak.com/channels/3378694/fields/1.json?results=2
 *
 * Ejemplo:
 * const data = await readChannelField(1, 10);
 */
export async function readChannelField(fieldNumber = 1, results = 2, config = {}) {
  const finalConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  validarNumeroCampo(fieldNumber);
  validarEntero(results, "results");

  const params = new URLSearchParams();
  params.append("results", results);

  const url = `${THINGSPEAK_BASE_URL}/channels/${finalConfig.channelId}/fields/${fieldNumber}.json?${params.toString()}`;

  return await getJson(url);
}

/**
 * Read Channel Status Updates
 *
 * Lee las actualizaciones de estado del canal.
 *
 * Endpoint base:
 * GET https://api.thingspeak.com/channels/3378694/status.json
 *
 * Ejemplo:
 * const status = await readChannelStatus();
 */
export async function readChannelStatus(config = {}) {
  const finalConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  const url = `${THINGSPEAK_BASE_URL}/channels/${finalConfig.channelId}/status.json`;

  return await getJson(url);
}

/**
 * Función auxiliar para transformar un feed de ThingSpeak
 * a un formato más cómodo para pintar gráficas en React.
 */
export function mapFeedsToActivityData(thingspeakResponse) {
  if (!thingspeakResponse || !Array.isArray(thingspeakResponse.feeds)) {
    return [];
  }

  return thingspeakResponse.feeds.map((feed) => ({
    entryId: feed.entry_id,
    createdAt: feed.created_at,
    cargaCognitiva: feed.field1 !== null ? Number(feed.field1) : null,
    nivelCoherencia: feed.field2 !== null ? Number(feed.field2) : null,
    intensidadEmocional: feed.field3 !== null ? Number(feed.field3) : null,
    latenciaInferencia: feed.field4 !== null ? Number(feed.field4) : null,
    consumoEnergetico: feed.field5 !== null ? Number(feed.field5) : null,
  }));
}

/**
 * Exportación agrupada por comodidad.
 */
const thingSpeakApi = {
  writeChannelFeed,
  writeActivityData,
  readChannelFeed,
  readChannelField,
  readChannelStatus,
  mapFeedsToActivityData,
};

export default thingSpeakApi;
