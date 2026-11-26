# @marismoon/create-aries

## 0.1.0-next.5

### Patch Changes

- 96e1067: 品牌主题精简为 Aries Analytics、静心雾蓝、北极光、暖陶土和极简灰，Aries Analytics 为默认。原配色键失效时回退到新默认主题。Starter 同步首帧主题恢复和配色轮换。

  三个 WebGL 背景与 Shell 的自定义背景仅在暗色玻璃模式挂载。改进外壳导航选中态与命令面板的路由焦点恢复。

- a845298: Shell 支持宿主接入头像菜单、目录内浮层和帮助入口。命令面板支持分组及快捷键提示，Starter 默认收起演示占位。

  更新暗色玻璃的卡片、选中态和浮层材质，并为主题与语言切换控件补充遵循减少动态效果偏好的动效。

## 0.1.0-next.4

- 更新内置 Starter 模板，加入四套品牌配色与刷新时的主题恢复。生成的项目依赖同版本的 `@marismoon/ui` 与 `@marismoon/shell`。

## 0.1.0-next.3

### Patch Changes

- 2a72bcc: 修复 `npm create @marismoon/aries` / `pnpm create @marismoon/aries` 不执行任何操作的问题：经 `node_modules/.bin` 符号链接启动时，CLI 现在按真实路径识别入口。0.1.0-next.1 与 0.1.0-next.2 受影响。

## 0.1.0-next.2

### Minor Changes

- 1e5c81a: 新增 `@marismoon/create-aries`：`npm create @marismoon/aries@next my-app` 创建带三列外壳的独立项目。生成的项目带布局契约：`AGENTS.md` 规则、`pnpm lint` 中的 `scripts/check-layout.mjs`（拦截覆盖外壳类名、重定义布局令牌）和 `e2e/layout.spec.ts`（逐页核对外壳几何），新增内容不得改变布局。
