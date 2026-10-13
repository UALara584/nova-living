# NOVA Living — web de domótica (proyecto conceptual)

Landing page para **NOVA Living**, una marca **ficticia** de domótica creada para un portfolio de diseño y desarrollo web. Los proyectos, escenas y datos de contacto son de demostración.

## Tecnología

- **Vite 5** con HTML, CSS y JavaScript sin framework. La web es 100 % estática.
- **Inter Variable** autoalojada con `@fontsource-variable/inter`, con eje óptico: los titulares usan automáticamente el corte de display.
- Iconos de **Lucide**: solo se incluyen los que se usan.
- Sin backend, sin base de datos y sin claves.

## Comandos

```bash
npm install      # instala dependencias
npm run dev      # servidor de desarrollo en http://localhost:5173
npm run build    # genera la web final en dist/
npm run preview  # sirve dist/ para comprobarla
```

## Estructura

```
nova-living/
├── index.html          ← todo el contenido (textos, imágenes, secciones)
├── src/
│   ├── main.js         ← interacciones: menú, escenas, carrusel, diálogos, formulario
│   └── styles.css      ← estilos (colores y medidas en :root, al principio)
├── public/
│   ├── favicon.svg
│   └── og.jpg          ← imagen para compartir en redes
├── .env.example        ← variable opcional para conectar el formulario
├── package.json
└── README.md
```

## Cómo modificar la web

**Textos:** están en `index.html`, ordenados por secciones (cada una empieza con un comentario como `<!-- HERO -->`).

**Imágenes:** son fotos de Unsplash que se cargan desde `images.unsplash.com`, con varios tamaños (`srcset`) para que cada pantalla descargue el adecuado.
- Para cambiar una, busca su identificador (por ejemplo `photo-1600607687939-ce8a6c25118c`) en `index.html`. Sustitúyelo en **todas** sus apariciones dentro de esa etiqueta `<img>`: en `src` y en `srcset`.
- Si prefieres imágenes propias, guárdalas en `public/img/` y usa rutas como `/img/salon.webp`.
- Si una imagen no carga, su hueco muestra un fondo gris neutro y el texto «Imagen no disponible».

**Escenas (sección «Un hogar que entiende tu ritmo»):** los textos de cada escena están en el bloque `<script type="application/json" id="modes-data">` de `index.html`. El aspecto de cada escena (brillo y tono de la foto) se define en `styles.css`, en las reglas `.mode-scene[data-scene="…"]`.

**Datos de contacto:** cambia el correo, el teléfono y el horario en la sección `<!-- CONTACTO -->` de `index.html`. Cambia también `CONTACT_EMAIL` en `src/main.js`, que es el correo que usa el botón «Abrir en mi correo».

**Colores y tipografía:** están en las variables de `:root`, al principio de `src/styles.css`.

## Formulario de contacto

El formulario valida todos los campos en el navegador. **Sin configuración adicional no envía nada**: al pulsar «Enviar mensaje», avisa de que no está conectado y ofrece abrir la aplicación de correo con el mensaje ya redactado.

Para recibir los mensajes de verdad:

1. Crea un formulario gratuito en un servicio que acepte peticiones POST con JSON, por ejemplo [Formspree](https://formspree.io). Copia la URL que te da (`https://formspree.io/f/xxxxxxx`).
2. En Cloudflare Pages, abre el proyecto y ve a **Settings → Variables and Secrets** (o **Environment variables**). Añade `VITE_FORM_ENDPOINT` con esa URL.
3. Vuelve a desplegar. Las variables `VITE_` se incrustan al compilar, así que hace falta un despliegue nuevo.

Para probarlo en local, copia `.env.example` como `.env` y rellena la variable.

## Publicar gratis en Cloudflare Pages

### 1. Crear el repositorio en GitHub
1. Entra en [github.com](https://github.com) y pulsa **New repository**.
2. Ponle un nombre (por ejemplo `nova-living`), déjalo público o privado y créalo **sin** README, para que no choque con el del proyecto.

### 2. Subir el proyecto
Desde la carpeta `nova-living`:

```bash
git init
git add .
git commit -m "NOVA Living: primera versión"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/nova-living.git
git push -u origin main
```

`node_modules/` y `dist/` no se suben: están en `.gitignore` y Cloudflare los genera solo.

### 3. Entrar en Cloudflare
Crea una cuenta gratuita en [dash.cloudflare.com](https://dash.cloudflare.com). En el menú lateral, abre **Workers & Pages** (en algunas cuentas aparece como **Compute → Workers & Pages**).

### 4. Crear el proyecto de Pages
1. Pulsa **Create** y elige la pestaña **Pages**.
2. Elige **Connect to Git** (o **Import an existing Git repository**).
3. Autoriza a Cloudflare a acceder a tu GitHub y selecciona el repositorio `nova-living`.

### 5. Configurar la compilación
| Campo | Valor |
|---|---|
| Framework preset | `Vite` (o `None`) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | vacío (o `nova-living` si el repositorio contiene más carpetas) |

Cloudflare ejecuta `npm install` automáticamente antes de compilar. Si quieres conectar el formulario, añade aquí la variable `VITE_FORM_ENDPOINT`.

### 6. Desplegar
Pulsa **Save and Deploy**. La primera compilación tarda uno o dos minutos.

### 7. URL pública
Al terminar verás una dirección como `https://nova-living.pages.dev`. Esa es tu web publicada, gratis y con HTTPS. Si quieres, puedes añadir un dominio propio en **Custom domains**.

### 8. Actualizar la web
Cada vez que subas cambios a la rama `main`, Cloudflare vuelve a compilar y publica la nueva versión sola:

```bash
git add .
git commit -m "Describe el cambio"
git push
```

### Opción sin GitHub
Ejecuta `npm run build`. Después, en **Workers & Pages → Create → Pages**, elige **Upload assets** y arrastra la carpeta `dist`. En este modo no hay variables de compilación: si usas el formulario, crea antes el archivo `.env`.

## Notas

- La imagen para redes (`og.jpg`) usa una ruta relativa. Cuando tengas la URL definitiva, cambia `content="/og.jpg"` en `index.html` por la dirección completa (por ejemplo `https://nova-living.pages.dev/og.jpg`). Algunas redes lo necesitan.
- La web no usa cookies ni analítica. Las fotos se cargan desde Unsplash, como se explica en la política de privacidad de la propia web.
- No necesita `_redirects`, Workers ni funciones: es una sola página y todos los enlaces internos son anclas (`#soluciones`, `#contacto`…).
