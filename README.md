# vsc-commitizen README

## 这是一个用来格式化 Commit message 的插件

> 用以提供符合 [commitizen](https://github.com/commitizen/cz-cli) 的 Commit message

## 功能

![commit](assets/commit.png 'commit')

![type](assets/type.png 'type')

![scope](assets/scope.png 'scope')

![subject](assets/subject.png 'subject')

> 支持预设 scope  
> 在项目根目录添加 .vsc-commitizen.json

```json
{
  "scopes": [
    {
      "label": "用户",
      "description": "用户模块"
    },
    {
      "label": "组件",
      "description": "基础组件"
    },
    {
      "label": "视图",
      "description": "前端视图"
    }
  ]
}
```

## Commit message 的格式

每次提交，Commit message 都包括三个部分：Header，Body 和 Footer。

```xml
<type>(<scope>): <subject>
// 空一行
<body>
// 空一行
<footer>
```

其中，Header 是必需的，Body 和 Footer 可以省略。

不管是哪一个部分，任何一行都不得超过 72 个字符（或 100 个字符）。这是为了避免自动换行影响美观。

2.1 Header
Header 部分只有一行，包括三个字段：type（必需）、scope（可选）和 subject（必需）。

#### type

type 用于说明 commit 的类别，只允许使用下面标识

> feat:新功能特性  
> fix:bug 修复  
> docs:文档变更  
> style:样式--不影响代码含义的更改(空白、格式、缺少分号等)  
> refactor:重构--既不修复 bug 也不添加特性的代码更改  
> perf:重构--改进性能的代码更改  
> test:添加缺失的测试  
> chore:对构建过程或辅助工具和库的更改  
> revert:还原到提交

#### scope

scope 用于说明 commit 影响的范围，比如数据层、控制层、视图层等等，视项目不同而不同。

#### subject

subject 是 commit 目的的简短描述，不超过 50 个字符。

以动词开头，使用第一人称现在时，比如 change，而不是 changed 或 changes
第一个字母小写
结尾不加句号（.）

转自[阮一峰 Commit message 和 Change log 编写指南](http://www.ruanyifeng.com/blog/2016/01/commit_message_change_log.html)
