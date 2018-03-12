# FlowJS Type Checking for VSCode using Flow Language Server

Integration of flow language server into vscode. Provides intellisense and
diagnostics for Flow files.

Flow diagnostics and intellisense can conflict with the Typescript built-in
extension. When using this extension you should disable the
`Typescript and JavaScript Language Features` built-in extension, which you can
find by searching `@builtin Typescript` in the Extension tab.

## Known Issues

1.  Diagnostics aren't cleared for a file when all problems in that file have
    been resolved but other problems still exist in the project. This is a bug
    in the languageserver (see
    [issue #64](https://github.com/flowtype/flow-language-server/issues/64)).
