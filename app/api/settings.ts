import { readJsonFile, writeJsonFile } from './files'
import { join } from 'path'
import { app, remote } from 'electron'
import { SettingsData, WindowData, ProjectData,
  DEFAULT_DATA, DEFAULT_PROJECT_DATA } from './model/settings'
export { SettingsData, ProjectData } from './model/settings'

export class Settings {
  source: string;
  private data: SettingsData = {}

  load(): Promise<Settings> {
    return readJsonFile(this.source)
      .then((res: object) => {
        this.data = res
      })
      .catch(() => {
        this.data = {}
      })
      .then(() => {
        return this
      })
  }
  save(): Promise<Settings> {
    console.log(`Saving settings to ${this.source}`)
    return writeJsonFile(this.source, this.data)
      .then(() => {
        return this
      })
  }
  window(): WindowData {
    if (!this.data.window) {
      this.data.window = Object.assign({}, DEFAULT_DATA.window)
    }
    return this.data.window
  }
  attachedProjects(): ProjectData[] {
    if (!this.data.attachedProjects) {
      this.data.attachedProjects = []
    }
    return this.data.attachedProjects
  }
  newAttachedProject(filename: string): ProjectData {
    let ret: ProjectData = Object.assign({}, DEFAULT_PROJECT_DATA)
    ret.path = filename
    ret.scm = this.data.defaultScm
    this.attachedProjects().push(ret)
    return ret
  }
  getAttachedProject(filename: string): ProjectData | null {
    let p = this.attachedProjects()
    for (let i = 0; i < p.length; i++) {
      if (p[i].path == filename) {
        return p[i]
      }
    }
    return null
  }
  getDefaultScm(ifNotSet: string): string {
    return this.data.defaultScm || ifNotSet
  }
  setDefaultScm(scmName: string) {
    this.data.defaultScm = scmName
  }
  debug(): boolean {
    return this.data.debug || false
  }
  setDebug(v: boolean): void {
    this.data.debug = v
  }
  getIdIndex(id: string): number {
    if (!this.data.idIndex) {
      this.data.idIndex = {}
    }
    return this.data.idIndex[id] || 0
  }
  setIdIndex(id: string, index: number) {
    if (!this.data.idIndex) {
      this.data.idIndex = {}
    }
    this.data.idIndex[id] = index
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
    return join(app.getPath('userData'), 'warbler-settings.json')
  }
  return join(remote.app.getPath('userData'), 'warbler-settings.json')
}
