import type { Register } from 'claude-code'

export const register: Register = on => {
  // Se actualiza tras cada turno del hilo principal, con las cifras que el motor mide.
  on('session.measure', async ($, e, next) => {
    const model = await $.session.model()
    const percent = e.context.percent ?? '–'
    const cost = e.cost ? ` · $${e.cost.usd.toFixed(2)}` : ''
    $.ui.status(`${model} · ctx ${percent}%${cost}`)
    return next(e)
  })
}
