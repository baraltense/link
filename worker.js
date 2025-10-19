export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace('/', '');
    
    // TU BASE DE DATOS DE ENLACES
    const linkDatabase = {
      'gh': 'https://github.com',
      'cf': 'https://cloudflare.com',
      'yt': 'https://youtube.com',
      'google': 'https://google.com',
      'twitter': 'https://twitter.com',
      'linkedin': 'https://linkedin.com'
    };
    
    // Página principal - muestra todos los enlaces
    if (path === '') {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>🔗 Mi Acortador de Enlaces</title>
            <meta charset="UTF-8">
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    max-width: 800px; 
                    margin: 40px auto; 
                    padding: 20px;
                    background-color: #f5f5f5;
                }
                h1 { color: #333; }
                ul { 
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                li { 
                    margin: 15px 0; 
                    padding: 10px;
                    border-left: 4px solid #007cba;
                }
                a { 
                    color: #007cba; 
                    text-decoration: none; 
                    font-weight: bold;
                }
                a:hover { text-decoration: underline; }
                .not-found { 
                    background: white;
                    padding: 30px;
                    border-radius: 8px;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <h1>🔗 Mi Acortador de Enlaces</h1>
            <p>Selecciona un enlace para redirigir:</p>
            <ul>
            ${Object.entries(linkDatabase).map(([key, value]) => 
                `<li>
                  <a href="/${key}">/${key}</a> 
                  <br><small>→ ${value}</small>
                </li>`
            ).join('')}
            </ul>
            <p><em>Para agregar más enlaces, edita el archivo worker.js</em></p>
        </body>
        </html>
      `, { 
        headers: { 'Content-Type': 'text/html' } 
      });
    }
    
    // Redirigir si el enlace existe
    if (linkDatabase[path]) {
      return Response.redirect(linkDatabase[path], 302);
    }
    
    // Enlace no encontrado
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
          <title>Enlace No Encontrado</title>
          <style>
              body { 
                  font-family: Arial, sans-serif; 
                  text-align: center; 
                  margin: 50px;
                  background-color: #f5f5f5;
              }
              .not-found { 
                  background: white;
                  padding: 40px;
                  border-radius: 8px;
                  display: inline-block;
              }
              a { color: #007cba; }
          </style>
      </head>
      <body>
          <div class="not-found">
              <h1>❌ Enlace no encontrado</h1>
              <p>El enlace <strong>/${path}</strong> no existe en la base de datos.</p>
              <p><a href="/">← Volver al inicio</a></p>
          </div>
      </body>
      </html>
    `, { 
      status: 404,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}
