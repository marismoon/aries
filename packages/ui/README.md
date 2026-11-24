# @marismoon/ui

Aries 的设计系统：基于 shadcn 的 React 组件、Solar 图标、动效，以及五套品牌主题与 glass/clean 材质令牌。样式基于 Tailwind CSS v4。

## 接入

宿主需要 React 19 与 Tailwind CSS v4。在应用的样式入口按顺序引入：

```css
@import "@marismoon/ui/styles/globals.css";
/* 可选：使用设计字体 Inter 与 Noto Sans SC；不引入时回退到 system-ui */
@import "@marismoon/ui/styles/fonts.css";
@source "./";
```

`globals.css` 已包含 Tailwind 与全部令牌，并通过 `@source` 扫描本包的编译产物，宿主只需再扫描自己的代码。组件通过子路径导入：

```tsx
import { Button } from "@marismoon/ui/ui/button"
import { AppIcon, SolarBell } from "@marismoon/ui/icons"
```

公开路径与组件清单见 [组件文档](https://github.com/marismoon/aries/blob/main/docs/COMPONENTS.md)，主题与令牌规则见 [设计系统](https://github.com/marismoon/aries/blob/main/docs/DESIGN_SYSTEM.md)。

## 许可证

本包代码以 MIT 许可证发布。内嵌的 Solar 图标（480 Design）遵循 CC BY 4.0，shadcn/ui 代码与字体等第三方内容遵循各自的许可证，详见随包分发的 `THIRD_PARTY_NOTICES.md`。
