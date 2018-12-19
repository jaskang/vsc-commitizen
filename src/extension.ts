'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as execa from 'execa';
import {Commitizen} from "./commitizen";
let output: vscode.OutputChannel;

function hasOutput(result?: {stdout?: string}): boolean {
    return Boolean(result && result.stdout);
  }
  
async function hasStagedFiles(cwd: string): Promise<boolean> {
    const result = await execa('git', ['diff', '--name-only', '--cached'], {cwd});
    return hasOutput(result);
  }
  
async function conditionallyStageFiles(cwd: string): Promise<void> {
    const hasSmartCommitEnabled = vscode.workspace.getConfiguration('git')
      .get<boolean>('enableSmartCommit') === true;
  
    if (hasSmartCommitEnabled && !(await hasStagedFiles(cwd))) {
        output.appendLine('Staging all files (enableSmartCommit enabled with nothing staged)');
      await vscode.commands.executeCommand('git.stageAll');
    }
  }
async function commit(cwd: string, message: string): Promise<void> {
    output.appendLine(`About to commit '${message}'`);
    try {
      await conditionallyStageFiles(cwd);
      const result = await execa('git', ['commit', '-m', message], {cwd});
      await vscode.commands.executeCommand('git.refresh');
    // await vscode.commands.executeCommand('git.sync');
      if (hasOutput(result)) {
        result.stdout.split('\n').forEach((line:string) => output.appendLine(line));
        output.show();
      }
    } catch (e) {
      vscode.window.showErrorMessage(e.message);
      output.appendLine(e.message);
      output.appendLine(e.stack);
    }
  }
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "vsc-commitizen" is now active!');
    // 创建输出窗口
    output = vscode.window.createOutputChannel('vsc-commitizen');
    output.appendLine('vsc-commitizen started');
    
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('vsc-commitizen.commit', async() => {
        // The code you place here will be executed every time your command is executed
        const cz = new Commitizen();
        await cz.reloadConfigs();
        await cz.getType();
        await cz.getScope();
        await cz.getSubject();
        if (cz.message && vscode.workspace.workspaceFolders) {
            await commit(vscode.workspace.workspaceFolders[0].uri.fsPath, cz.message.trim());
        }
        // Display a message box to the user
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}