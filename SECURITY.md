# Seguridad

No incluyas credenciales, perfiles ni partituras privadas en un reporte. Para una vulnerabilidad, usá el reporte privado de GitHub si está disponible; evitá publicar detalles explotables o datos personales en un issue público. Indicá versión, sistema, entrada mínima y comportamiento observado.

El renderer de Electron tiene sandbox, contextIsolation y Node deshabilitado. Solo sirve una lista explícita de recursos; no carga sitios externos en la ventana. Los enlaces conocidos se abren fuera de la app. La política CSP restringe scripts y conexiones al origen local. No hay IPC que exponga el sistema de archivos.

Los importadores tienen límites de bytes, compases y notas; se rechazan entidades XML, varios tipos de entradas incompatibles y archivos MIDI inconsistentes. Las copias JSON se validan antes de almacenarse. La aplicación no ejecuta contenido de archivos importados.

Los paquetes comunitarios carecen de firma/notarización comercial. La integridad de Release se puede verificar con sus sumas SHA-256, pero eso no sustituye la confianza en el origen ni una firma de editor. Las dependencias se fijan mediante el lockfile; reportar una compilación no implica que todo dispositivo o sistema haya sido probado físicamente.
