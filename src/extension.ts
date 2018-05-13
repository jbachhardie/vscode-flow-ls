import * as path from 'path'
import {
  workspace,
  ExtensionContext,
  StatusBarAlignment,
  Uri,
  window
} from 'vscode'
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
  State
} from 'vscode-languageclient'
import createSpinner = require('elegant-spinner')

class FlowStatusElement {
  statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 0)
  status: 'stopped' | 'busy' | 'ready' = 'stopped'
  spinner?: NodeJS.Timer

  busy() {
    const prevStatus = this.status
    this.status = 'busy'
    if (prevStatus === 'stopped') {
      this.statusBarItem.show()
    }
    if (prevStatus !== 'busy') {
      const frame = createSpinner()
      this.spinner = setInterval(
        () => (this.statusBarItem.text = 'Flow ' + frame()),
        200
      )
    }
  }

  ready() {
    const prevStatus = this.status
    this.status = 'ready'
    if (prevStatus === 'busy') {
      clearInterval(this.spinner)
    }
    if (prevStatus !== 'ready') {
      this.statusBarItem.text = 'Flow'
    }
  }

  stopped() {
    this.status = 'stopped'
    this.statusBarItem.hide()
  }
}

export function activate(context: ExtensionContext) {
  const statusBar = new FlowStatusElement()

  const serverModule = context.asAbsolutePath(
    path.join('node_modules', 'flow-language-server', 'lib', 'bin', 'cli.js')
  )
  const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] }
  const serverOptions: ServerOptions = {
    run: {
      module: serverModule,
      transport: TransportKind.ipc
    },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: debugOptions
    }
  }

  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      { scheme: 'file', language: 'javascript' },
      { scheme: 'file', language: 'javascriptreact' }
    ],
    synchronize: {
      configurationSection: 'flow',
      fileEvents: workspace.createFileSystemWatcher('**/*.{js,jsx,mjs,js.flow}')
    },
    uriConverters: {
      code2Protocol: uri => uri.toString(true), // this disables URL-encoding for file URLs
      protocol2Code: value => Uri.parse(value)
    },
    middleware: {
      didSave(document, next) {
        statusBar.busy()
        // This is some very naughty accessing of private fields but what can you do
        ;(this as any)._client.setDiagnostics(document.uri, [])
        next(document)
      },
      handleDiagnostics(uri, diangostics, next) {
        statusBar.ready()
        next(uri, diangostics)
      }
    }
  }

  const client = new LanguageClient(
    'flow',
    'Flow',
    serverOptions,
    clientOptions
  )

  client.onDidChangeState(event => {
    if (event.newState === State.Running) {
      client.info('Flow starting')
      statusBar.busy()
    } else {
      client.info('Flow stopped')
      statusBar.stopped()
    }
  })

  const disposable = client.start()

  context.subscriptions.push(disposable)
}
