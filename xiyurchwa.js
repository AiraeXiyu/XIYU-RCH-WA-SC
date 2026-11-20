/**
 * ============================================================
 * XIYU REACH CHANNEL WA
 * WhatsApp Channel Reaction API Client
 * Developer : XIYU CODEX
 * ============================================================
 *
 * Node.js 20+ (ES Modules)
 *
 * Public API:
 *   import xiyurchwa, { createClient, sendReaction } from "./xiyurchwa.js";
 *
 *   const result = await sendReaction({
 *     link: "https://whatsapp.com/channel/CHANNEL_ID/POST_ID",
 *     emoji: "🔥😎❤️"
 *   });
 *
 * No website, frontend, framework, or environment variables required.
 */

const DEFAULT_CONFIG = Object.freeze({
  endpoint: "https://api-cloud.my.id/tools/rchv2",
  method: "GET",
  timeout: 25_000,
  maxEmojis: 15,
  userAgent: "XIYU-REACH-CHANNEL-WA/1.0"
});

const EMOJI_REGEX = /\p{Extended_Pictographic}/u;

export class XiyuReachChannelError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "XiyuReachChannelError";
    this.details = details;
  }
}

/**
 * Validate a WhatsApp URL.
 * Accepted hosts follow the original project validator.
 */
export function validateWhatsAppLink(value) {
  if (typeof value !== "string" || !value.trim()) {
    throw new XiyuReachChannelError("Link WhatsApp wajib diisi.");
  }

  let url;
  try {
    url = new URL(value.trim());
  } catch {
    throw new XiyuReachChannelError("Format link tidak valid.");
  }

  const host = url.hostname.toLowerCase();
  const allowedHosts = [
    "whatsapp.com",
    "www.whatsapp.com",
    "chat.whatsapp.com"
  ];

  if (!allowedHosts.includes(host)) {
    throw new XiyuReachChannelError("Gunakan tautan dari domain WhatsApp.");
  }

  if (url.protocol !== "https:") {
    throw new XiyuReachChannelError("Gunakan tautan HTTPS.");
  }

  return url.toString();
}

/**
 * Extract unique emoji graphemes and enforce the configured limit.
 */
export function parseEmojis(value, max = DEFAULT_CONFIG.maxEmojis) {
  if (typeof value !== "string") {
    throw new XiyuReachChannelError("Masukkan emoji.");
  }

  const segments = [...new Intl.Segmenter("en", {
    granularity: "grapheme"
  }).segment(value)];

  const unique = [...new Set(
    segments
      .map(({ segment }) => segment)
      .filter(segment => EMOJI_REGEX.test(segment))
  )];

  if (unique.length === 0) {
    throw new XiyuReachChannelError("Masukkan minimal satu emoji.");
  }

  if (unique.length > max) {
    throw new XiyuReachChannelError(`Maksimal ${max} emoji unik.`);
  }

  return unique;
}

/**
 * Create a configured XIYU Reach Channel WA client.
 *
 * Optional config:
 *   endpoint   : provider endpoint
 *   timeout    : request timeout in milliseconds
 *   maxEmojis  : maximum unique emoji count
 *   userAgent  : request User-Agent
 */
export function createClient(config = {}) {
  const settings = {
    ...DEFAULT_CONFIG,
    ...config
  };

  if (typeof settings.endpoint !== "string" || !settings.endpoint.trim()) {
    throw new XiyuReachChannelError("Endpoint API tidak valid.");
  }

  if (!Number.isFinite(settings.timeout) || settings.timeout <= 0) {
    throw new XiyuReachChannelError("Timeout harus berupa angka lebih dari 0.");
  }

  if (!Number.isInteger(settings.maxEmojis) || settings.maxEmojis < 1) {
    throw new XiyuReachChannelError("maxEmojis harus berupa bilangan bulat positif.");
  }

  /**
   * Send one request to the provider.
   *
   * @param {{link: string, emoji: string}} input
   * @returns {Promise<object>} Original provider JSON response
   */
  async function sendReaction({ link, emoji } = {}) {
    const validLink = validateWhatsAppLink(link);
    const emojis = parseEmojis(emoji, settings.maxEmojis);

    const endpoint = new URL(settings.endpoint);
    endpoint.searchParams.set("link", validLink);
    endpoint.searchParams.set("emoji", emojis.join(""));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), settings.timeout);

    let response;
    let raw;

    try {
      response = await fetch(endpoint.toString(), {
        method: settings.method,
        headers: {
          Accept: "application/json",
          "User-Agent": settings.userAgent
        },
        signal: controller.signal
      });

      raw = await response.text();
    } catch (error) {
      if (error?.name === "AbortError") {
        throw new XiyuReachChannelError("Provider request timed out.", {
          timeout: settings.timeout
        });
      }

      throw new XiyuReachChannelError(
        error?.message || "Tidak dapat menghubungi provider."
      );
    } finally {
      clearTimeout(timeoutId);
    }

    let data;
    try {
      data = JSON.parse(raw.replace(/^\uFEFF/, "").trim());
    } catch {
      throw new XiyuReachChannelError("Provider tidak mengembalikan JSON.", {
        httpStatus: response.status,
        contentType: response.headers.get("content-type"),
        responsePreview: raw.replace(/\s+/g, " ").trim().slice(0, 220)
      });
    }

    if (!response.ok) {
      throw new XiyuReachChannelError(
        data?.message || data?.error || `Provider HTTP ${response.status}`,
        {
          httpStatus: response.status,
          response: data
        }
      );
    }

    // Return the provider's original response without fabricating fields.
    return data;
  }

  return Object.freeze({
    config: Object.freeze({ ...settings }),
    validateWhatsAppLink,
    parseEmojis: value => parseEmojis(value, settings.maxEmojis),
    sendReaction
  });
}

const defaultClient = createClient();

/** Send a reaction using the default XIYU configuration. */
export const sendReaction = defaultClient.sendReaction;

export const config = defaultClient.config;

const xiyurchwa = Object.freeze({
  config,
  createClient,
  validateWhatsAppLink,
  parseEmojis,
  sendReaction,
  XiyuReachChannelError
});

export default xiyurchwa;
