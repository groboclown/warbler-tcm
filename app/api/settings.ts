import { readJsonFile, writeJsonFile } from './files'
import { join } from 'path'
import { app, remote } from 'electron'

export class Settings {
  source: string;
  settings: any = {};

  load(): Promise<Settings> {
    return readJsonFile(this.source)
      .then((res: object) => {
        this.settings = res
        return this
      })
      .catch(() => {
        this.settings = {}
        return this
      })
  }
  save(): Promise<Settings> {
    return writeJsonFile(this.source, this.settings)
      .then(() => {
        return this
      })
  }
  get<T>(part: string, key: string, def?: T): T {
    if (this.settings[part] == undefined
        || this.settings[part] == null
        || !(this.settings[part] instanceof Object)
        || this.settings[part][key] == undefined
        || this.settings[part][key] == null) {
      return def as T
    }
    return this.settings[part][key]
  }
  put<T>(part: string, key: string, val: T): Settings {
    if (this.settings[part] == undefined || this.settings[part] == null) {
      this.settings[part] = {}
    }
    this.settings[part][key] = val
    return this
  }
}

const GLOBAL_SETTINGS: Settings = new Settings()

function getSettings(): Settings {
  if (!GLOBAL_SETTINGS.source) {
    GLOBAL_SETTINGS.source = getSettingsFilename()
  }
  return GLOBAL_SETTINGS
}

export function loadSettings(): Promise<Settings> {
  return getSettings().load()
}

function getSettingsFilename(): string {
  if (!remote) {
    return join(app.getPath('userData'), 'settings.json')
  }
  return join(remote.app.getPath('userData'), 'settings.json')
}
