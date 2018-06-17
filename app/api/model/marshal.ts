/**
 * Reads and writes the model to/from file.
 */

import * as fs from 'fs'
import { readJsonFile, writeJsonFile } from '../files'
import { TestPlan } from './plan'

export const EXTENSION = '.wtp.json'

export function findTestPlans(basedir: string): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    fs.readdir(basedir, (err, files) => {
      if (err) reject(err)
      let ret: string[] = []
      files.forEach(file => {
        if (file.endsWith(EXTENSION)) {
          ret.push(file)
        }
      })
      resolve(ret)
    })
  })
}

export function readTestPlan(filename: string): Promise<TestPlan> {
  return readJsonFile(filename)
    .then((obj: any) => {
      return new TestPlan(obj)
    })
}

export function writeTestPlan(filename: string, plan: TestPlan): Promise<void> {
  return writeJsonFile(filename, plan.serialize())
}
