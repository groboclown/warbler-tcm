import * as scm from '../scm'
import { loadSettings, ProjectData } from '../settings'
import { sendTestPlanProjectChanged } from '../state/projects'
import * as planModel from '../model/plan'
import * as EventEmitter from 'events'
import { readTestPlan, writeTestPlan } from '../model/marshal'
import generateId from '../gen-id'
import * as path from 'path'

const PLAN_EMITTER = new EventEmitter()

const REQUEST_NEW_TEST_PLAN = 'warbler-request-new-test-plan'
const REQUEST_VIEW_TEST_PLAN = 'warbler-request-view-test-plan'
const REQUEST_CLOSE_ACTIVE_TEST_PLAN = 'warbler-request-close-test-plan'
const TEST_PLAN_CLOSED = 'warbler-test-plan-closed'

// ---------------------------------------------------------------------------

export interface RequestNewTestPlanListener {
  (): void
}

export function sendRequestNewTestPlan(): void {
  PLAN_EMITTER.emit(REQUEST_NEW_TEST_PLAN)
}

export function addRequestNewTestPlanListener(listener: RequestNewTestPlanListener) {
  PLAN_EMITTER.addListener(REQUEST_NEW_TEST_PLAN, listener)
}

export function removeRequestNewTestPlanListener(listener: RequestNewTestPlanListener) {
  PLAN_EMITTER.removeListener(REQUEST_NEW_TEST_PLAN, listener)
}

// ---------------------------------------------------------------------------

export interface RequestViewTestPlanListener {
  (file: string): void
}

export function sendRequestViewTestPlan(file: string): void {
  PLAN_EMITTER.emit(REQUEST_VIEW_TEST_PLAN, file)
}

export function addRequestViewTestPlanListener(listener: RequestViewTestPlanListener) {
  PLAN_EMITTER.addListener(REQUEST_VIEW_TEST_PLAN, listener)
}

export function removeRequestViewTestPlanListener(listener: RequestViewTestPlanListener) {
  PLAN_EMITTER.removeListener(REQUEST_VIEW_TEST_PLAN, listener)
}

// -------------------------------------------------------------------------

export interface RequestCloseActiveTestPlanListener {
  (): void
}

export function sendRequestCloseActiveTestPlan() {
  PLAN_EMITTER.emit(REQUEST_CLOSE_ACTIVE_TEST_PLAN)
}

export function addRequestCloseActiveTestPlanListener(listener: RequestCloseActiveTestPlanListener) {
  PLAN_EMITTER.addListener(REQUEST_CLOSE_ACTIVE_TEST_PLAN, listener)
}

export function removeRequestCloseActiveTestPlanListener(listener: RequestCloseActiveTestPlanListener) {
  PLAN_EMITTER.removeListener(REQUEST_CLOSE_ACTIVE_TEST_PLAN, listener)
}

// ------------------------------------------------------------------------

export interface TestPlanClosedListener {
  (testPlanFile: string): void
}

export function sendTestPlanClosed(file: string) {
  /*
  loadSettings()
    .then((settings) => {
      let recent: string[] = settings.get('test-plans', 'recent', [])
      let newRecent = [file]
      recent.forEach((f) => { newRecent.push(f) })
      return settings
        .put('test-plans', 'recent', newRecent)
        .save()
    })
    .then(() => {
    })
  */
  PLAN_EMITTER.emit(TEST_PLAN_CLOSED, file)
}

export function addTestPlanClosedListener(listener: TestPlanClosedListener) {
  PLAN_EMITTER.addListener(TEST_PLAN_CLOSED, listener)
}

export function removeTestPlanClosedListener(listener: TestPlanClosedListener) {
  PLAN_EMITTER.removeListener(TEST_PLAN_CLOSED, listener)
}

// -----------------------------------------------------------------------

interface TestPlanHistory {
  plan: planModel.TestPlan | null
  log: scm.FileHistory
}

export class ProjectTestPlan {
  private plan: planModel.TestPlan | null = null
  private state: scm.FileState | null = null
  private history: TestPlanHistory[] = []

  constructor(private filename: string | null) {}

  getFilename(): string | null {
    return this.filename
  }

  save(): Promise<ProjectTestPlan> {
    if (this.filename == null) {
      return Promise.reject('No filename set for test plan')
    }
    if (this.plan == null) {
      return Promise.reject(`Source file ${this.filename} corrupted; you need to create a new file and overwrite the existing one.`)
    }
    return writeTestPlan(this.filename, this.plan)
      .then(() => { return this })
  }

  saveAs(filename: string): Promise<ProjectTestPlan> {
    return loadSettings()
      .then((settings) => {
        const projects = settings.attachedProjects()
        const newProjectPath = getProjectPathForFile(filename, projects)
        const originalProjectPath = getProjectPathForFile(this.filename, projects)
        const changed = newProjectPath != originalProjectPath
        if (changed) {
          sendTestPlanProjectChanged({
            testPlanFile: filename,
            oldProjectRoot: originalProjectPath,
            newProjectRoot: newProjectPath
          })
        }
        this.filename = filename
        return this.save()
          .then(() => {
            if (changed) {
              return this.loadHistory()
            }
            return this
          })
      })
  }

  isLoaded(): boolean {
    return this.plan != null
  }

  onScmChange(): Promise<ProjectTestPlan> {
    return this.loadHistory()
  }

  getScmHistory(): scm.FileHistory[] {
    return this.history.map((h) => { return h.log })
  }

  loadScmTestPlan(index: number): Promise<planModel.TestPlan> {
    if (index < 0 || index >= this.history.length || !this.history[index] || !this.history[index].log) {
      return Promise.reject(`unknown history index ${index}`)
    }
    let plan = this.history[index].plan
    if (plan != null) {
      return Promise.resolve(plan)
    }
    return loadSettings()
      .then((settings) => {
        let projectPath = getProjectPathForFile(this.filename, settings.attachedProjects())
        return scm.getActiveScm(projectPath)
      })
      .then((scmImpl) => {
        return scmImpl.loadFileRevision(this.history[index].log)
      })
      .then((result) => {
        if (result == null) {
          return Promise.reject(`failed to read history for ${this.history[index].log}`)
        }
        try {
          let str = String.fromCharCode.apply(null, new Uint16Array(result))
          let plan: planModel.TestPlan = JSON.parse(str)
          this.history[index].plan = plan
          return Promise.resolve(plan)
        } catch (err) {
          return Promise.reject(err)
        }
      })
  }

  getScmFileState(): scm.FileState | null {
    return this.state
  }

  loadAs(filename: string): Promise<ProjectTestPlan> {
    this.filename = filename
    return this.load()
  }

  load(): Promise<ProjectTestPlan> {
    let ret: Promise<planModel.TestPlan>
    if (this.filename == null) {
      ret = generateId('TP')
        .then((id) => {
          this.plan = new planModel.TestPlan(null, { id: id })
          return this.plan
        })
    } else {
      ret = readTestPlan(this.filename)
    }
    return ret
      .then((tp) => {
        this.history = []
        this.plan = tp
        return this.loadHistory()
      })
  }

  private loadHistory(): Promise<ProjectTestPlan> {
    return getScmFor(this.filename)
      .then((scmImpl) => {
        if (this.filename != null) {
          return scmImpl.getFileState(this.filename)
            .then((fs) => {
              this.state = fs
              return scmImpl
            })
        }
        return scmImpl
      })
      .then((scmImpl) => {
        if (this.filename == null) {
          return []
        }
        return scmImpl.getFileHistory(this.filename)
      })
      .then((history) => {
        this.history = history.map((h) => {
          return { plan: null, log: h }
        })
        return this
      })
  }
}


function getScmFor(file: string | null): Promise<scm.ScmApi> {
  let projectPath: Promise<string | null>
  if (file == null) {
    projectPath = Promise.resolve(null)
  } else {
    let f: string = file
    projectPath = loadSettings()
      .then((settings) => {
        return getProjectPathForFile(f, settings.attachedProjects())
      })
  }
  return projectPath
    .then((path) => {
      return scm.getActiveScm(path)
    })
}


function getProjectPathForFile(file: string | null, projects: ProjectData[]): string | null {
  if (!file) {
    return null
  }
  let parent = file
  while (parent != null && parent.length > 0) {
    console.log(`Checking matching project for file ${parent}`)
    for (let i = 0; i < projects.length; i++) {
      if (projects[i].path == parent) {
        return projects[i].path
      }
    }
    parent = path.dirname(parent)
  }
  return null
}
