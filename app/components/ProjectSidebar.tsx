import * as React from 'react';
import * as TreeView from 'react-treeview'
import * as Projects from '../api/state/projects'
import * as scm from '../api/scm'
import * as path from 'path'
import * as dialogs from '../api/electron/dialogs'

let styles = require('./ProjectSidebar.scss');

interface ProjectDetails {
  project: Projects.Project
  attachedProject: Projects.AttachedProject
}


export interface State {
  projectDetails: ProjectDetails[]

  // TODO make the loaded setting
  showDeleted: boolean

  selectedFile: string | null
}

export default class ProjectSidebar extends React.Component<any, State> {
  private projectsUpdatedListener = (evt: Projects.AttachedProjectsUpdated) => { this.onProjectsUpdated(evt) }

  constructor(props: any) {
    super(props)
    this.state = {
      projectDetails: [],
      showDeleted: false,
      selectedFile: null
    }
    Projects.getAttachedProjects()
      .then((aps) => {
        return Promise.all(aps.map((ap): ProjectDetails => {
          return {
            project: new Projects.Project(ap),
            attachedProject: ap
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
    return (
      <div className={styles.container} id='ProjectContainer'>
        <div className={styles.titlebar}>
          <span className={styles.title}>Projects</span>
          <span className={styles.titlebuttons}>
            <span className={styles.titlebutton} onClick={() => { this.addProject() }}>+</span>
            <span className={styles.titlebutton} onClick={() => { this.removeSelectedProject() }}>-</span>
            <span className={[styles.titlebutton,
              (this.state.showDeleted ? styles.enabled : styles.disabled)]
              .join(' ')}>D</span>
          </span>
        </div>
        <div className={styles.treeContainer}>
        {this.state.projectDetails.map((pd) => { return this.renderProject(pd.project) })}
        </div>
      </div>
    );
  }

  renderProject(project: Projects.Project): JSX.Element {
    project.childProjects.sort((p1: Projects.Project, p2: Projects.Project) => {
      return strSort(p1.name, p2.name)})
    project.planFiles.sort((f1: scm.FileState, f2: scm.FileState) => {
      return strSort(f1.file, f2.file)})
    project.projectFiles.sort((f1: scm.FileState, f2: scm.FileState) => {
      return strSort(f1.file, f2.file)})
    // TODO: file / directory type should indicate the icon,
    // while the SCM type should indicate the color.
    return (
      <TreeView
            nodeLabel={project.name}
            defaultCollapsed={true}
            onClick={() => { this.onProjectClicked(project) }}
            itemClassName={(this.state.selectedFile == project.rootFolder ? styles.selected : '')}>
          {project.childProjects.map((p) => { return this.renderProject(p) })}
          {project.planFiles.map((f) => { return (
            <div
              onClick={() => { this.onPlanFileClicked(project, f, false) }}
              onDoubleClick={() => { this.onPlanFileClicked(project, f, true) }}
              className={[
                (this.state.selectedFile == f.file ? styles.selected : '')
              ].join(' ')}
              ><span className={styles.planFile}>{path.basename(f.file)}</span>
            </div>
          )})}
          {project.projectFiles.map((f) => { return (
            <div
              onClick={() => { this.onProjectFileClicked(project, f, false) }}
              onDoubleClick={() => { this.onProjectFileClicked(project, f, true) }}
              className={[
                (this.state.selectedFile == f.file ? styles.selected : '')
              ].join(' ')}
              ><span className={styles.projectFile}>{path.basename(f.file)}</span>
            </div>
          )})}
      </TreeView>
    )
  }

  addProject() {
    dialogs.addProjectDialog()
  }

  removeSelectedProject() {
    console.log(`Remove selected project`)
  }

  onProjectClicked(pd: Projects.Project) {
    console.log(`Clicked project ${pd.rootFolder}`)
    this.setState({
      selectedFile: pd.rootFolder
    })
  }

  onPlanFileClicked(project: Projects.Project, file: scm.FileState, doubleClick: boolean) {
    console.log(`Clicked plan ${doubleClick} ${project.rootFolder} ${file.file}`)
  }

  onProjectFileClicked(project: Projects.Project, file: scm.FileState, doubleClick: boolean) {
    console.log(`Clicked project ${doubleClick} ${project.rootFolder} ${file.file}`)
  }

  onProjectsUpdated(evt: Projects.AttachedProjectsUpdated) {
    Promise.all(evt.projects.map((prj: Projects.AttachedProject) => {
      return new Projects.Project(prj).refresh()
        .then((p): ProjectDetails => { return { attachedProject: prj, project: p }})
      })).then((pd: ProjectDetails[]) => {
      this.setState({
        projectDetails: pd
      })
    })
  }

  componentDidMount() {
    Projects.addAttachedProjectsUpdatedListener(this.projectsUpdatedListener)
  }

  componentWillUnmount() {
    Projects.removeAttachedProjectsUpdatedListener(this.projectsUpdatedListener)
  }
}

function strSort(s1: string, s2: string): number {
  return s1 == s2
    ? 0
    : s1 < s2
      ? -1
      : 1
}
