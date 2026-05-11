# Auditor a11y 🎯

Kit de accesibilidad web con 9 herramientas para auditar páginas en tiempo real, sin necesidad de instalar nada.

**9 herramientas · Sin instalación · Funciona en cualquier web**

---

## ¿Qué es Auditor a11y?

Auditor a11y es un conjunto de **bookmarklets** (pequeños programas que se ejecutan desde la barra de favoritos del navegador) diseñados para **detectar problemas de accesibilidad** en cualquier página web de forma instantánea.

Cada herramienta analiza un aspecto diferente de la accesibilidad, genera un panel visual con los hallazgos y exporta los resultados en JSON para usarlos con IA (Claude, ChatGPT, etc.).

---

## Las 9 herramientas

| Herramienta | Qué analiza | Criterio WCAG |
|-------------|------------|--------------|
| **Headings** | Encabezados: duplicados, saltos de nivel, textos genéricos | 2.4.6, 1.3.1 |
| **Links** | Enlaces: texto vacío, mismo texto diferentes destinos, no descriptivos | 2.4.4, 1.3.1 |
| **Images** | Imágenes: alt text ausente, vacío, o innecesario | 1.1.1 |
| **Forms** | Formularios: inputs sin labels, grupos de radio/checkbox no asociados | 1.3.1, 3.3.2 |
| **Focus** | Navegación con teclado: orden tabindex, focus visible, traps | 2.4.3, 2.4.7 |
| **Landmarks** | Estructura semántica: nav, main, section, roles ARIA | 1.3.1, 2.4.1 |
| **Contrast** | Relación de contraste de colores entre texto y fondo | 1.4.3, 1.4.11 |
| **axe-core** | Auditoría automática profunda de 90+ reglas de accesibilidad | Múltiples |
| **Drag** | Elementos de arrastre sin teclado | 2.1.1 |

---

## Cómo empezar

### 1. Abrir el servidor local

Desde la carpeta del proyecto:

```bash
python3 -m http.server 8000
```

O si prefieres otro puerto:

```bash
python3 -m http.server 8080
```

### 2. Acceder a la página

Abre en tu navegador:

```
http://localhost:8000/page/
```

### 3. Instalar los bookmarklets

- Abre la página en tu navegador
- **Arrastra cualquier botón verde** de la sección "Las 9 herramientas" a la barra de favoritos/bookmarks
- Se instalarán como marcadores en tu navegador

### 4. Usar las herramientas

1. Navega a cualquier página web
2. Haz clic en uno de los bookmarklets que instalaste
3. El análisis se ejecuta y los resultados aparecen en un **panel flotante**
4. Los elementos problemáticos se resaltan en la página con bordes de color
5. Haz clic en "Copiar JSON" para copiar los hallazgos

### 5. Enviar a IA

Pega el JSON en Claude, ChatGPT u otra IA para obtener **recomendaciones de corrección detalladas y priorizadas**.

---

## Qué incluyen los resultados

Cada hallazgo contiene:

```json
{
  "estado": "error|warning|ok",
  "criterio": "2.4.6",
  "titulo": "Encabezados y etiquetas",
  "selector": "h3.card-title",
  "mensaje": "H1 duplicado en la página",
  "sugerencia": "Solo debe haber un H1 por página"
}
```

- **Estado**: severidad (error = WCAG violation, warning = posible problema, ok = correcto)
- **Criterio**: número del criterio WCAG afectado
- **Selector CSS**: exactamente qué elemento reparar
- **Mensaje**: descripción clara del problema
- **Sugerencia**: recomendación de corrección

---

## Arquitectura del proyecto

```
Auditor a11y/
├── Bookmarklets/
│   ├── page/                 # Página web principal
│   │   ├── index.html
│   │   ├── styles.css
│   │   └── script.js
│   ├── src/                  # Código fuente de los bookmarklets
│   │   ├── headings.js
│   │   ├── links.js
│   │   ├── images.js
│   │   ├── forms.js
│   │   ├── focus.js
│   │   ├── landmarks.js
│   │   ├── contrast.js
│   │   ├── axe.js
│   │   ├── drag.js
│   │   └── shared/          # Código compartido
│   │       ├── reporter.js
│   │       ├── overlay.js
│   │       ├── color.js
│   │       └── wcag.js
├── .agents/                  # Skills y agentes de Claude Code
├── agents.md                 # Comportamiento del agente
├── skills-lock.json
└── README.md                # Este archivo
```

---

## Limitaciones conocidas

⚠️ **axe-core**: Necesita cargar de `cdn.jsdelivr.net`. Puede fallar en páginas con CSP estricta.

🔒 **iframes cross-origin**: Los navegadores no permiten analizar iframes de otros dominios.

🎨 **Contraste**: Puede ser impreciso en imágenes de fondo, gradientes y transparencias complejas.

🔍 **Detección inicial**: Los análisis automáticos son una **primera capa**. Siempre complementa con:
- Pruebas manuales
- Lector de pantalla (NVDA, JAWS, VoiceOver)
- Navegación solo con teclado
- Validadores manuales

---

## Casos de uso

✅ **Auditoría rápida**: Detectar problemas de accesibilidad en minutos  
✅ **Control de calidad**: Validar accesibilidad antes de lanzar  
✅ **Integración con IA**: Pasar hallazgos a Claude para planes de corrección automáticos  
✅ **Educación**: Enseñar accesibilidad a equipos de producto  
✅ **Compliance**: Verificar conformidad con WCAG 2.1 AA/AAA  

---

## Criterios WCAG cubiertos

- **1.1.1**: Contenido no textual (imágenes)
- **1.3.1**: Información y relaciones (semántica, headings, landmarks)
- **1.4.3**: Contraste (mínimo)
- **1.4.11**: Contraste no textual
- **2.1.1**: Teclado (drag)
- **2.4.1**: Bypass de contenido (landmarks)
- **2.4.3**: Orden de focus (tabindex)
- **2.4.4**: Propósito del enlace (link text)
- **2.4.6**: Encabezados y etiquetas
- **2.4.7**: Indicador de focus visible
- **3.3.2**: Etiquetas (labels en formularios)
- **4.1.2**: Nombre, rol, valor (ARIA, semántica)

---

## Referencias

- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [axe-core Rules](https://dequeuniversity.com/rules/axe/)
- [Web Accessibility Initiative (WAI)](https://www.w3.org/WAI/)

---

## Notas para desarrolladores

- **Comportamiento**: El agente usa español, lenguaje no técnico, e itera internamente si encuentra errores
- **Bookmarklets**: Se generan dinámicamente desde `script.js` leyendo los archivos de `src/`
- **Panel flotante**: Usa `overlay.js` para el UI y `reporter.js` para la lógica
- **Colores**: Definidos en `shared/color.js`
- **WCAG**: Metadatos en `shared/wcag.js`

---

**Hecho con ❤️ para accesibilidad web**
