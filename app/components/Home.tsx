


import * as React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import * as testPlanState from '../api/state/test-plan'
import * as projectState from '../api/state/projects'
import * as path from 'path'
import TestPlanUI from './TestPlan'
import ProjectOverview from './ProjectOverview'

let styles = require('./Home.scss');

interface TabData {
  title: string
  filename: string | null
  tabType: 'plan' | 'project' | 'setting'
}

interface HomeState {
  newCount: number,
  openTabs: TabData[]
  selectedIndex: number
}

export default class Home extends React.Component<any, HomeState> {
  private closeActiveTestPlanTabListener: testPlanState.RequestCloseActiveTestPlanListener | null
  private viewTestPlanListener: testPlanState.RequestViewTestPlanListener | null
  private newTestPlanListener: testPlanState.RequestNewTestPlanListener | null
  private viewProjectDetailsListener: projectState.RequestViewProjectDetailsListener | null

  constructor(props: any) {
    super(props)
    this.state = {
      openTabs: [],
      selectedIndex: -1,
      newCount: 0
    }
  }

  render() {
    if (this.state.openTabs.length <= 0) {
      return (
        <div className={styles.container} data-tid="container">
          <div className={styles.empty}>
            Create a new test plan or open an existing one to get started.
          </div>
        </div>
      )
    }
    // TODO tabs should have an "x" on the title to allow closing them.
    return (
      <div className={styles.container} data-tid="container">
        <Tabs defaultIndex={this.state.selectedIndex} onSelect={(i: number) => { this.onTabSelected(i) }}>
          <TabList className={styles.tablist}>
          {this.state.openTabs.map((t) => {
            return (
              <Tab
                className={styles.tab}
                selectedClassName={styles.tabselected}
                disabledClassName={styles.tabdisabled}>
                {this.renderTabTitle(t)}
              </Tab>)
          })}
          </TabList>
          {this.state.openTabs.map((t) => {
            return (
              <TabPanel
                className={styles.tabpanel}
                selectedClassName={styles.tabpanelselected}>
                <div>{this.renderTabPanel(t)}</div>
              </TabPanel>)
          })}
        </Tabs>
      </div>
    )
  }

  renderTabTitle(tab: TabData) {
    return tab.title
  }

  renderTabPanel(tab: TabData) {
    if (tab.tabType == 'plan') {
      return (<TestPlanUI filename={tab.filename}></TestPlanUI>)
    } else if (tab.tabType == 'project' && tab.filename) {
      return (<ProjectOverview path={tab.filename}></ProjectOverview>)
    } else {
      return (<div>Some other data for {tab.filename}</div>)
    }
  }

  componentDidMount() {
    // TODO add in more event types, and push the menu constructing into this class.

    this.closeActiveTestPlanTabListener = () => { this.closeActiveTab() }
    testPlanState.addRequestCloseActiveTestPlanListener(this.closeActiveTestPlanTabListener)

    this.viewTestPlanListener = (file: string) => { this.openTestPlan(file) }
    testPlanState.addRequestViewTestPlanListener(this.viewTestPlanListener)

    this.newTestPlanListener = () => { this.newTestPlan() }
    testPlanState.addRequestNewTestPlanListener(this.newTestPlanListener)

    this.viewProjectDetailsListener = (project: projectState.ProjectData) => { this.openProjectDetails(project) }
    projectState.addRequestViewProjectDetails(this.viewProjectDetailsListener)
  }

  componentWillUnmount() {
    if (this.closeActiveTestPlanTabListener) {
      //testPlanState.removeRequestCloseActiveTestPlan(this.closeActiveTabListener)
      this.closeActiveTestPlanTabListener = null
    }
    if (this.viewTestPlanListener) {
      testPlanState.removeRequestViewTestPlanListener(this.viewTestPlanListener)
      this.viewTestPlanListener = null
    }
    if (this.newTestPlanListener) {
      testPlanState.removeRequestNewTestPlanListener(this.newTestPlanListener)
      this.newTestPlanListener = null
    }
  }

  closeActiveTab() {
    if (this.state.selectedIndex >= 0) {
      let tabs = []
      let closedFile = null
      for (let i = 0; i < this.state.openTabs.length; i++) {
        if (i != this.state.selectedIndex) {
          tabs.push(this.state.openTabs[i])
        } else {
          closedFile = this.state.openTabs[i].filename
        }
      }
      this.setState({
        openTabs: tabs,
        selectedIndex: tabs.length <= 0 ? -1 : Math.min(0, this.state.selectedIndex - 1)
      })
      if (closedFile) {
        testPlanState.sendTestPlanClosed(closedFile)
      }
    }
  }

  openTestPlan(file: string) {
    this.addTab({
      title: path.basename(file),
      filename: file,
      tabType: 'plan'
    })
  }

  onTabSelected(index: number) {
    this.setState({ selectedIndex: index })
  }

  newTestPlan() {
    let newIndex = this.state.newCount + 1
    this.addTab({
      title: `untitled ${newIndex}`,
      filename: null,
      tabType: 'plan'
    })
    this.setState({
      newCount: newIndex
    })
  }

  openProjectDetails(project: projectState.ProjectData) {
    this.addTab({
      title: `Project ${path.basename(project.path)}`,
      filename: project.path,
      tabType: 'project'
    })
  }

  private addTab(tab: TabData) {
    let tabs = this.state.openTabs
    for (let i = 0; i < tabs.length; i++) {
      if (tabs[i].filename == tab.filename) {
        this.setState({ selectedIndex: i })
        return
      }
    }
    tabs.push(tab)
    this.setState({
      openTabs: tabs,
      // This selection doesn't seem to work right.
      selectedIndex: tabs.length - 1,
    })
  }
}
