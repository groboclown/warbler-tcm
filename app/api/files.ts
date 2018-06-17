import * as fs from 'fs'
import * as path from 'path'

export function isExists(name: string): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    fs.stat(name, (exists) => {
      if (exists == null) resolve(true)
      else resolve(false)
      //} else if (exists.code === 'ENOENT') {
    });
  })
}

export function readTextFile(filename: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    fs.readFile(filename, (err, result: Buffer) => {
      if (err) reject(err)
      else resolve(String.fromCharCode.apply(null, new Uint16Array(result)))
    });
  });
}


export function writeFile(filename: string, contents: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(filename, contents, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}

export function readJsonFile(filename: string): Promise<object> {
  return readTextFile(filename)
    .then((res) => {
      return JSON.parse(res)
    })
}

export function writeJsonFile(filename: string, contents: object): Promise<void> {
  return writeFile(filename, JSON.stringify(contents))
}

export interface FileStat {
  name: string
  /** Full file path: parent + name */
  filename: string
  parent: string
  ext: string
  isBlockDevice: boolean
  isCharacterDevice: boolean
  isDirectory: boolean
  isFifo: boolean
  isFile: boolean
  isSocket: boolean
  isSymbolicLink: boolean
  modifiedTime: number
  accessedTime: number
}

export function statDir(directoryName: string): Promise<FileStat[]> {
  return new Promise<string[]>((resolve, reject) => {
    fs.readdir(directoryName, (err, files) => {
      if (err) reject(err)
      else resolve(files)
    })
  })
  .then((files: string[]) => {
    return Promise.all(files.map((f) => {
      return new Promise<FileStat>((resolve, reject) => {
        const fn = path.join(directoryName, f)
        fs.lstat(fn, (err, stat) => {
          if (err) reject(err)
          else resolve({
            name: f,
            filename: fn,
            parent: directoryName,
            ext: path.extname(f),
            isBlockDevice: stat.isBlockDevice(),
            isCharacterDevice: stat.isCharacterDevice(),
            isDirectory: stat.isDirectory(),
            isFifo: stat.isFIFO(),
            isFile: stat.isFile(),
            isSocket: stat.isSocket(),
            isSymbolicLink: stat.isSymbolicLink(),
            modifiedTime: stat.mtimeMs,
            accessedTime: stat.atimeMs
          })
        })
      })
    }))
  })
}
