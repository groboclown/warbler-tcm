import { BrowserWindow, remote } from 'electron'
import { loadSettings } from '../settings'

export function createContextMenu(window: BrowserWindow, template: any[]) {
    window.webContents.on('context-menu', (_, props) => {
      const { x, y } = props;

      loadSettings()
        .then((settings) => {
          if (settings.debug()) {
            let t: any[] = []
            for (let i = 0; i < template.length; i++) {
              t.push(template[i])
            }
            if (t.length > 0) {
              t.push({ type: 'separator' })
            }
            t.push({
              label: 'Inspect element',
              click() {
                window.webContents.inspectElement(x, y);
              }
            })
          }

          remote.Menu.buildFromTemplate(template).popup(window);
        })
    });
}
