# flow-ls

Integration of flow language server into vscode. Provides intellisense and diagnostics for Flow files.

Flow diagnostics and intellisense can conflict with the Typescript built-in extension. You can disable Typescript server diagnostics with the `"javascript.validate.enable": false` setting but you will still get duplicate intellisense until support for disabling built-in extensions lands.