
import * as api from './api'

export default class MercurialCliScm extends api.ScmApi {
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
