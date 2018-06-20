import * as React from 'react';
import * as TreeView from 'react-treeview'
import * as projectState from '../api/state/projects'
import * as scm from '../api/scm'
import * as path from 'path'
import * as dialogs from '../api/electron/dialogs'
import * as testPlanState from '../api/state/test-plan'
import { loadSettings } from '../api/settings'

let styles = require('./ProjectSidebar.scss');

interface ProjectDetails {
  project: projectState.Project
}


export interface State {
  projectDetails: ProjectDetails[]
  selectedFile: string | null
}

export default class ProjectSidebar extends React.Component<any, State> {
  private projectsUpdatedListener = (evt: projectState.AttachedProjectsUpdated) => { this.onProjectsUpdated(evt.projects) }
  private projectScmChangedListener = () => { this.onAllProjectsUpdated() }
  private testPlanProjectChangedListener = () => { this.onAllProjectsUpdated() }

  constructor(props: any) {
    super(props)
    this.state = {
      projectDetails: [],
      selectedFile: null
    }
    projectState.getAttachedProjects()
      .then((aps) => {
        return Promise.all(aps.map((ap): ProjectDetails => {
          return {
            project: new projectState.Project(ap, true)
          }
        }))
      })
      .then((pds) => {
        return Promise.all(pds.map((pd) => {
          return pd.project.refresh()
        }))
        .then(() => { return pds })
      })
      .then((pds) => {
        this.setState({ projectDetails: pds })
      })
  }

  render() {
    // TODO Clean up these buttons.

    return (
      <div className={[styles.container, 'panel'].join(' ')} id='ProjectContainer'>
        <div className={[styles.titlebar, 'titlebar'].join(' ')}>
          <span className={styles.title}>Projects</span>
          <span className={styles.titlebuttons}>
            <span className={styles.hamburger} onClick={() => { this.toggleSettings() }}>&nbsp;&nbsp;&nbsp;&nbsp;</span>
          </span>
        </div>
        <div className={[styles.popup, 'popup-panel'].join(' ')} id="settingsPopUp">
            <div className={[styles.titlebutton, 'text-button'].join(' ')} onClick={() => { this.addProject() }}>Add Project Folder</div>
            <div className={[styles.titlebutton, 'text-button'].join(' ')} onClick={() => { this.removeSelectedProject() }}>Remove Project Folder</div>
        </div>
        <div className={styles.treeContainer}>
        {this.state.projectDetails.map((pd) => { return this.renderProject(pd.project) })}
        </div>
      </div>
    )
  }

  renderProject(project: projectState.Project): JSX.Element {
    project.childProjects.sort((p1: projectState.Project, p2: projectState.Project) => {
      return strSort(p1.name, p2.name)})
    project.planFiles.sort((f1: scm.FileState, f2: scm.FileState) => {
      return strSort(f1.file, f2.file)})
    project.projectFiles.sort((f1: scm.FileState, f2: scm.FileState) => {
      return strSort(f1.file, f2.file)})
    // TODO: file / directory type should indicate the icon,
    // while the SCM type should indicate the color.
    let treeViewLabel = (<span
      onClick={() => { this.onProjectClicked(project, false) }}
      onDoubleClick={() => { this.onProjectClicked(project, true) }}>
      {project.name}
      </span>
    )
    // The tree view doesn't allow for keyboard navigation.  Need to look
    // for improvements.
    return (
      <TreeView
          nodeLabel={treeViewLabel}
          defaultCollapsed={true}
          onClick={() => { this.onProjectClicked(project, false) }}
          onDoubleClick={() => { this.onProjectClicked(project, true) }}
          itemClassName={[
            (this.state.selectedFile == project.rootFolder ? styles.selected : ''),
            'tree-node',
            (project.isRoot ? 'tree-project' : 'tree-folder')
          ].join(' ')}>
        {project.childProjects.map((p) => { return this.renderProject(p) })}
        {this.renderPlanFiles(project)}
        {this.renderProjectFiles(project)}
      </TreeView>
    )
  }

  renderPlanFiles(project: projectState.Project) {
    return project.planFiles.map((f) => { return (
        <div
          onClick={() => { this.onPlanFileClicked(f) }}
          onDoubleClick={() => { this.onPlanFileClicked(f) }}
          className={[
            (this.state.selectedFile == f.file ? styles.selected : ''),
            'tree-node',
            (this.state.selectedFile == f.file ? 'tree-node-selected' : ''),
            'tree-plan'
          ].join(' ')}
          ><span className={styles.planFile}>{path.basename(f.file)}</span>
        </div>
      )})
  }

  renderProjectFiles(project: projectState.Project) {
    if (!project.attached.filter || !project.attached.filter.hideNonPlanFiles) {
      return project.projectFiles.map((f) => { return (
            <div
              onClick={() => { this.onProjectFileClicked(project, f, false) }}
              onDoubleClick={() => { this.onProjectFileClicked(project, f, true) }}
              className={[
                (this.state.selectedFile == f.file ? styles.selected : ''),
                'tree-node',
                'tree-file'
              ].join(' ')}
              ><span className={styles.projectFile}>{path.basename(f.file)}</span>
            </div>
      )})
    }
    return null
  }

  toggleSettings() {
    let el = document.getElementById('settingsPopUp');
    if (el) { el.classList.toggle(styles.show) }
  }

  closeSettingsPopup() {
    let el = document.getElementById('settingsPopUp');
    if (el) { el.classList.remove(styles.show) }
  }

  addProject() {
    this.closeSettingsPopup()
    dialogs.addProjectDialog()
  }

  removeSelectedProject() {
    this.closeSettingsPopup()
    console.log(`Remove selected project for ${this.state.selectedFile}`)
  }

  private onProjectClicked(pd: projectState.Project, doubleClick: boolean) {
    this.closeSettingsPopup()
    this.setState({
      selectedFile: pd.rootFolder
    })
    if (doubleClick && pd.isRoot) {
      console.log(`Requesting view project ${pd.rootFolder}`)
      projectState.sendRequestViewProjectDetails(pd.attached)
    }
  }

  private onPlanFileClicked(file: scm.FileState) {
    this.closeSettingsPopup()
    this.setState({
      selectedFile: file.file
    })
    testPlanState.sendRequestViewTestPlan(file.file)
  }

  private onProjectFileClicked(project: projectState.Project, file: scm.FileState, doubleClick: boolean) {
    this.closeSettingsPopup()
    console.log(`Clicked project ${doubleClick} ${project.rootFolder} ${file.file}`)
  }

  private onProjectsUpdated(projects: projectState.ProjectData[]) {
    this.closeSettingsPopup()
    Promise.all(projects.map((prj) => {
      return new projectState.Project(prj, true).refresh()
        .then((p): ProjectDetails => { return { project: p }})
      })).then((pd: ProjectDetails[]) => {
        this.setState({
          projectDetails: pd
        })
    })
    .catch((err) => {
      // FIXME correct error reporting
      console.log(`DUDE! ERROR!`)
      console.log(err)
    })
  }

  private onAllProjectsUpdated() {
    loadSettings()
      .then((settings) => {
        return this.onProjectsUpdated(settings.attachedProjects())
      })
  }

  componentDidMount() {
    projectState.addAttachedProjectsUpdatedListener(this.projectsUpdatedListener)
    projectState.addProjectScmChangedListener(this.projectScmChangedListener)
    projectState.addTestPlanProjectChangedListener(this.testPlanProjectChangedListener)
  }

  componentWillUnmount() {
    projectState.removeAttachedProjectsUpdatedListener(this.projectsUpdatedListener)
    projectState.removeProjectScmChangedListener(this.projectScmChangedListener)
    projectState.removeTestPlanProjectChangedListener(this.testPlanProjectChangedListener)
  }
}

function strSort(s1: string, s2: string): number {
  return s1 == s2
    ? 0
    : s1 < s2
      ? -1
      : 1
}
