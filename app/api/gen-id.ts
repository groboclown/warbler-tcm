
import { loadSettings } from './settings'

export default function generateId(prefix?: string): Promise<string> {
  return loadSettings().then((settings) => {
    let id: number = settings.get('id', prefix || 'ID', 0) + 1
    return settings.put('id', prefix || 'ID', id)
      .save()
      .then(() => { return (prefix || 'ID') + '-' + id })
  })
}
