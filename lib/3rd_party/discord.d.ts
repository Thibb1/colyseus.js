/**
 * Discord Embedded App SDK
 * https://github.com/colyseus/colyseus/issues/707
 *
 * All URLs must go through the local proxy from
 * https://<app_id>.discordsays.com/.proxy/<mapped_url>/...
 *
 * URL Mapping Examples:
 *
 * 1. Using Colyseus Cloud:
 *   - /colyseus/{subdomain} -> {subdomain}.colyseus.cloud
 *
 *   Example:
 *     const client = new Client("https://xxxx.colyseus.cloud");
 *
 * -------------------------------------------------------------
 *
 * 2. Using `cloudflared` tunnel:
 *   - /colyseus/ -> <your-cloudflared-url>.trycloudflare.com
 *
 *   Example:
 *     const client = new Client("https://<your-cloudflared-url>.trycloudflare.com");
 *
 * -------------------------------------------------------------
 *
 * 3. Providing a manual /.proxy/your-mapping:
 *   - /your-mapping/ -> your-endpoint.com
 *
 *   Example:
 *     const client = new Client("/.proxy/your-mapping");
 *
 */
export declare function discordURLBuilder(url: URL): string;
