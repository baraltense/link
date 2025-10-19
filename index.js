addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname.slice(1);

  if (path === "") {
    return new Response(`
      <h2>🔗 Acortador Baraltense</h2>
      <form method="POST">
        <input name="url" placeholder="Pega tu enlace largo" required style="width:100%; padding:10px; margin:5px 0;">
        <input name="slug" placeholder="Nombre corto (opcional)" style="width:100%; padding:10px; margin:5px 0;">
        <button type="submit" style="width:100%; padding:12px; background:#1a73e8; color:white; border:none;">Acortar</button>
      </form>
    `, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  if (request.method === "POST") {
    const formData = await request.formData();
    const longUrl = formData.get("url")?.trim();
    let slug = formData.get("slug")?.trim() || Math.random().toString(36).slice(2, 8);

    if (!longUrl) return new Response("Falta la URL", { status: 400 });
    try { new URL(longUrl); } catch (e) { return new Response("URL inválida", { status: 400 }); }

    // ✅ Usa URLS (global) — NO env.URLS
    await URLS.put(slug, longUrl);

    return new Response(`✅ Listo:\n${url.origin}/${slug}`, {
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }

  // ✅ Leer desde URLS
  const longUrl = await URLS.get(path);
  if (longUrl) return Response.redirect(longUrl, 302);

  return new Response("❌ Enlace no encontrado", { status: 404 });
}
