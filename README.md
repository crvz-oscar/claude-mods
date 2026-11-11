# claude-mods

Mods para Claude Code, cada uno en `plugins/<nombre>/`.

## Instalar

```
/plugin marketplace add crvz-oscar/claude-mods
/plugin install token-usage --marketplace crvz-oscar/claude-mods
```

## Mods

- **token-usage**: muestra el uso de tokens por sesión (entrada, salida, caché) en un panel `/tokens` y en la línea de estado.
- **model-switch**: selector de modelo encima del prompt (opus, sonnet, haiku o default) para cambiar de modelo durante la sesión. También funciona con `/modelo`.
