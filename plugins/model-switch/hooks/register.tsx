import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { ModelChoice } from '../types'

const CHOICES: readonly ModelChoice[] = ['default', 'opus', 'sonnet', 'haiku']
const model = atom(
  { plugin: 'model-switch', key: 'model' } as const,
  'default' as ModelChoice,
  { shape: 'model-1' },
)

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'modelo',
      description: 'Cambia el modelo de esta sesión: /modelo opus | sonnet | haiku | default',
    })
    return next(e)
  })

  on('command.run', { command: 'modelo' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    if (arg === '') {
      return { text: `Modelo elegido: ${await read($, model)}. Uso: /modelo opus | sonnet | haiku | default` }
    }
    if (!(CHOICES as readonly string[]).includes(arg)) {
      return { text: `"${arg}" no es un modelo válido. Usa: opus, sonnet, haiku o default.` }
    }
    await update($, model, () => arg as ModelChoice)
    return { text: `Modelo cambiado a ${arg} para las próximas respuestas.` }
  })

  // Aplica el modelo elegido a las peticiones del hilo principal.
  on('turn.step', async function* ($, e, next) {
    const choice = await read($, model)
    if (e.agentId || choice === 'default' || choice === e.model) return yield* next(e)
    return yield* next({ ...e, model: choice })
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const { Box, Select, Text } = $.ui.resolve(e)
    const choice = await read($, model)
    const current = await $.session.model()

    return (
      <Box>
        <Text dimColor>Modelo </Text>
        <Select
          key="model"
          options={CHOICES.map(value => ({ value, label: value }))}
          value={choice}
          onSelect={value => {
            void update($, model, () => value as ModelChoice)
            $.ui.toast(`Modelo: ${value}`)
          }}
        />
        <Text dimColor> ahora: {current}</Text>
      </Box>
    )
  })
}
