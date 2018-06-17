import { remote } from 'electron'

export interface MenuConfig {
  title: string
  recentFiles?: string[]

  // TODO declare no args, no return values.
  onAddProject: Function
  onNewTestPlan: Function
  onRequestQuit: Function
  onOpenFile: Function
}


export function createMenuTemplate(config: MenuConfig): object[] {
  let ret: any[] = []
  if (process.platform == 'darwin') {
    ret.push(_darwinAppMenu(config))
  }
  let fileMenu: any[] = [{
    label: _label('&New Test Plan'),
    accelerator: _accelerator('%', 'N'),
    click() {
      config.onNewTestPlan()
    }
  }, {
    label: _label('&Add Project...'),
    accelerator: _accelerator('%', 'P'),
    click() {
      config.onAddProject()
    }
  }]
  if (config.recentFiles && config.recentFiles.length > 0) {
    fileMenu.push({ type: 'separator' })
    for (let i = 0; i < Math.min(config.recentFiles.length, 10); i++) {
      fileMenu.push({
        label: _label(`&${i} ${_tailTrim(config.recentFiles[i])}`),
        accelerator: _accelerator('%', `${i}`),
        click() {
          if (config.recentFiles) {
            config.onOpenFile(config.recentFiles[i])
          }
        }
      })
    }
  }
  if (process.platform != 'darwin') {
    fileMenu.push({ type: 'separator' })
    fileMenu.push({
      label: _label('E&xit'),
      accelerator: _accelerator('&', 'F4'),
      click() {
        config.onRequestQuit()
      }
    })
  }

  ret.push({
    label: _label('&File'),
    submenu: fileMenu
  })
  ret.push({
    label: '&Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' }
    ]
   })
   ret.push({
    label: '&View',
    submenu: [
      { role: 'reload' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
   })
   if (process.platform == 'darwin') {
     ret.push({
        role: 'window',
        submenu: [
          { role: 'minimize' },
          { role: 'close' }
        ]
     })
   }
   ret.push({
      role: 'help',
      submenu: [
        /* { label: 'Learn More' }, */
        {
          label: 'Documentation',
          click() {
            remote.shell.openExternal('https://github.com/groboclown/warbler-tcm/tree/master/docs#readme');
          }
        }, /*{
          label: 'Community Discussions',
          click() {
            remote.shell.openExternal('https://discuss.atom.io/c/electron');
          }
        },*/ {
          label: 'Search Issues',
          click() {
            remote.shell.openExternal('https://github.com/groboclown/warbler-tcm/issues');
          }
        }
      ]
   })

   return ret
}


function _darwinAppMenu(config: MenuConfig): any {
  return {
    label: config.title,
    submenu: [{
      label: `About ${config.title}`,
      selector: 'orderFrontStandardAboutPanel:'
    }, {
      type: 'separator'
    }, {
      label: 'Services',
      submenu: []
    }, {
      type: 'separator'
    }, {
      label: `Hide ${config.title}`,
      accelerator: 'Command+H',
      selector: 'hide:'
    }, {
      label: 'Hide Others',
      accelerator: 'Command+Shift+H',
      selector: 'hideOtherApplications:'
    }, {
      label: 'Show All',
      selector: 'unhideAllApplications:'
    }, {
      type: 'separator'
    }, {
      label: 'Quit',
      accelerator: 'Command+Q',
      click() {
        config.onRequestQuit();
      }
    }]
  }
}

function _accelerator(aug: string, key: string): string {
  let cmd = false
  let alt = false
  let ctrl = false
  let shift = false
  for (let i = 0; i < aug.length; i++) {
    switch (aug[i]) {
      case '%':
        cmd = true
        break
      case '^':
        ctrl = true
        break
      case '&':
        alt = true
        break
      case '*':
        shift = true
        break
    }
  }
  let ret = ''
  if (cmd && process.platform == 'darwin') {
    ret += 'Command+'
  } else {
    ctrl = true
  }
  if (ctrl) {
    ret += 'Ctrl+'
  }
  if (alt) {
    ret += 'Alt+'
  }
  if (shift) {
    ret += 'Shift+'
  }
  return ret + key
}

function _label(label: string, darwinLabel?: string): string {
  if (process.platform == 'darwin') {
    if (darwinLabel) {
      return darwinLabel
    }
    return label.replace('&', '')
  }
  return label
}

function _tailTrim(label: string): string {
  if (label.length > 28) {
    return '...' + label.substring(label.length - 25)
  }
  return label
}
