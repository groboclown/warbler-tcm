
import { Settings, loadSettings } from '../settings'
import * as api from './api'
import LocalScm from './fs-scm'
import GitScm from './git-cli'

export * from './api'

interface CachedScm {
  [propertyKey: string]: api.ScmApi
}

const CACHED_SCMS: CachedScm = {}

export function getActiveScm(projectPath: string | null): Promise<api.ScmApi> {
  return loadSettings().then((settings: Settings): api.ScmApi => {
    let scmName: string | undefined = undefined
    if (projectPath) {
      let projectSettings = settings.getAttachedProject(projectPath)
      scmName = projectSettings ? projectSettings.scm : undefined
    }
    scmName = scmName ? scmName : settings.getDefaultScm('fs')
    let ret: api.ScmApi | undefined = CACHED_SCMS[scmName]
    if (ret) {
      return ret
    }
    if ('fs' == scmName) {
      ret = new LocalScm()
    } else if ('git' == scmName) {
      ret = new GitScm()
    } else {
      throw new Error(`unknown SCM implementation ${scmName}`)
    }
    CACHED_SCMS[scmName] = ret
    return ret
  })
}

export function setGlobalDefaultScm(scmName: string): Promise<void> {
  if (SCMS.filter((d) => { return d.name == scmName }).length <= 0) {
    return Promise.reject(`Unknown scm ${scmName}`)
  }
  return loadSettings()
    .then((settings) => {
      settings.setDefaultScm(scmName)
    })
}

export function setActiveScm(projectPath: string, scm: api.ScmDescription): Promise<void> {
  if (SCMS.filter((d) => { return d.name == scm.name }).length <= 0) {
    return Promise.reject(`Unknown scm ${scm.name}`)
  }
  return loadSettings()
    .then((settings) => {
      (settings.getAttachedProject(projectPath)
        || settings.newAttachedProject(projectPath)).scm = scm.name
      return settings.save()
    })
    .then(() => {})
}

export function getDefaultScmName(): string {
  return 'fs'
}

const SCMS: api.ScmDescription[] = [{
  name: 'fs', description: 'None',
}, {
  name: 'git', description: 'Git'
}]

// Returns a promise in case we ever use modules to load them.
export function getSupportedScms(): Promise<api.ScmDescription[]> {
  return Promise.resolve(SCMS)
}
