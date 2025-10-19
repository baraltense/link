export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace('/', '');
    
    // PÁGINA PRINCIPAL - FORMULARIO
    if (path === '') {
      if (request.method === 'POST') {
        try {
          const formData = await request.formData();
          const originalUrl = formData.get('url');
          let customSlug = formData.get('slug') || Math.random().toString(36).substring(2, 8);
          
          // Validar URL
          if (!originalUrl || !originalUrl.startsWith('http')) {
            return showError('Por favor ingresa una URL válida que comience con http:// o https://');
          }
          
          // Limpiar slug
          customSlug = customSlug.toLowerCase().replace(/[^a-z0-9-_]/g, '');
          if (!customSlug) {
            customSlug = Math.random().toString(36).substring(2, 8);
          }
          
          // Verificar si el slug ya existe
          const existingLink = await env.LINKS.get(customSlug);
          if (existingLink) {
            return showError(`El slug "${customSlug}" ya está en uso. Por favor elige otro.`);
          }
          
          // Guardar en KV
          await env.LINKS.put(customSlug, originalUrl);
          
          const shortUrl = `${new URL(request.url).origin}/${customSlug}`;
          
          return new Response(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>✅ Enlace Acortado</title>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; background: #f5f5f5; }
                    .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .success { background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .url-box { background: white; padding: 15px; border: 2px dashed #28a745; border-radius: 5px; margin: 10px 0; }
                    input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px; }
                    button { background: #007cba; color: white; padding: 12px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
                    button:hover { background: #005a87; }
                    .btn-copy { background: #28a745; }
                    .btn-test { background: #17a2b8; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>✅ ¡Enlace Acortado!</h1>
                    <div class="success">
                        <p><strong>URL Original:</strong><br>${originalUrl}</p>
                        <p><strong>URL Acortada:</strong></p>
                        <div class="url-box">
                            <input type="text" value="${shortUrl}" id="shortUrl" readonly onclick="this.select()">
                        </div>
                        <button class="btn-copy" onclick="copyUrl()">📋 Copiar URL</button>
                        <a href="${shortUrl}" target="_blank"><button class="btn-test">🔗 Probar Enlace</button></a>
                    </div>
                    <p><a href="/">← Acortar otro enlace</a></p>
                </div>
                
                <script>
                    function copyUrl() {
                        const input = document.getElementById('shortUrl');
                        input.select();
                        navigator.clipboard.writeText(input.value).then(() => {
                            alert('✅ URL copiada al portapapeles');
                        });
                    }
                </script>
            </body>
            </html>
          `, { headers: { 'Content-Type': 'text/html' } });
          
        } catch (error) {
          return showError('Error al procesar el enlace: ' + error.message);
        }
      }

      // MOSTRAR FORMULARIO
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>🔗 Acortador de Enlaces</title>
            <meta charset="UTF-8">
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    max-width: 600px; 
                    margin: 50px auto; 
                    padding: 20px;
                    background-color: #f5f5f5;
                }
                .container { 
                    background: white; 
                    padding: 30px; 
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                h1 { color: #333; text-align: center; margin-bottom: 10px; }
                .subtitle { text-align: center; color: #666; margin-bottom: 30px; }
                .form-group { margin: 25px 0; }
                label { display: block; margin-bottom: 8px; font-weight: bold; color: #333; }
                input { 
                    width: 100%; 
                    padding: 14px; 
                    border: 1px solid #ddd; 
                    border-radius: 5px; 
                    box-sizing: border-box;
                    font-size: 16px;
                }
                input:focus { border-color: #007cba; outline: none; }
                button { 
                    background: #007cba; 
                    color: white; 
                    padding: 16px; 
                    border: none; 
                    border-radius: 5px; 
                    cursor: pointer; 
                    width: 100%;
                    font-size: 18px;
                    font-weight: bold;
                    margin-top: 10px;
                }
                button:hover { background: #005a87; }
                .examples { 
                    background: #f8f9fa; 
                    padding: 20px; 
                    border-radius: 5px; 
                    margin-top: 30px;
                }
                small { color: #666; font-size: 14px; }
                .feature { display: flex; align-items: center; margin: 10px 0; }
                .feature-icon { font-size: 20px; margin-right: 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🔗 Acortador de Enlaces</h1>
                <p class="subtitle">Convierte enlaces largos en URLs cortas y fáciles de compartir</p>
                
                <form method="POST">
                    <div class="form-group">
                        <label for="url">📎 URL para acortar:</label>
                        <input type="url" id="url" name="url" 
                               placeholder="https://ejemplo.com/mi-enlace-muy-largo" 
                               required>
                    </div>
                    
                    <div class="form-group">
                        <label for="slug">🔤 Slug personalizado (opcional):</label>
                        <input type="text" id="slug" name="slug" 
                               placeholder="mi-enlace-especial" 
                               pattern="[a-zA-Z0-9-_]+" 
                               maxlength="30">
                        <small>Solo letras, números, guiones y guiones bajos. Se generará automáticamente si lo dejas vacío.</small>
                    </div>
                    
                    <button type="submit">🚀 Acortar Enlace</button>
                </form>
                
                <div class="examples">
                    <h3>✨ Características:</h3>
                    <div class="feature">✅ <strong>Enlaces permanentes</strong> - Se guardan para siempre</div>
                    <div class="feature">🎯 <strong>Slugs personalizados</strong> - Elige tu propia URL corta</div>
                    <div class="feature">📱 <strong>Compatible con móviles</strong> - Funciona en todos los dispositivos</div>
                    <div class="feature">⚡ <strong>Instantáneo</strong> - Redirección rápida</div>
                </div>
            </div>
        </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' } });
    }
    
    // REDIRIGIR - Buscar enlace en KV
    try {
      const targetUrl = await env.LINKS.get(path);
      if (targetUrl) {
        return Response.redirect(targetUrl, 302);
      }
    } catch (error) {
      console.error('Error accessing KV:', error);
    }
    
    // ENLACE NO ENCONTRADO
    return showError(`El enlace <strong>/${path}</strong> no existe. Verifica que la URL sea correcta.`);
  }
}

// FUNCIÓN HELPER PARA MOSTRAR ERRORES
function showError(message) {
  return new Response(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>❌ Error</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; background: #f5f5f5; }
            .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { background: #f8d7da; padding: 25px; border-radius: 8px; color: #721c24; }
            a { color: #007cba; text-decoration: none; }
            a:hover { text-decoration: underline; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="error">
                <h2>❌ Error</h2>
                <p>${message}</p>
                <p><a href="/">← Volver al acortador</a></p>
            </div>
        </div>
    </body>
    </html>
  `, { status: 404, headers: { 'Content-Type': 'text/html' } });
}
