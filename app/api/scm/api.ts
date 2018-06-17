

export interface FileHistory {
  revision: string
  comment: string
  user: string
}

export interface FileState {
  file: string
  status: 'unknown' | 'edit' | 'ignore' | 'add' | 'delete' | 'unchanged'
  isDirectory: boolean
}

export interface ScmDescription {
  name: string
  description: string
}

/**
 * General API for interacting with the version control system.
 *
 * SCM implementations must provide these methods.
 *
 * All methods return a Promise, and the proper reject handling msut be
 * done for error messages.
 */
export abstract class ScmApi {
  abstract getFileHistory(filename: string): Promise<FileHistory[]>

  /**
   * Mark for add or edit.
   */
  abstract checkOut(filename: string): Promise<void>

  abstract revert(filename: string): Promise<void>

  /**
   * Mark the file as deleted.  The file will not be deleted on the
   * local file system when this is invoked.  If the API does not
   * delete the file itself when the promise resolves, then the
   * caller will delete it.
   */
  abstract delete(filename: string): Promise<void>

  abstract listFilesIn(directoryName: string): Promise<FileState[]>
}
