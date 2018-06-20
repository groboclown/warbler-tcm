
//import { statDir } from '../files'
import { loadSettings, ProjectData } from '../settings'
import { EXTENSION } from '../model/marshal'
import * as path from 'path'
import * as scm from '../scm'
import * as EventEmitter from 'events'
export { ProjectData } from '../settings'

const ATTACHED_PROJECTS_UPDATED_EVENT = 'updated-attached-projects'
const REQUEST_VIEW_PROJECT_DETAILS_EVENT = 'request-view-project'
const PROJECT_SCM_CHANGED_EVENT = 'project-scm-changed'
const TEST_PLAN_PROJECT_CHANGED_EVENT = 'project-test-plan-changed'

const PROJECT_EMITTER = new EventEmitter()

// ------------------------------------------------------------------------

export class AttachedProjectsUpdated {
  constructor(public readonly projects: ProjectData[]) {}
}

export interface AttachedProjectsUpdatedListener {
  (event: AttachedProjectsUpdated): void
}

export function createAttachedProject(folderName: string): Promise<ProjectData> {
  return loadSettings().then((s) => {
    // Don't allow duplicate folders attached.
    const attached = s.attachedProjects()
    for (let i = 0; i < attached.length; i++) {
      if (attached[i].path == folderName) {
        return attached[i]
      }
    }
    let ret = s.newAttachedProject(folderName)
    PROJECT_EMITTER.emit(ATTACHED_PROJECTS_UPDATED_EVENT, new AttachedProjectsUpdated(s.attachedProjects()))
    return s.save().then(() => ret)
  })
}

export function getAttachedProjects(): Promise<ProjectData[]> {
  return loadSettings().then((s): ProjectData[] => {
    return s.attachedProjects()
  })
}

export function removeAttachedProject(project: ProjectData): Promise<void> {
  return loadSettings()
    .then((s) => {
      let projects = s.attachedProjects()
      for (let i = 0; i < projects.length; i++) {
        if (projects[i].path == project.path) {
          projects.splice(i, 1)
          i--
        }
      }
      PROJECT_EMITTER.emit(ATTACHED_PROJECTS_UPDATED_EVENT, new AttachedProjectsUpdated(projects))
      return s.save()
    })
    .then(() => {})
}

export function update(): Promise<void> {
  return loadSettings()
    .then((s) => {
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

// ------------------------------------------------------------------------

export interface RequestViewProjectDetailsListener {
  (project: ProjectData): void
}

export function sendRequestViewProjectDetails(project: ProjectData) {
  PROJECT_EMITTER.emit(REQUEST_VIEW_PROJECT_DETAILS_EVENT, project)
}

export function addRequestViewProjectDetails(listener: RequestViewProjectDetailsListener) {
  PROJECT_EMITTER.addListener(REQUEST_VIEW_PROJECT_DETAILS_EVENT, listener)
}

export function removeRequestViewProjectDetails(listener: RequestViewProjectDetailsListener) {
  PROJECT_EMITTER.removeListener(REQUEST_VIEW_PROJECT_DETAILS_EVENT, listener)
}


// ------------------------------------------------------------------------

export interface ProjectScmChangedListener {
  (rootFile: string): void
}

export function addProjectScmChangedListener(listener: ProjectScmChangedListener) {
  PROJECT_EMITTER.addListener(PROJECT_SCM_CHANGED_EVENT, listener)
}

export function removeProjectScmChangedListener(listener: ProjectScmChangedListener) {
  PROJECT_EMITTER.removeListener(PROJECT_SCM_CHANGED_EVENT, listener)
}


// ------------------------------------------------------------------------

export interface TestPlanProjectChangedEvent {
  testPlanFile: string
  oldProjectRoot: string | null
  newProjectRoot: string | null
}

export interface TestPlanProjectChangedListener {
  (event: TestPlanProjectChangedEvent): void
}

export function sendTestPlanProjectChanged(event: TestPlanProjectChangedEvent) {
  PROJECT_EMITTER.emit(TEST_PLAN_PROJECT_CHANGED_EVENT, event)
}

export function addTestPlanProjectChangedListener(listener: TestPlanProjectChangedListener) {
  PROJECT_EMITTER.addListener(TEST_PLAN_PROJECT_CHANGED_EVENT, listener)
}

export function removeTestPlanProjectChangedListener(listener: TestPlanProjectChangedListener) {
  PROJECT_EMITTER.removeListener(TEST_PLAN_PROJECT_CHANGED_EVENT, listener)
}


// ------------------------------------------------------------------------


export class Project {
  readonly name: string
  readonly rootFolder: string
  projectFiles: scm.FileState[]
  planFiles: scm.FileState[]
  childProjects: Project[]

  constructor(public readonly attached: ProjectData, readonly isRoot: boolean) {
    this.name = path.basename(attached.path)
    this.rootFolder = attached.path
  }

  refresh(): Promise<Project> {
    // console.log(`Refreshing project ${this.rootFolder}`)
    return scm.getActiveScm(this.rootFolder)
      .then((impl: scm.ScmApi) => {
        // console.log(`Loading files from ${this.rootFolder}`)
        return impl.listFilesIn(this.rootFolder)
      })
      .then((stats: scm.FileState[]) => {
        this.projectFiles = []
        this.planFiles = []
        this.childProjects = []
        let dirs: Promise<Project>[] = []
        stats.forEach((stat: scm.FileState) => {
          // TODO possibly monitor the files.
          if (stat.isDirectory && stat.status != 'ignore') {
            // console.log(`Adding child project ${stat.file}`)
            dirs.push(new Project({
              path: stat.file,
              scm: this.attached.scm
            }, false).refresh())
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
        // console.log(`Loaded child projects (${children.length}) for ${this.name}`)
        this.childProjects = children
        return this
      })
  }


  unmount() {
    // FIXME stop listening to file events in the directory.
  }
}
