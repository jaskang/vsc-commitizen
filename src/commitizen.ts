import * as vscode from 'vscode';
import { join } from 'path';
import { pathExists, readJson } from 'fs-extra';

interface Configs {
  types: {
    label: string;
    description: string;
  }[];
  scopes: {
    label: string;
    description: string;
  }[];
}

async function ask(
  question: string,
  save: (input: string) => void,
  validate?: (input: string) => string
): Promise<boolean> {
  const options: vscode.InputBoxOptions = {
    placeHolder: question,
    ignoreFocusOut: true
  };
  if (validate) {
    options.validateInput = validate;
  }
  const input = await vscode.window.showInputBox(options);
  if (input === undefined) {
    return false;
  }
  save(input);
  return true;
}

const defaultConfigs = {
  types: [
    { label: 'feat', description: '新功能特性' },
    { label: 'fix', description: 'bug修复' },
    { label: 'docs', description: '文档变更' },
    {
      label: 'style',
      description: '样式--不影响代码含义的更改(空白、格式、缺少分号等)'
    },
    {
      label: 'refactor',
      description: '重构--既不修复bug也不添加特性的代码更改'
    },
    { label: 'perf', description: '重构--改进性能的代码更改' },
    { label: 'test', description: '添加缺失的测试' },
    { label: 'chore', description: '对构建过程或辅助工具和库的更改' },
    { label: 'revert', description: '还原到提交' }
  ],
  scopes: []
};
async function askOneOf(
  question: string,
  picks: vscode.QuickPickItem[],
  save: (pick: vscode.QuickPickItem) => void,
  customLabel?: string,
  customQuestion?: string
): Promise<boolean> {
  const pickOptions: vscode.QuickPickOptions = {
    placeHolder: question,
    ignoreFocusOut: true,
    matchOnDescription: true,
    matchOnDetail: true
  };
  const pick = await vscode.window.showQuickPick(picks, pickOptions);
  if (pick && pick.label === customLabel && !!customQuestion) {
    const next = await ask(customQuestion || '', input => {
      save({ label: input, description: '' });
      return true;
    });
    return next;
  }
  if (pick === undefined) {
    return false;
  }
  save(pick);
  return true;
}

export class Commitizen {
  private configs: Configs;
  private type: string | undefined;
  private scope: string | undefined;
  private subject: string | undefined;
  constructor() {
    this.configs = defaultConfigs;
  }
  public async reloadConfigs(): Promise<void> {
    if (vscode.workspace.workspaceFolders) {
      let configPath = join(vscode.workspace.workspaceFolders[0].uri.fsPath, '.vsc-commitizen.json');
      const exists = await pathExists(configPath);
      if (exists) {
        const packageObj = await readJson(configPath);
        this.configs = Object.assign({}, defaultConfigs, packageObj);
      }
    }
  }
  public get message(): string {
    if (this.type && this.subject) {
      return this.type + (this.scope ? `(${this.scope})` : '') + ': ' + this.subject;
    }
    return '';
  }
  public async getType(): Promise<void> {
    await askOneOf('type用于说明commit的类型', this.configs.types, pick => {
      this.type = pick.label;
      console.log(this.type);
    });
  }
  public async getScope(): Promise<void> {
    const scopePicks = this.configs.scopes.map(scope => ({
      label: scope.label,
      description: scope.description || ''
    }));
    scopePicks.unshift({
      label: '无',
      description: '本次提交无需scope'
    });
    scopePicks.push({
      label: '自定义',
      description: '自己填写scope'
    });
    await askOneOf(
      'scope用于说明本次Commit所影响的范围',
      scopePicks,
      pick => {
        if (pick.label === '无') {
          this.scope = '';
        } else {
          this.scope = pick.label;
        }
      },
      '自定义',
      '输入一个新的scope'
    );
  }
  public async getSubject(): Promise<void> {
    const validator = (input: string) => {
      if (input.length === 0) {
        return `subject 不能为空`;
      }
      return '';
    };
    await ask('subject是本次commit目的的简短描述，一般不要超过50个字符', input => (this.subject = input), validator);
  }
}
