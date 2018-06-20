import { loadSettings } from '../settings'
import * as EventEmitter from 'events'

const THEME_EMITTER = new EventEmitter()

const THEME_CHANGED_EVENT = 'theme-changed'

export interface ThemeChangedListener {
  (newTheme: string): void
}

export function addThemeChangedListener(listener: ThemeChangedListener) {
  THEME_EMITTER.addListener(THEME_CHANGED_EVENT, listener)
}

export function removeThemeChangedListener(listener: ThemeChangedListener) {
  THEME_EMITTER.removeListener(THEME_CHANGED_EVENT, listener)
}

export function getTheme(): Promise<string> {
  return loadSettings()
    .then((settings) => settings.getTheme())
}

export function setTheme(theme: string): Promise<void> {
  return loadSettings()
    .then((settings) => {
      settings.setTheme(theme)
      THEME_EMITTER.emit(THEME_CHANGED_EVENT, theme)
      return settings.save()
    })
    .then(() => {})
}
