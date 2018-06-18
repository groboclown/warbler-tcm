import * as React from 'react';
import { remote } from 'electron'
import { createMenuTemplate } from '../api/electron/menus'
import * as dialogs from '../api/electron/dialogs'
import { sendRequestNewTestPlan } from '../api/state/test-plan'
//import { loadSettings } from '../settings'

export default class App extends React.Component {
  componentDidMount() {
    let menu = remote.Menu.buildFromTemplate(createMenuTemplate({
      title: 'Warbler TCM',
      // TODO load recent files from settings
      recentFiles: [],
      onAddProject: dialogs.addProjectDialog,
      onNewTestPlan: () => {
        sendRequestNewTestPlan()
      },
      onRequestQuit: () => {
        remote.app.exit()
      },
      onOpenFile: () => {}
    }))
    remote.Menu.setApplicationMenu(menu)
  }
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}
