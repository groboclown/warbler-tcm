
import * as schema from './schema'

export class TestPlan {
  filename: string
  private base: schema.TestPlanData

  constructor(filename: string | null, serialized?: schema.TestPlanData) {
    this.base = serialized || { id: 'TestPlanId' }
    this.filename = filename || 'untitled'
  }

  getRevisionById(revId: string): TestPlanRevision | null {
    if (this.base.revisions) {
      for (let i = 0; i < this.base.revisions.length; i++) {
        if (this.base.revisions[i].revId == revId) {
          return new TestPlanRevision(this, this.base.revisions[i])
        }
      }
    }
    return null
  }

  createRevision(newRevId?: string): TestPlanRevision {
    let revId = newRevId || this.createUniqueRevId()
    if (this.hasRevisionId(revId)) {
      throw new Error(`Dulicate revision ID ${revId}`)
    }
    let rev = { revId: revId }
    if (!this.base.revisions) {
      this.base.revisions = []
    }
    this.base.revisions.push(rev)
    return new TestPlanRevision(this, rev)
  }

  private hasRevisionId(revId?: string): boolean {
    if (this.base.revisions) {
      for (let i = 0; i < this.base.revisions.length; i++) {
        if (this.base.revisions[i].revId == revId) {
          return true
        }
      }
    }
    return false
  }

  private createUniqueRevId(): string {
    let baseId: string = this.base.id
    let index = -1
    let revId
    do {
      index++
      revId = baseId + '-' + index
    } while (this.hasRevisionId(revId))
    return revId
  }

  serialize(): object {
    return this.base
  }
}


export class TestPlanRevision {
  constructor(private parent: TestPlan, private base: schema.TestPlanRevisionData) {
  }

  // FIXME placeholder
  getParent(): TestPlan {
    return this.parent
  }

  // FIXME placeholder
  getSchema(): schema.TestPlanRevisionData {
    return this.base
  }
}
