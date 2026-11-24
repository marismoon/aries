# ADR 0001　取消 packages/core

**背景**　原 core 同时存放通用格式化函数与示例账单、概览数据。复制框架时会连带引入 Demo 的数据模型。

**决定**　金额、时间格式化函数由 `@marismoon/ui/lib/format` 导出。Mock、业务类型及测试随使用方归入 Demo，多个功能共用的数据归入 `apps/demo/src/shared/`。

**理由**　格式化是各应用可复用的展示能力。示例数据的生命周期与 Demo 一致。

**后果**　Demo 在宿主侧组装命令搜索数据，运行时校验依赖随数据留在 Demo。新应用按业务定义自己的数据模型。[架构](../ARCHITECTURE.md)
