import { expect, test } from "./fixtures"

const routes = [
  { path: "/overview", title: "运营总览", content: ".overview-kpis" },
  { path: "/bills", title: "月账单", content: ".bills-totals" },
] as const

for (const [width, height] of [
  [1440, 900],
  [1920, 1080],
]) {
  for (const colorScheme of ["light", "dark"] as const) {
    test(`${width}×${height} ${colorScheme} 下两页共用独立滚动区，页头保持固定`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height })
      await page.emulateMedia({ colorScheme, reducedMotion: "reduce" })

      for (const { path, title, content } of routes) {
        await page.goto(path)
        await expect(page.locator("html")).toHaveClass(
          new RegExp(`\\b${colorScheme}\\b`)
        )
        const main = page.getByRole("main")
        const viewport = main.locator(".page-content-viewport")
        // Scroll edges fade the content itself (a mask on the viewport); no
        // strip is laid over it.
        const edgeStyle = () =>
          viewport.evaluate((element) => {
            const style = getComputedStyle(element)
            return {
              start: style.getPropertyValue("--scroll-edge-start").trim(),
              maskImage: style.maskImage,
              overlay: getComputedStyle(element.parentElement!, "::after")
                .content,
            }
          })
        const header = main.locator(".page-header")
        const heading = header.getByRole("heading", { level: 1, name: title })
        const card = viewport.locator(content)
        const directory = page.locator(".workspace-directory")
        await expect(heading).toBeVisible()
        await expect(card).toBeVisible()
        if (path === "/overview") {
          await expect(viewport.locator(".attention-row")).toHaveCount(12)
        } else {
          await expect(viewport.locator("tbody tr")).toHaveCount(10)
        }
        await page.evaluate(() => document.fonts.ready)

        const headerParts = [
          header.getByRole("navigation", { name: "面包屑" }),
          heading,
          ...(path === "/overview"
            ? [header.locator(".page-header-description")]
            : []),
          header.getByRole("button", { name: "品牌配色" }),
          header.getByRole("button", { name: /^切换到[浅深]色模式$/ }),
        ]
        const headerBounds = () =>
          Promise.all(headerParts.map((part) => part.boundingBox()))
        const before = await headerBounds()
        expect(before.every(Boolean)).toBe(true)
        await expect(viewport).toHaveCSS("overflow-y", "auto")
        await expect(viewport).toHaveAttribute("data-scrolled", "false")
        expect(await edgeStyle()).toMatchObject({
          start: "0px",
          maskImage: expect.stringContaining("linear-gradient"),
          overlay: "none",
        })

        if (height === 1080 && path === "/bills") {
          expect(
            await viewport.evaluate((element) => {
              const { scrollHeight, clientHeight } = element
              element.scrollTop = 100
              return [scrollHeight - clientHeight, element.scrollTop]
            })
          ).toEqual([0, 0])
          await page.addStyleTag({
            content: ".page-content { min-block-size: 1200px; }",
          })
        }

        const cardBefore = (await card.boundingBox())!
        const directoryScroll = await directory.evaluate((element) => {
          element.scrollTop = 40
          return element.scrollTop
        })
        await viewport.hover({ position: { x: 150, y: 140 } })
        await page.mouse.wheel(0, 160)
        await expect(viewport).toHaveAttribute("data-scrolled", "true")
        expect(await edgeStyle()).toMatchObject({
          start: "28px",
          maskImage: expect.stringContaining("linear-gradient"),
          overlay: "none",
        })
        const scrollTop = await viewport.evaluate(
          (element) => element.scrollTop
        )
        expect(scrollTop).toBeGreaterThan(0)
        const cardAfter = (await card.boundingBox())!
        expect(cardBefore.y - cardAfter.y).toBeCloseTo(scrollTop, 0)
        expect(await headerBounds()).toEqual(before)
        expect(await directory.evaluate((element) => element.scrollTop)).toBe(
          directoryScroll
        )
        expect(await main.evaluate((element) => element.scrollTop)).toBe(0)
        expect(
          await viewport.evaluate(
            (element) => element.scrollWidth - element.clientWidth
          )
        ).toBe(0)
        expect(
          await page.evaluate(() => [
            window.scrollY,
            document.documentElement.scrollHeight -
              document.documentElement.clientHeight,
          ])
        ).toEqual([0, 0])

        await viewport.evaluate((element) => {
          element.scrollTop = 0
        })
        await expect(viewport).toHaveAttribute("data-scrolled", "false")
        expect((await edgeStyle()).start).toBe("0px")
        expect(await headerBounds()).toEqual(before)
      }
    })
  }
}

test("通过页面配置注册的模拟页继承共享滚动容器", async ({ page }) => {
  await page.route("**/src/app/workspace-pages.ts*", async (route) => {
    const response = await route.fetch()
    const source = await response.text()
    await route.fulfill({
      response,
      body:
        source +
        `
        workspacePages.scrollMock = {
          id: "scroll-mock",
          moduleId: "overview",
          path: "/scroll-test-mock",
          titleKey: "模拟业务页",
          descriptionKey: "滚动契约测试",
          breadcrumbs: [{ label: "演示" }],
          load: async () => ({ Content: () => "模拟业务内容" }),
        };
      `,
    })
  })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/scroll-test-mock")

  const main = page.getByRole("main")
  const heading = main.getByRole("heading", { name: "模拟业务页", level: 1 })
  const viewport = main.locator(".page-content-viewport")
  await expect(heading).toBeVisible()
  await expect(viewport).toHaveText("模拟业务内容")
  expect(
    await viewport.evaluate(
      (element) => element.scrollHeight - element.clientHeight
    )
  ).toBe(0)

  await page.addStyleTag({
    content: ".page-content { min-block-size: 1200px; }",
  })
  const before = await heading.boundingBox()
  await viewport.evaluate((element) => {
    element.scrollTop = 100
  })
  await expect(viewport).toHaveAttribute("data-scrolled", "true")
  expect(await heading.boundingBox()).toEqual(before)
})

test("键盘可滚动业务内容，浏览器后退恢复工作区的滚动位置", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/overview")

  const viewport = page.getByRole("region", { name: "页面内容", exact: true })
  const scrollTop = () => viewport.evaluate((element) => element.scrollTop)
  await expect(viewport.locator(".attention-row")).toHaveCount(12)
  await viewport.focus()
  await expect(viewport).toBeFocused()
  await page.keyboard.press("PageDown")
  await expect(viewport).toHaveAttribute("data-scrolled", "true")
  await page.keyboard.press("End")
  await expect
    .poll(() =>
      viewport.evaluate(
        (element) =>
          element.scrollHeight - element.clientHeight - element.scrollTop
      )
    )
    .toBe(0)
  const saved = await scrollTop()
  expect(saved).toBeGreaterThan(0)

  await page
    .getByRole("navigation", { name: "工作区目录" })
    .getByRole("link", { name: "月账单", exact: true })
    .click()
  await expect(page).toHaveURL(/\/bills$/)
  await expect(viewport).toHaveAttribute("data-scrolled", "false")
  expect(await scrollTop()).toBe(0)

  await page.goBack()
  await expect(page).toHaveURL(/\/overview$/)
  await expect(viewport).toHaveAttribute("data-scrolled", "true")
  expect(await scrollTop()).toBe(saved)
})

test("移动端业务内容滚动时固定页头，文档保持在顶部", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/overview")

  const viewport = page.getByRole("region", { name: "页面内容", exact: true })
  const heading = page.getByRole("heading", { name: "运营总览", level: 1 })
  await expect(viewport.locator(".attention-row")).toHaveCount(12)
  await page.evaluate(() => document.fonts.ready)
  const before = await heading.boundingBox()

  await viewport.evaluate((element) => {
    element.scrollTop = 350
  })
  await expect(viewport).toHaveAttribute("data-scrolled", "true")
  expect(await heading.boundingBox()).toEqual(before)
  expect(
    await page.evaluate(() => [
      window.scrollY,
      document.documentElement.scrollHeight -
        document.documentElement.clientHeight,
    ])
  ).toEqual([0, 0])
})
