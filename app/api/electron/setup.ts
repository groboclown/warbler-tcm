
import * as Electron from 'electron'
import { createMenuTemplate } from './menus'

export function initializeElectron() {
  let menu = Electron.remote.Menu.buildFromTemplate(createMenuTemplate({
    title: 'Warbler TCM',
    // TODO add list of recent files.
    onAddProject() {
      console.log('FIXME open a test plan')
    },
    onNewTestPlan() {
      console.log('FIXME create a new test plan')
    },
    onRequestQuit() {
      // TODO save settings?
      Electron.remote.app.quit()
    },
    onOpenFile(filename: string) {
      console.log('FIXME open a recent file ' + filename)
    }
  }))
  Electron.remote.Menu.setApplicationMenu(menu)
}
