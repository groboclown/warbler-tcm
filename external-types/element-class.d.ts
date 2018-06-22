declare module 'element-class' {
  export interface Options {
    el?: HTMLElement
  }

  export class ElementClass {
    constructor(options?: Options | HTMLElement | null)

    add(className: string): string[]
    remove(className: string): string[]
    has(className: string | null | undefined): boolean
    toggle(className: string): void
  }

  export default function createElementClass(options?: Options | HTMLElement | null): ElementClass
}
