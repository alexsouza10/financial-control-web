import { defineNitroPlugin } from '#imports'
import { FormData } from 'formdata-node'

export default defineNitroPlugin(() => {
  if (!globalThis.FormData) {
    (globalThis as any).FormData = FormData
  }
})
