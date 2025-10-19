addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname.slice(1);

  // 🏠 Mostrar formulario
  if (path === "") {
    return new Response(`
      <form method="POST">
        <input name="url" placeholder="https://ejemplo.com" required>
        <input name="slug" placeholder="corto">
        <button>Acortar</button>
      </form>
    `, { headers: { "Content-Type": "text/html" } });
  }

  // ➕ Guardar enlace (solo si es POST)
  if (request.method === "POST") {
    try {
      const formData = await request.formData();
      const longUrl = formData.get("url")?.trim();
      let slug = formData.get("slug")?.trim() || Math.random().toString(36).slice(2, 8);

      if (!longUrl) return new Response("URL requerida", { status: 400 });
      try { new URL(longUrl); } catch (_) { return new Response("URL inválida", { status: 400 }); }

      // ✅ ESTO DEBE EJECUTARSE
      await URLS.put(slug, longUrl);
      return new Response(`Hecho: ${url.origin}/${slug}`, { headers: { "Content-Type": "text/plain" } });
    } catch (e) {
      return new Response("Error: " + e.message, { status: 500 });
    }
  }

  // 🔗 Redirigir
  const longUrl = await URLS.get(path);
  if (longUrl) return Response.redirect(longUrl, 302);
  return new Response("No encontrado", { status: 404 });
}
