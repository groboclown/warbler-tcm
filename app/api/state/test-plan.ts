import * as scm from '../scm'
import { loadSettings } from '../settings'
import * as planModel from '../model/plan'
import * as EventEmitter from 'events'
import { readTestPlan, writeTestPlan } from '../model/marshal'
import generateId from '../gen-id'

const PLAN_EMITTER = new EventEmitter()

const REQUEST_NEW_TEST_PLAN = 'warbler-request-new-test-plan'
const REQUEST_VIEW_TEST_PLAN = 'warbler-request-view-test-plan'
const REQUEST_CLOSE_ACTIVE_TEST_PLAN = 'warbler-request-close-test-plan'
const TEST_PLAN_CLOSED = 'warbler-test-plan-closed'

export function getRecentlyViewedTestPlanFiles(): Promise<string[]> {
  return loadSettings()
    .then((settings) => {
      return settings.get('test-plans', 'recent', []) as string[]
    })
}

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

export function addRequestCloseActiveTestPlan(listener: RequestCloseActiveTestPlanListener) {
  PLAN_EMITTER.addListener(REQUEST_CLOSE_ACTIVE_TEST_PLAN, listener)
}

export function removeRequestCloseActiveTestPlan(listener: RequestCloseActiveTestPlanListener) {
  PLAN_EMITTER.removeListener(REQUEST_CLOSE_ACTIVE_TEST_PLAN, listener)
}

// ------------------------------------------------------------------------

export interface TestPlanClosedListener {
  (): void
}

export function sendTestPlanClosed(file: string) {
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
      PLAN_EMITTER.emit(TEST_PLAN_CLOSED)
    })
}

export function addTestPlanClosed(listener: TestPlanClosedListener) {
  PLAN_EMITTER.addListener(TEST_PLAN_CLOSED, listener)
}

export function removeTestPlanClosed(listener: TestPlanClosedListener) {
  PLAN_EMITTER.removeListener(TEST_PLAN_CLOSED, listener)
}

// ------------------------------------------------------------------------



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
    this.filename = filename
    return this.save()
  }

  isLoaded(): boolean {
    return this.plan != null
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
    return scm.getActiveScm()
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
        return scm.getActiveScm()
      })
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
