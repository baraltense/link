export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace('/', '');
    
    // BASE DE DATOS DE ENLACES (puedes expandir esto con KV después)
    const linkDatabase = {
      'gh': 'https://github.com',
      'cf': 'https://cloudflare.com',
      'yt': 'https://youtube.com',
      'google': 'https://google.com',
      'twitter': 'https://twitter.com'
    };

    // PÁGINA PRINCIPAL - FORMULARIO PARA ACORTAR
    if (path === '') {
      if (request.method === 'POST') {
        // Procesar formulario
        const formData = await request.formData();
        const originalUrl = formData.get('url');
        const customSlug = formData.get('slug') || Math.random().toString(36).substring(2, 8);
        
        if (originalUrl) {
          // Guardar en la base de datos (aquí solo en memoria, luego usaremos KV)
          linkDatabase[customSlug] = originalUrl;
          
          const shortUrl = `${new URL(request.url).origin}/${customSlug}`;
          
          return new Response(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>✅ Enlace Acortado</title>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
                    .success { background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .url-box { background: white; padding: 15px; border: 2px dashed #28a745; border-radius: 5px; }
                    button { background: #007cba; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
                </style>
            </head>
            <body>
                <h1>✅ ¡Enlace Acortado!</h1>
                <div class="success">
                    <p><strong>URL Original:</strong><br>${originalUrl}</p>
                    <p><strong>URL Acortada:</strong></p>
                    <div class="url-box">
                        <input type="text" value="${shortUrl}" id="shortUrl" readonly style="width: 100%; border: none; background: transparent;">
                    </div>
                    <button onclick="copyUrl()">📋 Copiar URL Acortada</button>
                </div>
                <p><a href="/">← Acortar otro enlace</a></p>
                
                <script>
                    function copyUrl() {
                        const input = document.getElementById('shortUrl');
                        input.select();
                        document.execCommand('copy');
                        alert('✅ URL copiada al portapapeles');
                    }
                </script>
            </body>
            </html>
          `, { headers: { 'Content-Type': 'text/html' } });
        }
      }

      // Mostrar formulario
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
                h1 { color: #333; text-align: center; }
                .form-group { margin: 20px 0; }
                label { display: block; margin-bottom: 5px; font-weight: bold; }
                input, textarea { 
                    width: 100%; 
                    padding: 10px; 
                    border: 1px solid #ddd; 
                    border-radius: 5px; 
                    box-sizing: border-box;
                }
                button { 
                    background: #007cba; 
                    color: white; 
                    padding: 12px 30px; 
                    border: none; 
                    border-radius: 5px; 
                    cursor: pointer; 
                    width: 100%;
                    font-size: 16px;
                }
                button:hover { background: #005a87; }
                .examples { 
                    background: #f8f9fa; 
                    padding: 15px; 
                    border-radius: 5px; 
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🔗 Acortador de Enlaces</h1>
                <p>Convierte enlaces largos en URLs cortas y fáciles de compartir</p>
                
                <form method="POST">
                    <div class="form-group">
                        <label for="url">📎 URL para acortar:</label>
                        <input type="url" id="url" name="url" placeholder="https://ejemplo.com/mi-enlace-muy-largo" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="slug">🔤 Slug personalizado (opcional):</label>
                        <input type="text" id="slug" name="slug" placeholder="mi-enlace" pattern="[a-zA-Z0-9-_]+" maxlength="30">
                        <small>Letras, números, guiones y guiones bajos. Si lo dejas vacío, se generará automáticamente.</small>
                    </div>
                    
                    <button type="submit">🚀 Acortar Enlace</button>
                </form>
                
                <div class="examples">
                    <h3>📋 Enlaces de ejemplo:</h3>
                    <ul>
                        <li><a href="/gh">/${new URL(request.url).origin}/gh</a> → GitHub</li>
                        <li><a href="/yt">/${new URL(request.url).origin}/yt</a> → YouTube</li>
                        <li><a href="/google">/${new URL(request.url).origin}/google</a> → Google</li>
                    </ul>
                </div>
            </div>
        </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' } });
    }
    
    // REDIRIGIR si el enlace existe
    if (linkDatabase[path]) {
      return Response.redirect(linkDatabase[path], 302);
    }
    
    // ENLACE NO ENCONTRADO
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
          <title>❌ Enlace No Encontrado</title>
          <style>
              body { font-family: Arial, sans-serif; text-align: center; margin: 50px; }
              .error { background: #f8d7da; padding: 30px; border-radius: 8px; display: inline-block; }
          </style>
      </head>
      <body>
          <div class="error">
              <h1>❌ Enlace no encontrado</h1>
              <p>El enlace <strong>/${path}</strong> no existe.</p>
              <p><a href="/">← Volver al acortador</a></p>
          </div>
      </body>
      </html>
    `, { status: 404, headers: { 'Content-Type': 'text/html' } });
  }
}
