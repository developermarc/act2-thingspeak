const THINGSPEAK_BASE_URL = "https://api.thingspeak.com";

const DEFAULT_CONFIG = {
  channelId: "3378694",
  writeApiKey: "FLGKH46BQVZGOLDH",
};

export interface ConfigOptions {
  channelId?: string;
  writeApiKey?: string;
}

export interface ActivityData {
  cargaCognitiva: number;
  nivelCoherencia: number;
  intensidadEmocional: number;
  latenciaInferencia: number;
  consumoEnergetico: number;
}

export interface FeedData {
  entry_id: number;
  created_at: string;
  field1: string | null;
  field2: string | null;
  field3: string | null;
  field4: string | null;
  field5: string | null;
  field6: string | null;
  field7: string | null;
  field8: string | null;
}

export interface ThingSpeakResponse {
  channel: any;
  feeds: FeedData[];
}

export interface MappedActivityData {
  entryId: number;
  createdAt: string;
  cargaCognitiva: number | null;
  nivelCoherencia: number | null;
  intensidadEmocional: number | null;
  latenciaInferencia: number | null;
  consumoEnergetico: number | null;
}

/**
 * Comprueba que un valor sea entero.
 */
function validarEntero(valor: number, nombreCampo = "valor"): void {
  if (!Number.isInteger(valor)) {
    throw new Error(`${nombreCampo} debe ser un número entero.`);
  }
}

/**
 * Ejecuta una petición GET y devuelve JSON.
 */
async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  if (data === -1) {
    throw new Error("No se tiene acceso al canal o la API Key no es válida.");
  }

  return data as T;
}

/**
 * Read a Channel Feed
 */
export async function readChannelFeed(results = 2, config: ConfigOptions = {}): Promise<ThingSpeakResponse> {
  const finalConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  validarEntero(results, "results");

  const params = new URLSearchParams();
  params.append("results", results.toString());

  const url = `${THINGSPEAK_BASE_URL}/channels/${finalConfig.channelId}/feeds.json?${params.toString()}`;

  return await getJson<ThingSpeakResponse>(url);
}

/**
 * Mapea los feeds de ThingSpeak al formato esperado por la aplicación
 */
export function mapFeedsToActivityData(thingspeakResponse: ThingSpeakResponse): MappedActivityData[] {
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
 * Write a Channel Feed
 */
export async function writeChannelFeed(data: ActivityData, config: ConfigOptions = {}): Promise<void> {
  const finalConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  if (!finalConfig.writeApiKey) {
    throw new Error("writeApiKey es requerida para escribir en el canal.");
  }

  const url = `${THINGSPEAK_BASE_URL}/update.json`;
  const body = {
    api_key: finalConfig.writeApiKey,
    field1: data.cargaCognitiva,
    field2: data.nivelCoherencia,
    field3: data.intensidadEmocional,
    field4: data.latenciaInferencia,
    field5: data.consumoEnergetico,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();
  if (result === 0) {
    throw new Error("Error al actualizar ThingSpeak (posible límite de 15 segundos excedido).");
  }
}

const thingSpeakApi = {
  readChannelFeed,
  writeChannelFeed,
  mapFeedsToActivityData,
};

export default thingSpeakApi;
