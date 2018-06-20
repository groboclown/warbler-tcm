

export interface WindowData {
  x?: number
  y?: number
  width?: number
  height?: number
  zoom?: number
}

export interface IdIndex {
  [idKey: string]: number
}

export interface ProjectFilter {
  hideDeletedFiles?: boolean
  hideNonPlanFiles?: boolean
}

export interface ProjectData {
  path: string
  filter?: ProjectFilter
  scm?: string

  // TODO expanded tree structure.
}

export interface SettingsData {
  window?: WindowData
  attachedProjects?: ProjectData[]
  defaultScm?: string
  debug?: boolean
  idIndex?: IdIndex
  openedTabs?: string[]
  theme?: string
}

export const DEFAULT_DATA: SettingsData = {
  window: {
    x: undefined, y: undefined,
    width: 800, height: 600,
    zoom: 1.0
  },
  debug: false,
  theme: 'dark'
}

export const DEFAULT_PROJECT_DATA: ProjectData = {
  path: '',
  filter: { hideDeletedFiles: true, hideNonPlanFiles: true },
}
