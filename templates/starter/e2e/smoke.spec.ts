import { expect, test, type Page } from "@playwright/test"

async function expectEnglishCopy(page: Page) {
  await expect(page.locator("body")).not.toContainText(/[一-鿿]/, {
    useInnerText: true,
  })
  const untranslated = await page
    .locator("[aria-label],[title],[placeholder],[alt]")
    .evaluateAll((elements) =>
      elements.flatMap((element) =>
        ["aria-label", "title", "placeholder", "alt"]
          .map((name) => element.getAttribute(name) ?? "")
          .filter((value) => /[一-鿿]/.test(value))
      )
    )
  expect(untranslated).toEqual([])
}

test.beforeEach(async ({ context }) => {
  await context.route(
    /^https?:\/\/(?!(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:[/?#]|$))/i,
    (route) => route.fulfill({ status: 404, body: "" })
  )
})

test("首页与设置共用外壳，导航和语言切换在刷新后仍可用", async ({ page }) => {
  await page.goto("/")
  const heading = page.getByRole("main").getByRole("heading", { level: 1 })
  const html = page.locator("html")
  await expect(page).toHaveURL(/\/home$/)
  await expect(html).toHaveAttribute("lang", "zh-CN")
  await expect(heading).toHaveText("首页")

  await page
    .getByRole("navigation", { name: "主模块" })
    .getByRole("button", { name: "设置" })
    .click()
  await page
    .getByRole("navigation", { name: "工作区目录" })
    .getByRole("link", { name: "设置" })
    .click()
  await expect(page).toHaveURL(/\/settings$/)
  await expect(heading).toHaveText("设置")

  await page.getByRole("button", { name: "语言", exact: true }).click()
  await expect(html).toHaveAttribute("lang", "en")
  await expect(heading).toHaveText("Settings")
  await expect(
    page.getByRole("button", { name: "Brand palette" })
  ).toBeVisible()
  await page.reload()
  await expect(html).toHaveAttribute("lang", "en")
  await expect(heading).toHaveText("Settings")
  await expectEnglishCopy(page)

  await page
    .getByRole("navigation", { name: "Main modules" })
    .getByRole("button", { name: "Home" })
    .click()
  await page
    .getByRole("navigation", { name: "Workspace directory" })
    .getByRole("link", { name: "Home" })
    .click()
  await expect(page).toHaveURL(/\/home$/)
  await expect(heading).toHaveText("Home")
  await expectEnglishCopy(page)
  await page.getByRole("button", { name: "Language", exact: true }).click()
  await expect(heading).toHaveText("首页")
  await expect(html).toHaveAttribute("lang", "zh-CN")
})

test("Starter 桌面和手机目录只显示可用入口", async ({ page }) => {
  await page.goto("/home")
  const desktop = page.locator(".workspace-nav--desktop")
  await expect(desktop.getByRole("link", { name: "首页" })).toBeVisible()
  await expect(desktop.getByRole("button", { name: "新建" })).toHaveCount(0)
  await expect(desktop.getByRole("tab", { name: "我的待办" })).toHaveCount(0)
  await expect(desktop.getByRole("button", { name: "配置手册" })).toHaveCount(0)
  await expect(desktop.getByRole("button", { name: "技术支持" })).toHaveCount(0)
  await desktop.getByRole("button", { name: "导航搜索" }).click()
  await expect(
    page.getByRole("dialog", { name: "搜索页面" }).getByRole("option")
  ).toHaveText(["首页"])
  await page.keyboard.press("Escape")

  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole("button", { name: "打开工作区导航" }).click()
  const mobile = page.getByRole("dialog", { name: "工作区导航" })
  await expect(mobile.getByRole("link", { name: "首页" })).toBeVisible()
  await expect(mobile.getByRole("tab")).toHaveCount(0)
  await expect(mobile.getByRole("button", { name: "技术支持" })).toHaveCount(0)
})
