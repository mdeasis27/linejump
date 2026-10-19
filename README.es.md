# Linejump

Una lista de espera de lanzamiento donde los referidos te suben, y los tramposos no. [English](README.md)

**Resultado: `score` 100** en los 7 casos incluidos (`flag_f1` 1, `position_exact` 1). Ejecuta `bun run eval` para reproducirlo. Los registros ocultos no se ven, así que las reglas están implementadas desde el enunciado, no ajustadas a los casos.

## Cómo ejecutarlo

```sh
bun install
bun run dev                      # http://localhost:3000/en/app y /es/app, sin variables de entorno
bun run process fixtures/signups.jsonl [--disposable <archivo>]
bun run eval [--verbose]         # --verbose imprime el puntaje por caso en stderr
bun test && bun run typecheck && bun run lint && bun run build
```

Opcional: define `RESEND_API_KEY` (y `MAIL_FROM`) para enviar de verdad el correo "subiste en la fila". Sin la clave, los mensajes aparecen en la bandeja de salida en pantalla.

## Arquitectura

- `src/engine`: una función pura convierte todo el registro en la fila (marcas, códigos, posiciones, evidencia). Todo lo demás la usa.
- `src/cli`: `process` y `eval`, envoltorios finos. stdout es solo JSON, los errores van a stderr con código de salida 1.
- `src/demo`: cursor de repetición, detección de "subió" y ayudas de ráfaga para la página.
- `src/components/TryIt.tsx`: el producto (repetición, agregar inscripciones, vista de administración, bandeja de salida).
- `src/app/[lang]`: página, imagen OG por idioma. `src/proxy.ts` hace las redirecciones de idioma y los 404. `src/app/api/notify`: correo real, apagado sin clave.
- `src/i18n`: un solo `Record<"en" | "es", Dictionary>` tipado.
- Documentos: `GLOSSARY.md`, `docs/adr/`, plan en `.scratch/linejump/`, identidad en `DESIGN.md`.

## Compromisos

- **Recalcular todo en cada cambio.** Simple y no puede divergir de la CLI calificada. Sirve para miles de líneas, no para millones.
- **Librería SHA-256 síncrona** en vez de Web Crypto, para que un solo motor corra en Bun y en el navegador (ADR-0002).
- **Estado de la demo en el navegador** (`localStorage`), sin base de datos, porque la app debe funcionar sin configurar nada (ADR-0003).

## Lo que no funcionó

- Pasar el diccionario de la página del servidor al componente cliente falló: contiene funciones. Ahora el cliente busca el diccionario por idioma.
- El puerto 3103 ya estaba ocupado por un proceso ajeno en mi máquina, así que verifiqué el servidor de desarrollo en otro puerto.
- Mi primera prueba de "un referido válido te sube" ponía al referidor primero en la fila, así que nada podía cambiar. Ahora la prueba lo coloca en medio.
