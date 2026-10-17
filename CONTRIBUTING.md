# Contribuir a Clavia

Clavia usa módulos JavaScript nativos, HTML, CSS, Web Audio, Web MIDI y Electron. No necesita backend de cuentas. Conservá la separación entre datos locales de usuarios y recursos públicos.

## Ejecutar y verificar

```sh
npm ci
npm run check
npm test
npx playwright install chromium --with-deps
npm run test:ui
```

En macOS, la configuración usa Chrome instalado por defecto; podés indicar `CHROME_PATH`. En Linux/CI usa el Chromium descargado por Playwright. El servidor de UI debe estar activo (`npm start`, puerto 4173). Los tests usan perfiles aislados.

`npm run package:mac` genera el DMG arm64. Después `npm run test:desktop` abre el paquete con un directorio temporal, verifica el origen seguro, la API MIDI, almacenamiento y funcionamiento básico. No usa tus perfiles reales ni demuestra conexión física de un teclado. Para otras arquitecturas/sistemas usá electron-builder o la automatización de Releases.

## Arquitectura

- `curriculum.js`, `advanced-curriculum.js`: lecciones originales y scores pedagógicos.
- `learning.js`, `progress.js`: plan, evidencia y validación compatible con copias anteriores.
- `guided-score.js`: evaluación determinista; separar modo a tu ritmo de precisión con pulso.
- `guided-ui.js`: notación de práctica, cascada, pasajes y atril.
- `musicxml-file.js`, `midi-file.js`: lectura local; límites explícitos y rechazo de casos incompatibles.
- `library-store.js`: validación y persistencia; `import-dialog.js` revisa manos/rango antes de practicar.
- `instrument.js`: primer inicio, perfil de instrumento y monitor MIDI.
- `aural-lab.js`, `improvisation.js`: oído activo, creación y exportación propia.
- `desktop/`: renderer aislado, sandbox, protocolo con origen estable y recursos permitidos.

Las notas usan MIDI y tiempos en unidades de negra; Do4 es MIDI 60. Las partituras pueden indicar otro denominador, pero el tempo de práctica se expresa en negras. Una ligadura debe conservar un único ataque en el evaluador aunque se dibuje en varias partes.

## Publicación y privacidad

Usá perfiles de prueba, ejemplos originales y archivos con licencia redistribuible. No agregues `.env`, grabaciones personales, diarios, backups, credenciales ni rutas de directorios personales. `artifacts/`, `dist/` y el material crudo de demo están ignorados. Los binarios y el video se publican como assets de Release; las capturas revisadas de documentación viven en `docs/media/`.

Las canciones comerciales del catálogo son referencias. No agregues letras, grabaciones o transcripciones completas sin autorización redistribuible. Conservá las licencias de fuentes, bibliotecas y ejemplos.

## Regenerar la demo

Con el servidor activo:

```sh
npm run demo:record
npm run demo:render
```

El recorrido usa un contexto nuevo, un cursor visible y acciones reales sobre Clavia. La segunda etapa agrega acercamientos, subtítulos y un fondo de piano sintetizado original. No captura perfiles personales ni micrófono. Revisá principio, medio y final del MP4 antes de subirlo. No grabes una conexión física MIDI como exitosa si solo hay mensajes simulados.
