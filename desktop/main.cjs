const {
  app,
  BrowserWindow,
  protocol,
  session,
  shell,
  Menu,
  dialog,
} = require("electron");
const { readFile } = require("node:fs/promises");
const path = require("node:path");
const { allowed, mime, csp, isLocal, isSafeExternal } = require("./policy.cjs");
// Un origen estable conserva localStorage e IndexedDB entre actualizaciones.
protocol.registerSchemesAsPrivileged([
  {
    scheme: "clavia",
    privileges: { standard: true, secure: true, supportFetchAPI: true },
  },
]);
if (process.env.CLAVIA_TEST_PROFILE)
  app.setPath("userData", path.resolve(process.env.CLAVIA_TEST_PROFILE));
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  let main;
  app.on("second-instance", () => {
    if (main) {
      if (main.isMinimized()) main.restore();
      main.show();
      main.focus();
    }
  });
  async function createWindow() {
    main = new BrowserWindow({
      width: 1360,
      height: 950,
      minWidth: 720,
      minHeight: 580,
      title: "Clavia",
      backgroundColor: "#f7f5ee",
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        webSecurity: true,
      },
    });
    main.webContents.setWindowOpenHandler(({ url }) => {
      if (isSafeExternal(url)) shell.openExternal(url);
      return { action: "deny" };
    });
    main.webContents.on("will-navigate", (event, url) => {
      if (!isLocal(url)) event.preventDefault();
    });
    main.webContents.on("will-attach-webview", (event) =>
      event.preventDefault(),
    );
    main.webContents.on("render-process-gone", () =>
      dialog.showErrorBox(
        "Clavia se interrumpió",
        "Cerrá y volvé a abrir la app. Tu progreso guardado sigue en este equipo.",
      ),
    );
    await main.loadURL("clavia://app/index.html");
  }
  app
    .whenReady()
    .then(async () => {
      protocol.handle("clavia", async (request) => {
        const url = new URL(request.url),
          file = url.pathname === "/" ? "/index.html" : url.pathname;
        if (
          request.method !== "GET" ||
          !isLocal(request.url) ||
          !allowed.includes(file)
        )
          return new Response("No encontrado", { status: 404 });
        try {
          return new Response(
            await readFile(path.join(__dirname, "..", file.slice(1))),
            {
              headers: {
                "content-type":
                  mime[path.extname(file)] || "application/octet-stream",
                "content-security-policy": csp,
                "x-content-type-options": "nosniff",
              },
            },
          );
        } catch {
          return new Response("No encontrado", { status: 404 });
        }
      });
      // Chromium/Electron usa el nombre midiSysex también para la solicitud MIDI básica.
      // El renderer solicita sysex:false; no envía mensajes al instrumento.
      session.defaultSession.setPermissionCheckHandler(
        (contents, permission, origin) =>
          isLocal(origin) &&
          isLocal(contents?.getURL()) &&
          ["midi", "midiSysex"].includes(permission),
      );
      session.defaultSession.setPermissionRequestHandler(
        (contents, permission, callback) =>
          callback(
            isLocal(contents.getURL()) &&
              ["midi", "midiSysex"].includes(permission),
          ),
      );
      // Los vínculos se abren en el navegador del sistema; la ventana solo carga archivos incluidos.
      Menu.setApplicationMenu(
        Menu.buildFromTemplate([
          {
            label: "Clavia",
            submenu: [
              { role: "about" },
              { type: "separator" },
              { role: "hide" },
              { role: "hideOthers" },
              { type: "separator" },
              { role: "quit" },
            ],
          },
          {
            label: "Edición",
            submenu: [
              { role: "undo" },
              { role: "redo" },
              { type: "separator" },
              { role: "cut" },
              { role: "copy" },
              { role: "paste" },
              { role: "selectAll" },
            ],
          },
          {
            label: "Ver",
            submenu: [
              { role: "reload" },
              { role: "resetZoom" },
              { role: "zoomIn" },
              { role: "zoomOut" },
              { role: "togglefullscreen" },
            ],
          },
          {
            label: "Ventana",
            submenu: [
              { role: "minimize" },
              { role: "zoom" },
              { role: "front" },
            ],
          },
        ]),
      );
      await createWindow();
      app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
      });
    })
    .catch((error) => {
      dialog.showErrorBox("No se pudo abrir Clavia", error.message);
      app.quit();
    });
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
}
