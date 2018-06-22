import * as React from 'react';
//import { InfiniteTree } from 'react-infinite-tree'
//import { TreeNode, Tree, LoadDoneFunction } from 'react-infinite-tree'
import InfiniteTree from '../containers/RxInfiniteTree'
import * as projectState from '../api/state/projects'
import * as scm from '../api/scm'
//import * as path from 'path'
import * as dialogs from '../api/electron/dialogs'
//import * as testPlanState from '../api/state/test-plan'
import { loadSettings } from '../api/settings'

let styles = require('./ProjectSidebar.scss');

interface ProjectDetails {
  project: projectState.Project
}


export interface State {
  projectDetails: ProjectDetails[]
  selectedFile: string | null
}

interface NodeData {
  readonly project: projectState.Project | null
  readonly isRootFolder: boolean
  readonly planFile: scm.FileState | null
  readonly otherFile: scm.FileState | null
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
    let treeData: NodeData[] = this.loadProjectNodes()
    console.log(`${treeData}`)
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
          <InfiniteTree width="100%"></InfiniteTree>
        </div>
      </div>
    )
  }

  /*
          <InfiniteTree
              autoOpen={false}
              selectable={true}
              width="100%"
              rowHeight="1.2em"
              data={treeData}
              rowRenderer={(node: TreeNode & NodeData, tree: Tree<NodeData>, index: number) => {
                return this.renderNode(node, tree, index)
              }}
              loadNodes={(parentNode: TreeNode & NodeData, done: LoadDoneFunction<NodeData>) => {
                this.loadNodes(parentNode, done)
              }}
              onSelectNode={(node: TreeNode & NodeData) => {
                this.onSelectNode(node)
              }}
              >
          </InfiniteTree>
  */
/*
  private renderNode(node: TreeNode & NodeData, tree: Tree<NodeData>, _: number): JSX.Element {
    // TODO move these into the project tree
    let selectedNode = tree.getSelectedNode()
    if (node.isRootFolder) {
      return (<span className={[
        (node == selectedNode ? styles.selected : ''),
        'tree-node', 'tree-project'].join(' ')}></span>)
    } else if (node.project) {
      return (<span className={[
        (node == selectedNode ? styles.selected : ''),
        'tree-node', 'tree-folder'].join(' ')}></span>)
    } else if (node.planFile) {
      return (<span className={[
        (node == selectedNode ? styles.selected : ''),
        'tree-node',
        'tree-plan',
        styles.planFile,
      ].join(' ')}
      >{path.basename(node.planFile.file)}</span>)
    } else if (node.otherFile) {
      return (<span className={[
        (node == selectedNode ? styles.selected : ''),
        'tree-node',
        'tree-file',
        styles.projectFile,
      ].join(' ')}
      >{path.basename(node.otherFile.file)}</span>)
    }
    return (<span>(unknown)</span>)
  }
*/
  private loadProjectNodes(): NodeData[] {
    return this.state.projectDetails.map((pd) => {
      return {
        project: pd.project, isRootFolder: true, planFile: null, otherFile: null
      }
    })
  }
/*
  private loadNodes(parentNode: TreeNode & NodeData, done: LoadDoneFunction<NodeData>) {
    if (parentNode.project) {
      // Immediate children of the project
      let project: projectState.Project = parentNode.project
      project.childProjects.sort((p1: projectState.Project, p2: projectState.Project) => {
        return strSort(p1.name, p2.name)})
      project.planFiles.sort((f1: scm.FileState, f2: scm.FileState) => {
        return strSort(f1.file, f2.file)})
      project.projectFiles.sort((f1: scm.FileState, f2: scm.FileState) => {
        return strSort(f1.file, f2.file)})
      let ret: NodeData[] = []
      ret.concat(project.childProjects.map((p): NodeData => {
        return {
          project: p, isRootFolder: false, planFile: null, otherFile: null
        }
      }))
      ret.concat(project.planFiles.map((p): NodeData => {
        return {
          project: null, isRootFolder: false, planFile: p, otherFile: null
        }
      }))
      ret.concat(project.projectFiles.map((p): NodeData => {
        return {
          project: null, isRootFolder: false, planFile: null, otherFile: p
        }
      }))
      done(null, ret)
    }
  }

  private onSelectNode(node: TreeNode & NodeData) {
    if (node.project && node.isRootFolder) {
      // TODO how to allow for double click notification?
      this.onProjectClicked(node.project, false)
    } else if (node.planFile) {
      this.onPlanFileClicked(node.planFile)
    } else if (node.otherFile) {
      this.onOtherFileClicked(node.otherFile)
    }
  }
*/
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
/*
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

  private onOtherFileClicked(file: scm.FileState) {
    this.closeSettingsPopup()
    console.log(`Clicked ${file.file}`)
  }
*/
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
/*
function strSort(s1: string, s2: string): number {
  return s1 == s2
    ? 0
    : s1 < s2
      ? -1
      : 1
}
*/
