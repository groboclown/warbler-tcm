
import { loadSettings } from './settings'

export default function generateId(prefix?: string): Promise<string> {
  return loadSettings().then((settings) => {
    let id: number = settings.getIdIndex(prefix || 'ID') + 1
    settings.setIdIndex(prefix || 'ID', id)
    return settings
      .save()
      .then(() => { return (prefix || 'ID') + '-' + id })
  })
}
