export type SessionTokens = {
  id: string
  cwd: string
  startedAt: number
  updatedAt: number
  turns: number
  input: number
  output: number
  cacheRead: number
  cacheWrite: number
}

declare module 'claude-code' {
  interface PluginState {
    'token-usage': { sessions: Shaped<Record<string, SessionTokens>> }
  }
}
