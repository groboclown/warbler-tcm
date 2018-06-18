import * as React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import * as testPlanState from '../api/state/test-plan'
import * as path from 'path'

let styles = require('./Home.scss');

interface TabData {
  title: string
  filename: string | null
  isTestPlan: boolean
  isSettings: boolean
}

interface HomeState {
  newCount: number,
  openTabs: TabData[]
  selectedIndex: number
}

export default class Home extends React.Component<any, HomeState> {
  closeActiveTabListener: testPlanState.RequestCloseActiveTestPlanListener | null
  viewTestPlanListener: testPlanState.RequestViewTestPlanListener | null
  newTestPlanListener: testPlanState.RequestNewTestPlanListener | null

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
    return (
      <div className={styles.container} data-tid="container">
        <Tabs defaultIndex={this.state.selectedIndex}>
          <TabList className={styles.tablist}>
          {this.state.openTabs.map((t) => {
            {console.log(`Tab title ${t.title}`)}
            return (<Tab className={styles.tab} selectedClassName={styles.tabselected} disabledClassName={styles.tabdisabled}>{this.renderTabTitle(t)}</Tab>)
          })}
          </TabList>
          {this.state.openTabs.map((t) => {
            {console.log(`Tab contents ${t.filename}`)}
            return (<TabPanel className={styles.tabpanel} selectedClassName={styles.tabpanelselected}><div>{this.renderTabPanel(t)}</div></TabPanel>)
          })}
        </Tabs>
      </div>
    )
  }

  renderTabTitle(tab: TabData) {
    return tab.title
  }

  renderTabPanel(tab: TabData) {
    return tab.filename || `New file with title ${tab.title}`
  }

  componentDidMount() {
    this.closeActiveTabListener = () => { this.closeActiveTab() }
    testPlanState.addRequestCloseActiveTestPlan(this.closeActiveTabListener)

    this.viewTestPlanListener = (file: string) => { this.openTestPlan(file) }
    testPlanState.addRequestViewTestPlanListener(this.viewTestPlanListener)

    this.newTestPlanListener = () => { this.newTestPlan() }
    testPlanState.addRequestNewTestPlanListener(this.newTestPlanListener)
  }

  componentWillUnmount() {
    if (this.closeActiveTabListener) {
      testPlanState.removeRequestCloseActiveTestPlan(this.closeActiveTabListener)
      this.closeActiveTabListener = null
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
    // TODO actually open the file
    let tabs = this.state.openTabs
    for (let i = 0; i < tabs.length; i++) {
      if (tabs[i].filename == file) {
        this.setState({ selectedIndex: i })
        return
      }
    }
    tabs.push({
      title: path.basename(file),
      filename: file,
      isTestPlan: true,
      isSettings: false
    })
    this.setState({
      openTabs: tabs,
      selectedIndex: tabs.length - 1
    })
  }

  newTestPlan() {
    let tabs = this.state.openTabs
    let newIndex = this.state.newCount + 1
    tabs.push({
      title: `untitled ${newIndex}`,
      filename: null,
      isTestPlan: true,
      isSettings: false
    })
    this.setState({
      openTabs: tabs,
      selectedIndex: tabs.length - 1,
      newCount: newIndex
    })
  }
}
