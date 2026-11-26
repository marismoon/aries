# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

开发者用 Aries 搭建工作区类应用；最终用户是这些应用的日常操作者：日常办公后台、SaaS 平台、运营平台的使用者。暗色模式在三种场景都会用到：白天办公室里长时间处理数据与单据、弱光或大屏上值守指标与告警、对外演示。

## Product Purpose

Aries 是一套 React 工作区框架：设计系统（`@marismoon/ui`）、三列外壳（`@marismoon/shell`）、完整 Demo 与起步模板。让团队用一条命令得到与 Demo 同样外壳的应用，在其中只填业务内容。

## Positioning

外壳布局由框架持有并受布局契约保护；主题以「品牌主题 × 明暗 × 暗色材质」三个维度切换，全部由令牌驱动。

## Operating Context

典型页面是运营总览（指标卡、图表、待办列表）、数据表格与筛选、抽屉详情、设置表单、命令面板与 AI 助手面板。Demo 以云账单运营为示例数据。

## Capabilities and Constraints

- 五套品牌主题：Aries Analytics（默认，严禁删除或调整）、静心雾蓝、北极光、暖陶土、极简灰。
- 暗色有两种材质：glass 与 clean，二者都保留，并应有明确不同的性格。
- 高亮（亮色）模式的配色已冻结，不得修改。
- 暗色重新设计时不得改动：布局与组件结构、状态色含义（成功、警告、危险、信息）、字体与字号。
- 暗色下各主题的主色色相可以调整。
- 对比度与色相底线见 `docs/DESIGN_SYSTEM.md` §2.5；动效遵循无弹簧回弹与减少动态效果偏好。

## Brand Commitments

产品名 Aries；图标只用 Solar（Linear / Bold）。

## Evidence on Hand

Demo 使用本地模拟数据（云账单、采集进度、告警），不是真实客户数据。没有客户评价、定价或基准数据，后续工作不得编造。

## Product Principles

1. 所有应用都受益的改动放在 ui 或 shell，用 Demo 验证。
2. 布局不变：应用只填内容区。
3. 颜色只走令牌；深色适配只改暗色作用域。
4. 可测量的底线（对比度、色相间隔、图表区分）优先于观感判断。

## Accessibility & Inclusion

WCAG 2.1 AA：正文 ≥ 4.5:1，图表与控件边缘 ≥ 3:1；触控目标 ≥ 40px；支持 `prefers-reduced-motion`。
