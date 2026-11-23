/** Demo series for the overview chart cards. Amounts are in 万 CNY. */

export const chartMonths = ["5月", "6月", "7月", "8月", "9月", "10月"] as const

export const providerSeries = [
  { id: "aliyun", label: "阿里云", values: [38, 42, 51, 47, 53, 58] },
  { id: "tencent", label: "腾讯云", values: [21, 24, 27, 26, 29, 31] },
  { id: "huawei", label: "华为云", values: [12, 15, 18, 17, 19, 21] },
  { id: "aws", label: "AWS", values: [9.5, 13.2, 15.8, 15.6, 16.52, 18.64] },
] as const

/** Monthly totals Jan-Oct; Oct matches the issued KPI and the YTD total. */
export const yearMonthly = [
  { month: "1月", amount: 104.3 },
  { month: "2月", amount: 96.8 },
  { month: "3月", amount: 118.2 },
  { month: "4月", amount: 139.44 },
  { month: "5月", amount: 80.5 },
  { month: "6月", amount: 94.2 },
  { month: "7月", amount: 111.8 },
  { month: "8月", amount: 105.6 },
  { month: "9月", amount: 117.52 },
  { month: "10月", amount: 128.64 },
] as const

export const billingTypeSeries = [
  { id: "subscription", label: "订阅", values: [30, 34, 40, 38, 41, 44] },
  {
    id: "usage",
    label: "按量",
    values: [32.5, 38.2, 46.8, 43.6, 50.52, 55.64],
  },
  { id: "reserved", label: "预留实例", values: [12, 15, 17, 16, 18, 20] },
  { id: "support", label: "支持服务", values: [6, 7, 8, 8, 8, 9] },
] as const

export const topAccounts = [
  { label: "阿里云 · 生产账号", amount: 41.2 },
  { label: "AWS · 研发共享", amount: 18.6 },
  { label: "腾讯云 · 数据分析", amount: 17.4 },
  { label: "华为云 · 核心网络", amount: 17.15 },
  { label: "阿里云 · 数据中台", amount: 12.8 },
] as const

export const qualityAxes = [
  "采集完成",
  "解析成功",
  "凭证齐全",
  "按时出账",
  "金额一致",
] as const

export const qualitySeries = [
  { id: "current", label: "本月", values: [92.6, 97.6, 88, 94, 96] },
  { id: "previous", label: "上月", values: [89, 95.2, 84, 91, 95] },
] as const

/** Collection tasks per day, rows are weeks (Mon-Sun). */
export const collectionHeat = [
  [12, 18, 22, 20, 16, 4, 2],
  [14, 20, 24, 21, 18, 5, 3],
  [10, 17, 19, 23, 15, 6, 1],
  [16, 21, 25, 22, 19, 7, 4],
  [13, 19, 21, 18, 12, 3, 0],
] as const

/** Bill amount (万) against parse duration (seconds). */
export const parseScatter = [
  { amount: 41.2, seconds: 48, provider: "aliyun" },
  { amount: 12.8, seconds: 22, provider: "aliyun" },
  { amount: 6.4, seconds: 11, provider: "aliyun" },
  { amount: 17.4, seconds: 35, provider: "tencent" },
  { amount: 9.1, seconds: 18, provider: "tencent" },
  { amount: 3.2, seconds: 9, provider: "tencent" },
  { amount: 17.15, seconds: 31, provider: "huawei" },
  { amount: 7.8, seconds: 15, provider: "huawei" },
  { amount: 2.6, seconds: 7, provider: "huawei" },
  { amount: 18.6, seconds: 64, provider: "aws" },
  { amount: 9.4, seconds: 38, provider: "aws" },
  { amount: 4.1, seconds: 21, provider: "aws" },
  { amount: 11.3, seconds: 27, provider: "tencent" },
  { amount: 25.6, seconds: 41, provider: "aliyun" },
] as const

export const annualBudget = { budget: 1300, used: 1097 }
