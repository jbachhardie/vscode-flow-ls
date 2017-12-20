'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;

var _path = require('path');

var path = _interopRequireWildcard(_path);

var _vscode = require('vscode');

var _vscodeLanguageclient = require('vscode-languageclient');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function activate(context) {
  const serverModule = context.asAbsolutePath(path.join('node_modules', 'flow-language-server', 'lib', 'bin', 'cli.js'));
  const debugOptions = { execArgv: ['--nolazy', '--debug=6009'] };
  const serverOptions = {
    run: { module: serverModule, transport: _vscodeLanguageclient.TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: _vscodeLanguageclient.TransportKind.ipc,
      options: { execArgv: ['--nolazy', '--try-flow-bin'] }
    }
  };

  const clientOptions = {
    documentSelector: [{ scheme: 'file', language: 'javascript' }, { scheme: 'file', language: 'javascriptreact' }],
    synchronize: {
      configurationSection: 'flow',
      fileEvents: _vscode.workspace.createFileSystemWatcher('**/*.{js,jsx,js.flow}')
    }
  };

  const statusBarItem = _vscode.window.createStatusBarItem(_vscode.StatusBarAlignment.Left, 0);
  let serverRunning = false;

  const client = new _vscodeLanguageclient.LanguageClient('flow', 'Flow', serverOptions, clientOptions);
  const running = 'Flow server is running.';
  const stopped = 'Flow server stopped.';

  client.onDidChangeState(event => {
    if (event.newState === _vscodeLanguageclient.State.Running) {
      client.info(running);
      statusBarItem.tooltip = running;
      serverRunning = true;
    } else {
      client.info(stopped);
      statusBarItem.tooltip = stopped;
      serverRunning = false;
    }
    udpateStatusBarVisibility(statusBarItem, serverRunning);
  });

  client.onTelemetry(event => console.log(event));

  const disposable = client.start();

  context.subscriptions.push(disposable);
}

function udpateStatusBarVisibility(statusBarItem, show) {
  if (show) {
    statusBarItem.show();
    statusBarItem.text = 'Flow';
  } else {
    statusBarItem.hide();
  }
}
//# sourceMappingURL=extension.js.map