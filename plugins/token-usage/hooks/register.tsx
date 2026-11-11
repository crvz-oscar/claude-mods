import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { SessionTokens } from '../types'

const PANE = 'token-usage'
const STORE_KEY = 'sessions'
const sessions = atom(
  { plugin: 'token-usage', key: 'sessions' } as const,
  {} as Record<string, SessionTokens>,
  { shape: 'sessions-1' },
)

const fmt = (n: number) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}k` : String(n)
const total = (s: SessionTokens) => s.input + s.output + s.cacheRead + s.cacheWrite
const when = (ms: number) => new Date(ms).toISOString().slice(0, 16).replace('T', ' ')

export const register: Register = on => {
  // Carga lo guardado de sesiones anteriores y registra la actual.
  on('session.start', async ($, e, next) => {
    const saved = ((await $.store.get(STORE_KEY)) ?? {}) as Record<string, SessionTokens>
    const id = await $.session.id()
    const now = $.clock.now()
    await update($, sessions, cur => ({
      ...saved,
      ...cur,
      [id]: (cur[id] ?? saved[id]) ?? {
        id, cwd: e.cwd, startedAt: now, updatedAt: now,
        turns: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0,
      },
    }))
    await $.command.register({
      name: 'tokens',
      description: 'Muestra el uso de tokens por sesión',
    })
    return next(e)
  })

  on('command.run', { command: 'tokens' }, async $ => {
    await $.ui.open({ id: PANE, title: 'Tokens por sesión' })
    return { text: 'Panel de tokens abierto.' }
  })

  // Acumula el uso de cada turno en la sesión actual.
  on('turn.complete', async ($, e, next) => {
    const u = e.usage
    if (u) {
      const id = await $.session.id()
      const now = $.clock.now()
      let mine!: SessionTokens
      await update($, sessions, cur => {
        const s: SessionTokens = cur[id] ?? {
          id, cwd: '', startedAt: now, updatedAt: now,
          turns: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0,
        }
        mine = {
          ...s,
          updatedAt: now,
          turns: s.turns + 1,
          input: s.input + u.input_tokens,
          output: s.output + u.output_tokens,
          cacheRead: s.cacheRead + u.cache_read_input_tokens,
          cacheWrite: s.cacheWrite + u.cache_creation_input_tokens,
        }
        return { ...cur, [id]: mine }
      })
      const all = await read($, sessions)
      await $.store.set(STORE_KEY, all)
    }
    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const all = await read($, sessions)
    const current = await $.session.id()
    const list = Object.values(all).sort((a, b) => b.updatedAt - a.updatedAt)
    const room = Math.max(1, Math.floor(((e.viewport?.rows ?? 24) - 6) / 2))
    const sum = list.reduce((n, s) => n + total(s), 0)

    return (
      <Box flexDirection="column">
        <Text bold>Total acumulado: {fmt(sum)} tokens · {list.length} sesiones</Text>
        {list.length === 0 && <Text dimColor>Aún no hay turnos registrados.</Text>}
        {list.slice(0, room).map(s => (
          <Box flexDirection="column">
            <Text bold={s.id === current}>
              {s.id === current ? '▶ ' : '  '}{s.id.slice(0, 8)} · {when(s.updatedAt)} · {fmt(total(s))}
            </Text>
            <Text dimColor>
              {'    '}entrada {fmt(s.input)} · salida {fmt(s.output)} · caché leída {fmt(s.cacheRead)} · caché escrita {fmt(s.cacheWrite)} · {s.turns} turnos
            </Text>
          </Box>
        ))}
      </Box>
    )
  })
}
