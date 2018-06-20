/**
 * Centralized handler for the bare-bones electron window.
 */


import { app, BrowserWindow } from 'electron'
import { loadSettings, Settings } from '../settings'

export interface ElectronAppConfig {
  title: string
  home: string
  icon: string
}

export function createElectronApp(config: ElectronAppConfig) {
  return new ElectronApp(config)
}

export class ElectronApp {
  private mainWindow: Electron.BrowserWindow | null

  constructor(private config: ElectronAppConfig) {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on("ready", () => { this.createWindow() })

    // Quit when all windows are closed.
    app.on("window-all-closed", () => {
      // On OS X it is common for applications and their menu bar
      // to stay active until the user quits explicitly with Cmd + Q
      if (process.platform !== "darwin") {
        app.quit()
      }
    })

    app.on("activate", () => {
      // On OS X it"s common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (this.mainWindow === null) {
        this.createWindow()
      }
    })
  }

  private createWindow() {
    // Load the settings, and use those to setup the application.
    initialize()
      .then((settings) => {
        // Create the browser window.
        this.mainWindow = new BrowserWindow({
          show: false,
          width: settings.window().width,
          height: settings.window().height,
          x: settings.window().x,
          y: settings.window().y,
          title: this.config.title,
          icon: `file://${this.config.icon}`
        })

        // zoom = 0 should be invalid, so || is appropriate here.
        this.mainWindow.webContents.setZoomFactor(settings.window().zoom || 1.0)

        // and load the index.html of the app.
        this.mainWindow.loadURL(`file://${this.config.home}`)

        this.mainWindow.webContents.on('did-finish-load', () => {
          if (this.mainWindow != null) {
            this.mainWindow.show();
            this.mainWindow.focus();
          }
        });

        // Open the DevTools.
        if (settings.debug()) {
          this.mainWindow.webContents.openDevTools()
        }

        // Emitted when the window is closed.
        this.mainWindow.on("closed", () => {
          // Dereference the window object, usually you would store windows
          // in an array if your app supports multi windows, this is the time
          // when you should delete the corresponding element.
          this.mainWindow = null
        })

        this.mainWindow.on('ready-to-show', () => {
          if (this.mainWindow != null) {
            this.mainWindow.show()
            this.mainWindow.focus()
          }
        })

        this.mainWindow.on('resize', () => this.saveWindowState())
        this.mainWindow.on('move', () => this.saveWindowState())
        this.mainWindow.on('close', () => this.saveWindowState())
      })
  }


  saveWindowState(): Promise<Settings> {
    if (this.mainWindow == null) {
      return loadSettings()
    }
    let bounds = this.mainWindow.getBounds()
    let webContents = this.mainWindow.webContents
    return loadSettings()
      .then((s) => {
        s.window().height = bounds.height
        s.window().width = bounds.width
        s.window().x = bounds.x
        s.window().y = bounds.y
        s.setDebug(webContents.isDevToolsOpened())
        return getZoomLevel(webContents)
          .then((level: number) => {
            s.window().zoom = level
            return s
          })
      })
      .then((s) => { return s.save() })
  }
}


function initialize(): Promise<Settings> {
  let ret: Promise<any>
  if (process.env.NODE_ENV === 'development') {
    const installer = require('electron-devtools-installer'); // eslint-disable-line global-require

    const extensions = [
      'REACT_DEVELOPER_TOOLS',
      'REDUX_DEVTOOLS'
    ];
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    ret = Promise.all(extensions.map(name => installer.default(installer[name], forceDownload)));
  } else {
    ret = Promise.resolve(null);
  }
  return ret
    .then(() => { return loadSettings() })
}

function getZoomLevel(webContents: Electron.WebContents): Promise<number> {
  return new Promise<number>((resolve: any) => {
    webContents.getZoomLevel((level) => {
      resolve(level)
    })
  })
}
