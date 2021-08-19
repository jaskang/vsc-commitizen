'use strict';
import * as vscode from 'vscode';
import * as execa from 'execa';
import { Commitizen } from "./commitizen";
let output: vscode.OutputChannel;

function hasOutput(result?: { stdout?: string }): boolean {
    return Boolean(result && result.stdout);
}

async function hasStagedFiles(cwd: string): Promise<boolean> {
    const result = await execa('git', ['diff', '--name-only', '--cached'], { cwd });
    return hasOutput(result);
}

async function conditionallyStageFiles(cwd: string): Promise<void> {
    const hasSmartCommitEnabled = vscode.workspace.getConfiguration('git', null)
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
        const result = await execa('git', ['commit', '-m', message], { cwd });
        await vscode.commands.executeCommand('git.refresh');
        // await vscode.commands.executeCommand('git.sync');
        if (hasOutput(result)) {
            result.stdout.split('\n').forEach((line: string) => output.appendLine(line));
            output.show();
        }
    } catch (e) {
        vscode.window.showErrorMessage(e.message);
        output.appendLine(e.message);
        output.appendLine(e.stack);
    }
}

export async function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "vsc-commitizen" is now active!');

    output = vscode.window.createOutputChannel('vsc-commitizen');
    output.appendLine('vsc-commitizen started');

    let commitCmd = vscode.commands.registerCommand('vsc-commitizen.commit', async () => {
        const cz = new Commitizen();
        await cz.reloadConfigs();
        let isContinue: boolean = false;
        isContinue = await cz.getType();
        if (isContinue === false) { return; }
        isContinue = await cz.getScope();
        if (isContinue === false) { return; }
        isContinue = await cz.getSubject();
        if (isContinue === false) { return; }
        const result = vscode.workspace.getConfiguration().get('vsc-commitizen.enableVerbose');
        if (result === true) {
            isContinue = await cz.getBody();
            if (isContinue === false) { return; }
            isContinue = await cz.getFooter();
            if (isContinue === false) { return; }
            isContinue = await cz.getFooterMessage();
            if (isContinue === false) { return; }
        }
        if (cz.message && vscode.workspace.workspaceFolders) {
            await commit(vscode.workspace.workspaceFolders[0].uri.fsPath, cz.message.trim());
        }
    });
    context.subscriptions.push(commitCmd);
}

export function deactivate() {
}
