
import { remote } from 'electron'
import { updateAttachedProjects,
  getAttachedProjects, createAttachedProject } from '../state/projects'

export function addProjectDialog() {
  // TODO set initial path to the previously selected directory (`defaultPath`).

  remote.dialog.showOpenDialog({
    title: 'Add Project Directory',
    message: 'Choose the project directory',
    properties: ['openDirectory']
  }, (filePaths: string[]) => {
    console.log(`Files: ${filePaths}`)
    if (filePaths) {
      getAttachedProjects()
        .then((attached) => {
          filePaths.forEach((f) => { attached.push(createAttachedProject(f)) })
          updateAttachedProjects(attached)
        })
    }
  })
}


export function saveFileAs(fileType: string, ext: string): Promise<string | null> {
  // TODO set `defaultPath`

  return new Promise((resolve) => {
    remote.dialog.showSaveDialog({
      title: `Save ${fileType} As`,
      filters: [{ name: fileType, extensions: [ext] }]
    }, (filename) => {
      resolve(filename)
    })
  })
}


export function setWindowTitle(testPlanName: string) {
  remote.BrowserWindow.getFocusedWindow().setTitle(`${testPlanName} :: Warbler TCM`)
}
