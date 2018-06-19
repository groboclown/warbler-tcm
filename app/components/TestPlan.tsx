import * as React from 'react'
import * as testPlanState from '../api/state/test-plan'
import * as dialogs from '../api/electron/dialogs'
import { EXTENSION } from '../api/model/marshal'
let styles = require('./TestPlan.scss');

interface State {
  filename: string | null
  plan: testPlanState.ProjectTestPlan
  error: Error | null
  dirty: boolean
}

interface Params {
  filename: string | null
}

export default class TestPlanUI extends React.Component<Params, State> {
  constructor(params: Params) {
    super(params)
    this.state = {
      plan: new testPlanState.ProjectTestPlan(params.filename),
      filename: params.filename,
      error: null,
      dirty: params.filename == null
    }
    this.reload()
  }

  render() {
    return (
      <div className={styles.container}>
        <div className={this.state.error ? styles.errorShown : styles.errorHidden}>
          <div className={styles.errorTitleBar}>
            <span className={styles.errorTitle}>Encountered Error</span>
            <span className={styles.errorClose} onClick={() => { this.setState({error: null}) }}>X</span>
          </div>
          <div className={styles.errorText}>
          {`${this.state.error}`}
          </div>
        </div>
        {this.renderToolBar()}
        {this.renderTestPlan()}
      </div>
    )
  }

  renderToolBar() {
    if (this.state.plan.isLoaded()) {
      return (
        <div className={styles.toolBar}>
          <span onClick={() => { this.save() }}
            className={[styles.toolBarButton, this.state.dirty ? '' : styles.toolBarDisabled].join(' ')}
            >Save</span>
          <span onClick={() => { this.saveAs() }} className={styles.toolBarButton}>Save As...</span>
          <span onClick={() => { this.close() }} className={styles.toolBarButton}>Close</span>
        </div>
      )
    }
    return (<div></div>)
  }


  renderTestPlan() {
    
  }


  reload(): Promise<testPlanState.ProjectTestPlan | null> {
    return this.state.plan.load()
      .then((tp) => {
        this.setState({ error: null })
        return tp
      })
      .catch((err) => {
        console.log(`Failed on reload`)
        this.setState({ error: err })
        return null
      })
  }

  save(): Promise<testPlanState.ProjectTestPlan | null> {
    if (this.state.filename != null) {
      return this.state.plan.save()
        .catch((err) => {
          this.setState({ error: err })
          return null
        })
    }
    return this.saveAs()
  }

  saveAs(): Promise<testPlanState.ProjectTestPlan | null> {
    return dialogs.saveFileAs('Test Plan', EXTENSION.substr(1))
      .then((filename) => {
        if (filename) {
          this.setState({ filename: filename })
          return this.state.plan.saveAs(filename)
        }
        return Promise.resolve(null)
      })
      .then((tp) => {
        this.setState({ error: null })
        return tp
      })
      .catch((err) => {
        this.setState({ error: err })
        return null
      })
  }

  close() {
    testPlanState.sendRequestCloseActiveTestPlan()
  }
}
