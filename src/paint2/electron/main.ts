import { app, BrowserWindow, Menu, protocol } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import { readFile } from "node:fs/promises";
import mime from "mime-types";
import { watch } from "node:fs";



if (started) {
    app.quit();
}

let _mainwin = null as null | BrowserWindow;

if (_DEV) {
    watch(import.meta.dirname, {recursive: true}, ()=>{
        _mainwin?.webContents.reloadIgnoringCache();
        console.log("reload");
    });

    console.log(`watching ${import.meta.dirname}`);
}

Menu.setApplicationMenu(null);

protocol.registerSchemesAsPrivileged([
    {
        scheme: "app",
        privileges: {
            standard: true,
            secure: true,
            supportFetchAPI: true,
            corsEnabled: true,
        },
    },
]);

const _create_window = () => {
    const _always_on_top = app.isPackaged ? false : true;

    _mainwin = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        alwaysOnTop: _always_on_top,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    _mainwin.loadURL("app://paint2/app.html");
    if (_DEV) {
        _mainwin.webContents.openDevTools();
    }
};

app.whenReady().then(() => {
    protocol.handle("app", async(_req)=>{
        const _url = new URL(_req.url);

        if (!_url.pathname || _url.pathname === "/") {
            return new Response(null, {
                status: 204,
            });
        }

        const _basename = path.basename(_url.pathname);

        if (_DEV) {
            console.log(`request: ${_url.href}`);
        }

        const _file_path  = path.join(import.meta.dirname, _url.pathname);
        let _content_type = "application/octet-stream";
        const _type       = mime.contentType(_file_path);
        if (typeof _type === "string") {
            _content_type = _type;
        }

        const _data
            = await readFile(_file_path);

        return new Response(_data, {
            headers: {
                "Content-Type": _content_type,
            },
        })
    });

    _create_window();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            _create_window();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});