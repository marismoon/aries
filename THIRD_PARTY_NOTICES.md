# 第三方许可声明

本仓库自有代码以 [MIT 许可证](LICENSE) 发布。下表列出仓库中**内嵌**或**随构建产物分发**、且有单独许可要求的第三方内容。MIT 许可证不覆盖这些内容，它们分别遵循各自的许可证。

| 内容 | 作者 | 许可证 | 仓库中的位置 | 修改 |
| --- | --- | --- | --- | --- |
| [Solar 图标](https://www.figma.com/community/file/1166831539721848736) | 480 Design | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | `packages/ui/src/components/icons/solar/`（136 个文件） | 已从 SVG 转换为 React 组件 |
| [shadcn/ui](https://github.com/shadcn-ui/ui) | shadcn | MIT | `packages/ui/src/components/ui/`、`packages/ui/src/styles/shadcn.css`、`apps/demo/src/features/settings/examples/` | 组件按项目设计令牌调整；`shadcn.css` 原样内置自 shadcn 包的 `dist/tailwind.css`；示例尽量贴近上游 |
| [Inter](https://github.com/rsms/inter) | The Inter Project Authors | [SIL OFL 1.1](https://openfontlicense.org/) | 未内嵌，经 npm 包 `@fontsource-variable/inter` 引入，由可选入口 `@marismoon/ui/styles/fonts.css` 加载 | 无 |
| [Noto Sans SC](https://github.com/notofonts/noto-cjk) | Google Inc. | [SIL OFL 1.1](https://openfontlicense.org/) | 未内嵌，经 npm 包 `@fontsource-variable/noto-sans-sc` 引入，由可选入口 `@marismoon/ui/styles/fonts.css` 加载 | 无 |

## 使用义务

- **Solar 图标（CC BY 4.0）**：分发或改编时须保留署名「Solar by 480 Design」、附上许可证链接，并说明做过的修改。每个图标文件的首行注释保留了来源与许可证，新增图标时必须沿用同样的注释。
- **shadcn/ui（MIT）**：复制或分发其代码的实质部分时，须附带下方的版权与许可声明。
- **字体（SIL OFL 1.1）**：两套字体以 npm 包形式安装，许可证文件随包提供。构建产物会包含字体文件，对外分发构建结果时须一并提供 OFL 许可证文本，且不得单独出售字体。

## 致谢

`apps/demo/src/features/settings/aceternity-demos.tsx` 中的动效示例参照 [Aceternity UI](https://ui.aceternity.com) 的交互模式。据源码注释，这些示例基于项目设计令牌自行重写，未引入 Aceternity UI 的组件源码。

## 其他依赖

其余 npm 依赖遵循各自包内声明的许可证，可运行 `pnpm licenses list -r --prod` 查看。

## shadcn/ui 许可证原文

```text
MIT License

Copyright (c) 2023 shadcn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
