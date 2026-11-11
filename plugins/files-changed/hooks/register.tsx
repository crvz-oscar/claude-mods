import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { FileEdits } from '../types'

const PANE = 'files-changed'
const edits = atom(
  { plugin: 'files-changed', key: 'edits' } as const,
  {} as FileEdits,
  { shape: 'edits-1' },
)

const pathOf = (e: unknown): string | undefined => {
  const input = e as { file_path?: unknown; notebook_path?: unknown }
  const path = input.file_path ?? input.notebook_path
  return typeof path === 'string' ? path : undefined
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'cambios', description: 'Muestra los archivos editados en esta sesión' })
    return next(e)
  })

  on('command.run', { command: 'cambios' }, async $ => {
    await $.ui.open({ id: PANE, title: 'Archivos cambiados' })
    return { text: 'Panel de archivos cambiados abierto.' }
  })

  on('tool.call', { tool: ['Edit', 'Write', 'NotebookEdit'] }, async ($, e, next) => {
    const result = await next(e)
    const path = pathOf(e)
    if (path) {
      await update($, edits, cur => ({ ...cur, [path]: (cur[path] ?? 0) + 1 }))
    }
    return result
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const all = await read($, edits)
    const rows = Object.entries(all).sort((a, b) => b[1] - a[1])
    const room = Math.max(1, (e.viewport?.rows ?? 24) - 3)

    return (
      <Box flexDirection="column">
        {rows.length === 0 && <Text dimColor>Aún no hay archivos editados.</Text>}
        {rows.slice(0, room).map(([path, count]) => (
          <Text>{path} <Text dimColor>×{count}</Text></Text>
        ))}
      </Box>
    )
  })
}
