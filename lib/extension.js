// @flow
"use strict";

import * as path from "path";

import {
  workspace,
  window,
  ExtensionContext,
  StatusBarAlignment,
  Uri
} from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
  State
} from "vscode-languageclient";

export function activate(context: ExtensionContext) {
  const serverModule = context.asAbsolutePath(
    path.join("node_modules", "flow-language-server", "lib", "bin", "cli.js")
  );
  const debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };
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
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      { scheme: "file", language: "javascript" },
      { scheme: "file", language: "javascriptreact" }
    ],
    synchronize: {
      configurationSection: "flow",
      fileEvents: workspace.createFileSystemWatcher("**/*.{js,jsx,js.flow}")
    },
    uriConverters: {
      code2Protocol: (uri: Uri) => uri.toString(true) // this disables URL-encoding for file URLs
    }
  };

  const statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 0);
  let serverRunning: boolean = false;

  const client = new LanguageClient(
    "flow",
    "Flow",
    serverOptions,
    clientOptions
  );
  const running = "Flow server is running.";
  const stopped = "Flow server stopped.";

  client.onDidChangeState(event => {
    if (event.newState === State.Running) {
      client.info(running);
      statusBarItem.tooltip = running;
      serverRunning = true;
    } else {
      client.info(stopped);
      statusBarItem.tooltip = stopped;
      serverRunning = false;
    }
    updateStatusBarVisibility(statusBarItem, serverRunning);
  });

  const disposable = client.start();

  context.subscriptions.push(disposable);
}

function updateStatusBarVisibility(statusBarItem, show: boolean): void {
  if (show) {
    statusBarItem.show();
    statusBarItem.text = "Flow";
  } else {
    statusBarItem.hide();
  }
}
