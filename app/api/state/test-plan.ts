


export const REQUEST_VIEW_TEST_PLAN = 'warbler-request-view-test-plan'

export class RequestViewAttachedProject extends Event {
  constructor(public readonly testPlanFile: string) {
    super(REQUEST_VIEW_TEST_PLAN)
  }
}
