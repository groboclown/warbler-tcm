
//import { statDir } from '../files'
import { loadSettings } from '../settings'
import { EXTENSION } from '../model/marshal'
import * as path from 'path'
import * as scm from '../scm'
import * as EventEmitter from 'events'

export const ATTACHED_PROJECTS_UPDATED_EVENT = 'updated-attached-projects'

const PROJECT_EMITTER = new EventEmitter()

export interface AttachedProject {
  readonly rootFolder: string
  readonly name: string
}

export class AttachedProjectsUpdated {
  constructor(public readonly projects: AttachedProject[]) {}
}

export interface AttachedProjectsUpdatedListener {
  (event: AttachedProjectsUpdated): void
}

export function createAttachedProject(folderName: string): AttachedProject {
  return {
    rootFolder: folderName,
    name: path.basename(folderName)
  }
}

export function getAttachedProjects(): Promise<AttachedProject[]> {
  return loadSettings().then((s): AttachedProject[] => { return s.get('projects', 'attached') || [] })
}

export function updateAttachedProjects(projects: AttachedProject[]): Promise<void> {
  PROJECT_EMITTER.emit(ATTACHED_PROJECTS_UPDATED_EVENT, new AttachedProjectsUpdated(projects))
  return loadSettings()
    .then((s) => {
      s.put('projects', 'attached', projects)
      return s.save()
    })
    .then(() => {})
}

export function addAttachedProjectsUpdatedListener(listener: AttachedProjectsUpdatedListener) {
  PROJECT_EMITTER.addListener(ATTACHED_PROJECTS_UPDATED_EVENT, listener)
}

export function removeAttachedProjectsUpdatedListener(listener: AttachedProjectsUpdatedListener) {
  PROJECT_EMITTER.removeListener(ATTACHED_PROJECTS_UPDATED_EVENT, listener)
}


export class Project {
  readonly name: string
  readonly rootFolder: string
  projectFiles: scm.FileState[]
  planFiles: scm.FileState[]
  childProjects: Project[]

  constructor(public readonly attached: AttachedProject) {
    this.name = attached.name
    this.rootFolder = attached.rootFolder
  }

  refresh(): Promise<Project> {
    return scm.getActiveScm()
      .then((impl: scm.ScmApi) => {
        return impl.listFilesIn(this.attached.rootFolder)
      })
      .then((stats: scm.FileState[]) => {
        this.projectFiles = []
        this.planFiles = []
        this.childProjects = []
        let dirs: Promise<Project>[] = []
        stats.forEach((stat: scm.FileState) => {
          // TODO possibly monitor the files.
          if (stat.isDirectory && stat.status != 'ignore') {
            dirs.push(new Project({
              name: path.basename(stat.file),
              rootFolder: stat.file
            }).refresh())
          } else {
            if (stat.file.endsWith(EXTENSION)) {
              this.planFiles.push(stat)
            } else {
              this.projectFiles.push(stat)
            }
          }
        })
        return Promise.all(dirs)
      })
      .then((children: Project[]): Project => {
        this.childProjects = children
        return this
      })
  }


  unmount() {
    // FIXME stop listening to file events in the directory.
  }
}
