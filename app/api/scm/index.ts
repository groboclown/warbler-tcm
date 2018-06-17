
import { Settings, loadSettings } from '../settings'
import * as api from './api'
import LocalScm from './fs-scm'

export * from './api'

interface CachedScm {
  [propertyKey: string]: api.ScmApi
}

const CACHED_SCMS: CachedScm = {}

// FIXME this should use project settings?
export function getActiveScm(): Promise<api.ScmApi> {
  return loadSettings().then((settings: Settings): api.ScmApi => {
    let scmName: string = settings.get('scm', 'active', 'fs')
    let ret: api.ScmApi | undefined = CACHED_SCMS[scmName]
    if (ret) {
      return ret
    }
    if ('fs' == scmName) {
      ret = new LocalScm()
    } else {
      throw new Error(`unknown SCM implementation ${scmName}`)
    }
    CACHED_SCMS[scmName] = ret
    return ret
  })
}

export function setActiveScm(scm: api.ScmDescription): Promise<void> {
  return loadSettings()
    .then((settings) => {
      return settings
        .put('scm', 'active', scm.name)
        .save()
    })
    .then(() => {})
}

export function getDefaultScmName(): string {
  return 'fs'
}

// Returns a promise in case we ever use modules to load them.
export function getSupportedScms(): Promise<api.ScmDescription[]> {
  return Promise.resolve([{
    name: 'fs', description: 'None'
  }])
}
