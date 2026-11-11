export type ModelChoice = 'default' | 'opus' | 'sonnet' | 'haiku'

declare module 'claude-code' {
  interface PluginState {
    'model-switch': { model: Shaped<ModelChoice> }
  }
}
