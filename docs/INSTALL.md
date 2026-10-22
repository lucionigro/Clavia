# Instalar y conectar tu teclado

Descargá un paquete desde [Releases oficiales de este repositorio](https://github.com/lucionigro/Clavia/releases/latest). Verificá que el sistema y arquitectura coincidan con tu computadora. Los archivos `SHA256SUMS.txt` permiten comparar la integridad de las descargas.

## Mac

Elegí **arm64** para Apple Silicon (M1 y posteriores) y **x64** para Intel. Abrí el DMG y arrastrá Clavia a Aplicaciones. La distribución comunitaria todavía no tiene firma Developer ID ni notarización; Gatekeeper puede bloquearla. No se modifica la configuración de seguridad del sistema. Si no aceptás ejecutar una compilación sin notarizar, podés revisar el código y usar el modo navegador o compilarla vos.

Si descargaste el archivo de este repositorio y decidís abrirlo, intentá iniciar Clavia una vez. Después, en **Configuración del Sistema → Privacidad y seguridad**, buscá el aviso de Clavia y elegí **Abrir igualmente / Abrir de todos modos**; confirmá **Abrir** si aparece. La opción crea una excepción para esa app. Los nombres pueden variar con el idioma y versión; seguí la [guía oficial de Apple](https://support.apple.com/es-lamr/102445). Si el mensaje dice que el archivo está dañado o detecta una amenaza, volvé a descargar y comprobar su SHA256 en lugar de quitar protecciones.

## Windows

Ejecutá el instalador x64. Se instala para tu usuario y crea accesos en el menú Inicio. El paquete no tiene un certificado comercial Authenticode; SmartScreen o el antivirus pueden advertir sobre un editor desconocido. No desactives protecciones globales para instalarla.

Si aparece el aviso de aplicación desconocida, revisá que el archivo provenga de esta release y su SHA256. Cuando Windows ofrezca **Ejecutar de todos modos**, podés elegirlo si decidís confiar en esa descarga. Smart App Control o la política de una computadora administrada pueden impedirlo sin ofrecer esa opción; en ese caso usá el modo navegador. [Información oficial de Microsoft sobre firma y reputación](https://learn.microsoft.com/windows/apps/package-and-deploy/smartscreen-reputation).

## Linux

El `.deb` se instala con el administrador de paquetes de distribuciones compatibles. Para AppImage, habilitá permiso de ejecución para ese archivo desde sus propiedades y abrilo. Algunas distribuciones necesitan FUSE o ejecutar AppImage extraída. El sonido y MIDI dependen de la configuración de audio/ALSA y permisos del usuario. Una compilación exitosa no demuestra compatibilidad física con todas las distribuciones.

## El primer inicio

El asistente pregunta cantidad de teclas (25, 32, 37, 49, 61, 73, 76 u 88), registro, modelo opcional, experiencia, foco musical y meta diaria. La cantidad no permite inferir con certeza la octava inicial: revisá la nota grave o usá la detección MIDI. Do4 es MIDI 60. Todo se puede cambiar en Ajustes.

1. Encendé el teclado y conectalo con un cable USB **que transmita datos**, según los puertos de instrumento y computadora. El conector varía por modelo. No hace falta una interfaz de audio para recibir MIDI por USB.
2. Tocá **Buscar mi teclado MIDI**. En el modo navegador usá Chrome/Edge con Web MIDI y concedé el permiso. La app de escritorio integra Chromium y solicita acceso MIDI sin SysEx.
3. En Ajustes seleccioná el dispositivo si hay varios. Tocá una nota y verificá nombre y velocidad en el monitor.
4. Si el instrumento suena por sus parlantes y escuchás duplicación, elegí **Solo mi instrumento físico**. La guía y el oído siguen teniendo sonido.
5. Si elegís escuchar en Clavia, seleccioná **Piano de cola**, **Piano suave**, **Piano eléctrico** u **Órgano** y usá **Probar sonido**. La preferencia se conserva y también se aplica a las guías. Piano de cola y suave usan muestras locales; eléctrico y órgano usan síntesis. Podés cambiarlo en Ajustes o en Practicar → Teclado libre.
6. Detectá la tecla más grave y verificá que el rango corresponda al instrumento. La app advierte cuando una pieza sale de ese registro y nunca transporta una obra en silencio.

Si no aparece: revisá encendido, cable de datos, puerto USB, permisos y si otro programa está usando el dispositivo. Algunos instrumentos requieren el controlador del fabricante. MIDI transporta mensajes; el cable no convierte automáticamente el sonido del teclado en audio grabado. Los teclados sin USB MIDI necesitan una interfaz MIDI compatible.

## Llevar tus datos a otra instalación

En **Ajustes → Exportar copia completa**, guardá el JSON y restauralo con **Importar copia** en el otro navegador o app. Incluye avances, favoritos, perfil, diario y arreglos importados. La restauración reemplaza el progreso y combina los arreglos por identificador. Las copias anteriores siguen siendo compatibles.

No hay sincronización en la nube ni recuperación mediante una cuenta. Conservá también tus MIDI/MusicXML originales: Clavia guarda una adaptación para práctica, no el archivo original completo.
