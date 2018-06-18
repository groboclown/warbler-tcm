import * as scm from '../scm'
import { loadSettings } from '../settings'
import * as planModel from '../model/plan'
import * as EventEmitter from 'events'


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

// -----------------------------------------------------------------------

interface TestPlanHistory {
  plan: planModel.TestPlan | null
  log: scm.FileHistory
}

export class ProjectTestPlan {
  private plan: planModel.TestPlan | null = null
  private state: scm.FileState | null = null
  private history: TestPlanHistory[] | null = null

  constructor(private filename: string) {}

  getFilename(): string {
    return this.filename
  }

  isLoaded(): boolean {
    return this.plan != null
  }

  getScmHistory(): scm.FileHistory[] {
    return this.history == null ? [] :
      this.history.map((h) => { return h.log })
  }

  getScmFileState(): scm.FileState | null {
    return this.state
  }

  load(): Promise<ProjectTestPlan> {
    // Load the contents and scm data.
    return Promise.reject(new Error('not implemented'))
  }
}
