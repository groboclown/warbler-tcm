
import { remote } from 'electron'
import { updateAttachedProjects,
  getAttachedProjects, createAttachedProject } from '../state/projects'

export function addProjectDialog() {
  // TODO set initial path to the previously selected directory.

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
