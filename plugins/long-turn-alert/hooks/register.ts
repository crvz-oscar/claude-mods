import type { Register } from 'claude-code'

const LIMIT_SECONDS = 60
let startedAt = 0

export const register: Register = on => {
  on('prompt.submit', async ($, e, next) => {
    startedAt = await $.clock.now()
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    if (e.agentId || e.reason !== 'answer' || startedAt === 0) return next(e)
    const seconds = Math.round(((await $.clock.now()) - startedAt) / 1000)
    if (seconds >= LIMIT_SECONDS) {
      await $.ui.notify(`La respuesta tardó ${seconds} s`, { title: 'Claude terminó' })
    }
    startedAt = 0
    return next(e)
  })
}
