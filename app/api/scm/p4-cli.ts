
import * as api from './api'
//import { statDir } from '../files'
//import * as path from 'path'
//import * as childProcess from 'child_process'

export default class PerforceCliScm extends api.ScmApi {
  getFileHistory(filename: string): Promise<api.FileHistory[]> {
    throw new Error(`not implemented for ${filename}`)
  }
  checkOut(filename: string): Promise<void> {
    throw new Error(`not implemented for ${filename}`)
  }
  revert(filename: string): Promise<void> {
    throw new Error(`not implemented for ${filename}`)
  }
  delete(filename: string): Promise<void> {
    throw new Error(`not implemented for ${filename}`)
  }
  listFilesIn(directoryName: string): Promise<api.FileState[]> {
    throw new Error(`not implemented for ${directoryName}`)
  }
  getFileState(filename: string): Promise<api.FileState | null> {
    throw new Error(`not implemented for ${filename}`)
  }
  loadFileRevision(revision: api.FileHistory): Promise<Buffer | null> {
    throw new Error(`not implemented for ${revision.scmPath}`)
  }
}

/*
interface ProcResult {
  error: any | null
  stdout: string
  stderr: string
}

function runP4(cwd: string, args: string[]): Promise<ProcResult> {
  args.splice(0, 0, '-Ztag')
  return new Promise((resolve, reject) => {
    childProcess.execFile('p4', args, {
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
*/
