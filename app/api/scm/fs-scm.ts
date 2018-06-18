/**
 * Simple file system (no version control) implementation.
 */

import * as api from './api'
import { statDir } from '../files'

export default class LocalScm extends api.ScmApi {
  getFileHistory(): Promise<api.FileHistory[]> {
    return Promise.resolve([
      { revision: 'current', user: 'current', comment: '' }
    ])
  }

  /**
   * Mark for add or edit.
   */
  checkOut(): Promise<void> {
    return Promise.resolve()
  }

  revert(filename: string): Promise<void> {
    return Promise.reject(new Error(`Revert not supported for ${filename}`))
  }

  /**
   * Mark the file as deleted.  The file will not be deleted on the
   * local file system when this is invoked.  If the API does not
   * delete the file itself when the promise resolves, then the
   * caller will delete it.
   */
  delete(): Promise<void> {
    return Promise.resolve()
  }

  listFilesIn(directoryName: string): Promise<api.FileState[]> {
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

  loadFileRevision(/*revision: api.FileHistory*/): Promise<Buffer | null> {
    return Promise.resolve(null)
  }
}
