# claude-mods

Mods para Claude Code, cada uno en `plugins/<nombre>/`.

## Instalar

```
/plugin marketplace add crvz-oscar/claude-mods
/plugin install <nombre> --marketplace crvz-oscar/claude-mods
```

## Mods

- **token-usage**: uso de tokens por sesión (entrada, salida, caché) en un panel `/tokens`.
- **model-switch**: selector de modelo encima del prompt (opus, sonnet, haiku o default) para cambiar de modelo durante la sesión. También funciona con `/modelo`.
- **status-bar**: barra de estado con modelo, porcentaje de contexto y coste de la sesión.
- **long-turn-alert**: notificación cuando una respuesta tarda más de 60 segundos.
- **files-changed**: lista de archivos editados en la sesión, se abre con `/cambios`.
