
import * as api from './api'
import { statDir } from '../files'
import * as path from 'path'
import * as childProcess from 'child_process'

export default class GitCliScm extends api.ScmApi {
  getFileHistory(filename: string): Promise<api.FileHistory[]> {
    return runGit(path.dirname(filename), ['log', '--', filename])
      .then((res) => {
        let lines = res.stdout.split('\r|\n')
        let ret: api.FileHistory[] = []
        let current: api.FileHistory = {
          revision: '', comment: '', when: new Date(), user: '', scmPath: ''
        }
        let state = 0
        lines.forEach((line) => {
          switch (state) {
            case 2:
              if (line.trim().length > 0 && line.startsWith(' ')) {
                if (current.comment.length > 0) {
                  current.comment += '\n'
                }
                current.comment += line.trim()
                break
              }
              // Fall through
            case 0:
              if (line.startsWith('commit ')) {
                current = {
                  revision: line.split(' ')[1],
                  comment: '', when: new Date(), user: '', scmPath: ''
                }
                ret.push(current)
                state = 1
              }
              break;
            case 1:
              if (line.trim().length <= 0) {
                state = 2
              }
              if (line.startsWith('Author:')) {
                current.user = line.substring(7).trim()
              } else if (line.startsWith('Date:')) {
                current.when = new Date(line.substring(5).trim())
              }
              break
          }
        })
        return ret
      })
  }

  /**
   * Mark for add or edit.
   */
  checkOut(): Promise<void> {
    // Does nothing in Git.
    return Promise.resolve()
  }

  revert(filename: string): Promise<void> {
    return runGit(path.dirname(filename), ['reset', 'HEAD', '--', filename])
      .then(() => {})
  }

  /**
   * Mark the file as deleted.  The file will not be deleted on the
   * local file system when this is invoked.  If the API does not
   * delete the file itself when the promise resolves, then the
   * caller will delete it.
   */
  delete(filename: string): Promise<void> {
    return runGit(path.dirname(filename), ['rm', '--', filename])
      .then(() => {})
  }

  listFilesIn(directoryName: string): Promise<api.FileState[]> {
    // TODO use Git instead.
    return statDir(directoryName)
      .then((stats) => {
        let ret: api.FileState[] = []
        stats.forEach((s) => {
          ret.push({
            file: s.filename,
            isDirectory: s.isDirectory,
            status: 'unchanged'
          })
        })
        return Promise.resolve(ret)
      })
  }

  getFileState(filename: string): Promise<api.FileState | null> {
    // TODO use git instead
    // Super inefficient
    return this.listFilesIn(path.dirname(filename))
      .then((fsl) => {
        for (let i = 0; i < fsl.length; i++) {
          if (fsl[i].file == filename) {
            return fsl[i]
          }
        }
        return null
      })
  }

  loadFileRevision(/*revision: api.FileHistory*/): Promise<Buffer | null> {
    return Promise.resolve(null)
  }
}

interface ProcResult {
  error: any | null
  stdout: string
  stderr: string
}

function runGit(cwd: string, args: string[]): Promise<ProcResult> {
  return new Promise((resolve, reject) => {
    childProcess.execFile('git', args, {
      cwd: cwd
    }, (err, stdout, stderr) => {
      if (err != null) {
        reject({ error: err, stdout: stdout, stderr: stderr })
      } else {
        resolve({ error: null, stdout: stdout, stderr: stderr })
      }
    })
  })
}
