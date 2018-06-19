
import * as schema from './schema'

export { TestPlanData } from './schema'

export class TestPlan {
  filename: string
  private data: schema.TestPlanData

  constructor(filename: string | null, serialized?: schema.TestPlanData) {
    this.data = serialized || { id: 'TestPlanId', revId: '1' }
    this.filename = filename || 'untitled'
  }

  serialize(): object {
    return this.data
  }
}
