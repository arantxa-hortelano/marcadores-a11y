# Agente Auditor: Guía de Uso

## Iniciar una auditoría

Para auditar una página web, proporciona:

```
Audita esta página: [URL]
```

Ejemplo:
```
Audita esta página: https://ejemplo.com/contacto
```

## Auditorías especializadas

Puedes solicitar auditorías enfocadas:

```
Audita la accesibilidad del formulario en: [URL]
Audita la navegación por teclado en: [URL]
Audita los contrastes de color en: [URL]
```

## Opciones avanzadas

```
Audita esta página (solo headings, links, y contraste): [URL]
Genera un reporte completo con todas las herramientas: [URL]
```

## Qué esperar

El agente te proporcionará:

1. **Hallazgos críticos** - Problemas que afectan significativamente la accesibilidad
2. **Hallazgos mayores** - Problemas importantes que deberían corregirse
3. **Hallazgos menores** - Mejoras sugeridas
4. **Recomendaciones** - Pasos específicos para resolver cada problema
5. **Recursos WCAG** - Referencias a los criterios aplicables

## Interpretación de resultados

- **CRÍTICO**: No accesible para usuarios con discapacidades, afecta la usabilidad
- **MAYOR**: Afecta la experiencia de accesibilidad significativamente
- **MENOR**: Mejora sugerida, no bloquea el acceso

## Exportar resultados

El agente puede generar JSON estructurado para integrar con otras herramientas o compartir resultados.

Solicita: "Exporta los resultados en JSON"
