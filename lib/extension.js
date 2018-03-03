// @flow
"use strict";

import * as path from "path";

import {
  workspace,
  ExtensionContext,
  Uri
} from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
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

  const client = new LanguageClient(
    "flow",
    "Flow",
    serverOptions,
    clientOptions
  );

  const disposable = client.start();

  context.subscriptions.push(disposable);
}
