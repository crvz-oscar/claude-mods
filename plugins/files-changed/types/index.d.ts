export type FileEdits = Record<string, number>

declare module 'claude-code' {
  interface PluginState {
    'files-changed': { edits: Shaped<FileEdits> }
  }
}
