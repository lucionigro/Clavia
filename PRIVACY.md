# Privacidad

Clavia no requiere cuenta, micrófono ni claves API. No incorpora publicidad, analítica, telemetría ni sincronización en servidores.

- Progreso, preferencias, instrumento, diario e historial se guardan en localStorage.
- Los arreglos importados se guardan en IndexedDB.
- MIDI recibe notas, velocidades y mensajes de pedal del dispositivo seleccionado. No graba el sonido del micrófono ni sube la ejecución.
- Los archivos MusicXML, MXL, MIDI y las copias se leen y validan en el equipo. No se consultan DTD externos.
- La app empaqueta fuentes, sintetizador y contenido, y funciona sin conexión. Los enlaces de documentación/GitHub se abren en el navegador cuando los elegís; esos sitios tienen sus propias políticas.
- El modo navegador necesita el servidor local; al desarrollar o descargar dependencias/actualizaciones intervienen GitHub, npm u otros proveedores de herramientas. Eso es independiente del guardado de práctica.

No hay recuperación mediante una cuenta. Borrar los datos del navegador o el directorio de usuario de la app elimina ese guardado. Exportá una copia completa antes de cambiar de equipo o reinstalar. Las copias contienen información de tu práctica y el texto de tu diario: tratá esos archivos como privados y no los publiques sin revisarlos.

El repositorio distribuye código, contenido original y ejemplos. No necesita ni debe contener perfiles reales, diarios, partituras personales, credenciales o directorios de usuario. Las pruebas y la demo usan datos de ejemplo aislados. La grabación de demo no toma audio del micrófono.
