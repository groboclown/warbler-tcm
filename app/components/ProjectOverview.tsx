import * as React from 'react'
import * as projectState from '../api/state/projects'
import { loadSettings } from '../api/settings'
import * as scm from '../api/scm'

interface Params {
  path: string
}

interface State {
  readonly rootFolder: string
  project: projectState.Project | null
  valid: boolean
  availableScm: scm.ScmDescription[]
}

export default class ProjectOverview extends React.Component<Params, State> {
  constructor(params: Params) {
    super(params)
    this.state = {
      rootFolder: params.path, project: null, valid: true,
      availableScm: []
    }
    loadSettings()
      .then((settings) => {
        let data = settings.getAttachedProject(this.state.rootFolder)
        if (data != null) {
          return (new projectState.Project(data, true)).refresh()
        }
        return Promise.resolve(null)
      })
      .then((project) => {
        this.setState({
          project: project,
          valid: project != null
        })
      })
      .then(() => {
        return scm.getSupportedScms()
      })
      .then((supported) => {
        this.setState({ availableScm: supported })
      })
  }

  render() {
    return (
      <div>
        <h1>{this.state.rootFolder}</h1>
        {this.renderInvalid()}
        <div>
          TODO: show an overview of the project settings (filters, scm, etc),
          and show a high-level description of the test plans and summaries
          of the test cases and test runs.
        </div>
        {this.renderScm()}
      </div>
    )
  }

  renderInvalid() {
    if (!this.state.valid) {
      return (<div>Not a valid root folder</div>)
    }
    return (<span>&nbsp;</span>)
  }

  renderScm() {
    if (this.state.valid && this.state.project && this.state.availableScm.length > 0) {
      return (<div>
        <div>
          Current SCM: {this.state.project.attached.scm || '(default)'}
        </div>
        <div>
          Available SCMs:
          {this.state.availableScm.map((s) => { return (
            <div><b>{s.name}</b>: {s.description}</div>
          ) })}
        </div>
      </div>)
    }
    return (<span>&nbsp;</span>)
  }
}
