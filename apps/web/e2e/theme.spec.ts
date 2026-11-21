import { expect, test, type Locator } from "@playwright/test"

const brandCycle = [
  "telemedicine",
  "mental-health",
  "pet-adoption",
  "health-wellness",
  "violet-aurora",
  "amber-sand",
  "rose-quartz",
  "marismoon-light",
  "saas-analytics-spectrum",
] as const

const sunIcon = 'svg:has(circle[cx="12"][cy="12"][r="6"])'
const moonIcon = 'svg:has(path[d^="m21.067 11.857"])'

type IconFrame = { count: number; rotating: boolean; scaling: boolean }

async function recordIconTransition(
  button: Locator,
  activate: () => Promise<void>
) {
  await button.evaluate((control) => {
    control.removeAttribute("data-e2e-icon-frames")
    control.addEventListener(
      "click",
      () => {
        const started = performance.now()
        const frames: IconFrame[] = []
        function sample() {
          const icons = control.querySelectorAll("svg")
          const transforms = [icons[0], icons[0]?.parentElement]
            .filter((element) => element != null)
            .map((element) => {
              const { transform } = getComputedStyle(element)
              return new DOMMatrixReadOnly(
                transform === "none" ? undefined : transform
              )
            })
          frames.push({
            count: icons.length,
            rotating: transforms.some(
              ({ b, c }) => Math.abs(b) > 0.001 || Math.abs(c) > 0.001
            ),
            scaling: transforms.some(
              ({ a, b }) => Math.abs(Math.hypot(a, b) - 1) > 0.001
            ),
          })
          if (performance.now() - started < 400) requestAnimationFrame(sample)
          else
            control.setAttribute("data-e2e-icon-frames", JSON.stringify(frames))
        }
        sample()
      },
      { capture: true, once: true }
    )
  })
  await activate()
  await expect(button).toHaveAttribute("data-e2e-icon-frames", /^\[/)
  return JSON.parse(
    (await button.getAttribute("data-e2e-icon-frames"))!
  ) as IconFrame[]
}

test("主题跟随系统，并保留明暗和配色偏好", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" })
  await page.goto("/")
  await expect(page).toHaveURL(/\/overview$/)
  const root = page.locator("html")
  const chromeColor = page.locator('meta[name="theme-color"]')
  await expect(root).toHaveClass(/\bdark\b/)
  await expect(chromeColor).toHaveAttribute("content", "#2b3446")

  const switchToLight = page.getByRole("button", { name: "切换到浅色模式" })
  const switchToDark = page.getByRole("button", { name: "切换到深色模式" })
  await expect(switchToLight).toHaveAttribute("title", /切换到浅色模式.*Shift/)
  await switchToLight.click()
  await expect(page.getByRole("menu")).toHaveCount(0)
  await expect(switchToDark).toHaveAttribute("title", /切换到深色模式.*Shift/)
  await expect(root).toHaveClass(/\blight\b/)
  await expect(chromeColor).toHaveAttribute("content", "#f2f6fc")
  await page
    .getByRole("navigation", { name: "工作区目录" })
    .getByRole("link", { name: "月账单", exact: true })
    .click()
  await expect(page).toHaveURL(/\/bills$/)
  const palette = page
    .locator(".bills-page")
    .getByRole("button", { name: "品牌配色", exact: true })
  await page.keyboard.press("Tab")
  await palette.focus()
  await expect(palette).toHaveCSS("outline-style", "solid")
  await palette.press("Enter")
  await expect(root).toHaveAttribute("data-palette", "telemedicine")
  await expect(palette).toBeFocused()
  for (const brand of ["mental-health", "pet-adoption"]) {
    await palette.click()
    await expect(root).toHaveAttribute("data-palette", brand)
  }
  await expect(page.getByRole("menu")).toHaveCount(0)
  await expect(root).toHaveClass(/\blight\b/)
  const petLight = await root.evaluate((element) =>
    getComputedStyle(element).getPropertyValue("--background").trim()
  )
  await expect(chromeColor).toHaveAttribute("content", petLight)
  expect(petLight).not.toBe("#f2f6fc")

  await page.reload()
  await expect(root).toHaveClass(/\blight\b/)
  await expect(root).toHaveAttribute("data-palette", "pet-adoption")
  await switchToDark.click()
  await expect(root).toHaveClass(/\bdark\b/)
  await expect(page.getByRole("menu")).toHaveCount(0)
  const storedTheme = () =>
    page.evaluate(() => localStorage.getItem("marismoon-theme"))
  await expect.poll(storedTheme).toBe("dark")

  for (const shortcut of ["Shift+Enter", "Shift+Space"]) {
    await switchToLight.click()
    await expect(root).toHaveClass(/\blight\b/)
    await switchToDark.press(shortcut)
    await expect.poll(storedTheme).toBe("system")
    await expect(root).toHaveClass(/\bdark\b/)
    await expect(switchToLight).toBeFocused()
    await expect(page.getByRole("menu")).toHaveCount(0)
  }
  await switchToLight.click()
  await expect(root).toHaveClass(/\blight\b/)
  await switchToDark.click({ modifiers: ["Shift"] })
  await expect.poll(storedTheme).toBe("system")
  await expect(page.getByRole("menu")).toHaveCount(0)
  await expect(root).toHaveClass(/\bdark\b/)
  await page.emulateMedia({ colorScheme: "light" })
  await expect(root).toHaveClass(/\blight\b/)
  await page.reload()
  await page.emulateMedia({ colorScheme: "dark" })
  await expect(root).toHaveClass(/\bdark\b/)
  await expect(root).toHaveAttribute("data-palette", "pet-adoption")
  await expect(switchToLight).toBeVisible()
})

for (const mode of ["light", "dark"] as const) {
  test(`${mode} 下所有品牌覆盖表面、控件与图表，业务状态色保持独立`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: mode, reducedMotion: "reduce" })
    await page.goto("/bills")
    const root = page.locator("html")
    const palette = page.getByRole("button", { name: "品牌配色", exact: true })
    await expect(root).toHaveClass(new RegExp(`\\b${mode}\\b`))
    const brandTokens = [
      "--background",
      "--workspace-nav",
      "--control",
      "--border",
      "--layout-control-border",
      "--muted",
      "--primary",
      "--primary-hover",
      "--ring",
      "--chart-1",
      "--hero-start",
    ]
    const statusTokens = [
      "--success",
      "--success-bg",
      "--warning",
      "--warning-bg",
      "--danger",
      "--danger-bg",
    ]
    const readTokens = (names: string[]) =>
      root.evaluate((element, tokens) => {
        const styles = getComputedStyle(element)
        return tokens.map((token) => styles.getPropertyValue(token).trim())
      }, names)
    const statusColors = await readTokens(statusTokens)
    const brandStyles: string[][] = []

    for (const value of brandCycle) {
      await palette.click()
      await expect(root).toHaveAttribute("data-palette", value)
      await expect(root).toHaveClass(new RegExp(`\\b${mode}\\b`))
      await expect(page.getByRole("menu")).toHaveCount(0)
      brandStyles.push(await readTokens(brandTokens))
      // The light-only Marismoon palette keeps the light status tones in dark too.
      if (!(mode === "dark" && value === "marismoon-light")) {
        expect(await readTokens(statusTokens)).toEqual(statusColors)
      }
    }

    for (const [index, token] of brandTokens.entries()) {
      const values = brandStyles.map((style) => style[index])
      expect(values, `${token} 有有效定义`).not.toContain("")
      expect(new Set(values).size, `${token} 跟随品牌`).toBe(brandCycle.length)
    }
  })
}

for (const [width, height] of [
  [1440, 900],
  [1536, 960],
]) {
  test(`${width}px 下概览圆形品牌入口按序轮换、持久化且尺寸稳定`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" })
    await page.setViewportSize({ width, height })
    await page.goto("/overview")
    const root = page.locator("html")
    await page.evaluate(() => document.fonts.ready)
    const palette = page.getByRole("button", { name: "品牌配色", exact: true })
    await expect(root).toHaveAttribute(
      "data-palette",
      "saas-analytics-spectrum"
    )
    const original = await palette.boundingBox()
    if (!original) throw new Error("Palette switcher unavailable")
    expect(original.width).toEqual(original.height)

    await page.keyboard.press("Tab")
    await palette.focus()
    await expect(palette).toHaveCSS("outline-style", "solid")
    await palette.press("Enter")
    await expect(root).toHaveAttribute("data-palette", "telemedicine")
    await expect(page.getByRole("menu")).toHaveCount(0)
    await expect(palette).toBeFocused()

    for (const id of brandCycle.slice(1)) {
      await palette.click()
      await expect(root).toHaveAttribute("data-palette", id)
      await expect(page.getByRole("menu")).toHaveCount(0)
      const selected = await palette.boundingBox()
      if (!selected) throw new Error("Palette switcher unavailable")
      for (const axis of ["x", "y", "width", "height"] as const) {
        expect(Math.abs(selected[axis] - original[axis])).toBeLessThanOrEqual(1)
      }

      if (id === "health-wellness") {
        await page.reload()
        await expect(root).toHaveAttribute("data-palette", id)
        await page.mouse.move(0, 0)
        await palette.hover()
        await expect(
          page.locator('[data-slot="tooltip-content"]')
        ).toContainText("当前配色为清新草绿，下一个配色为紫罗兰极光")
      }
    }
  })
}

for (const [width, height] of [
  [1440, 900],
  [1920, 1080],
]) {
  test(`${width}px 下总览与月账单的页首控件尺寸、位置和图标一致`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height })

    for (const colorScheme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme, reducedMotion: "reduce" })
      const themeLabel =
        colorScheme === "light" ? "切换到深色模式" : "切换到浅色模式"

      async function readControls(path: string) {
        await page.goto(path)
        await expect(page.locator("html")).toHaveClass(
          new RegExp(`\\b${colorScheme}\\b`)
        )
        const actions = page.locator(
          ".page-header-title-row .page-header-actions"
        )
        const buttons = actions.getByRole("button")
        // Language, brand and theme; dark mode also carries the dark-style switch (first).
        await expect(buttons).toHaveCount(colorScheme === "dark" ? 4 : 3)
        await expect(actions.getByRole("link")).toHaveCount(0)
        await expect(
          buttons.nth(colorScheme === "dark" ? 2 : 1)
        ).toHaveAccessibleName("品牌配色")
        await expect(buttons.last()).toHaveAccessibleName(themeLabel)
        await expect(
          buttons.last().locator(colorScheme === "light" ? sunIcon : moonIcon)
        ).toBeVisible()
        await page.evaluate(() => document.fonts.ready)

        return buttons.evaluateAll((elements) => {
          function bounds(element: Element) {
            const { x, y, width, height } = element.getBoundingClientRect()
            return [x, y, width, height]
          }

          return elements.map((button) => {
            const icon = button.querySelector("svg")
            if (!icon) throw new Error("Header control icon unavailable")
            const { width, height } = getComputedStyle(icon)
            return {
              control: bounds(button),
              radius: getComputedStyle(button).borderRadius,
              icon: bounds(icon),
              iconSize: [width, height],
              viewBox: icon.getAttribute("viewBox"),
              // React useId() values differ per page; compare the drawing only.
              geometry: icon.innerHTML.replace(/_r_[^_"]+_/g, "_id_"),
            }
          })
        })
      }

      const overview = await readControls("/overview")
      const bills = await readControls("/bills")
      expect(overview[0].control[0] + overview[0].control[2]).toBeLessThan(
        overview[1].control[0]
      )
      for (const [index, reference] of overview.entries()) {
        const actual = bills[index]
        for (const style of [reference, actual]) {
          expect(style.control.slice(2)).toEqual([36, 36])
          expect(style.icon.slice(2)).toEqual([20, 20])
          expect(style.iconSize).toEqual(["20px", "20px"])
        }
        expect(actual.radius).toBe(reference.radius)
        expect(actual.viewBox).toBe(reference.viewBox)
        expect(actual.geometry).toBe(reference.geometry)
        for (const axis of [0, 1, 2, 3]) {
          expect(
            Math.abs(actual.control[axis] - reference.control[axis])
          ).toBeLessThanOrEqual(1)
          expect(
            Math.abs(actual.icon[axis] - reference.icon[axis])
          ).toBeLessThanOrEqual(1)
        }
      }
    }
  })
}

test("主题图标首次静止，鼠标切换逐一旋转缩放", async ({ page }) => {
  await page.emulateMedia({
    colorScheme: "light",
    reducedMotion: "no-preference",
  })
  await page.addInitScript(() => {
    function observeFirstIcon() {
      const button = document.querySelector(
        ".page-header-actions [aria-keyshortcuts]"
      )
      const icon = button?.querySelector("svg")
      if (!button || !icon || !icon.parentElement) {
        requestAnimationFrame(observeFirstIcon)
        return
      }
      const styles = [icon, icon.parentElement].map((node) =>
        getComputedStyle(node)
      )
      button.setAttribute(
        "data-e2e-first-icon-static",
        String(
          styles.every(
            ({ transform, opacity }) => transform === "none" && opacity === "1"
          )
        )
      )
    }
    requestAnimationFrame(observeFirstIcon)
  })
  await page.goto("/overview")
  const toggle = page.locator(".workspace-tools button").last()
  await expect(toggle).toHaveAttribute("data-e2e-first-icon-static", "true")
  await expect(toggle.locator(sunIcon)).toBeVisible()

  for (const [icon, label] of [
    [moonIcon, "切换到浅色模式"],
    [sunIcon, "切换到深色模式"],
  ]) {
    const frames = await recordIconTransition(toggle, () => toggle.click())
    expect(frames.every(({ count }) => count <= 1)).toBe(true)
    expect(frames.some(({ rotating, scaling }) => rotating && scaling)).toBe(
      true
    )
    expect(frames.at(-1)).toEqual({ count: 1, rotating: false, scaling: false })
    await expect(toggle.locator(icon)).toBeVisible()
    await expect(toggle).toHaveAccessibleName(label)
  }
})

test("键盘与减少动态效果偏好即时切换图标", async ({ page }) => {
  await page.emulateMedia({
    colorScheme: "light",
    reducedMotion: "no-preference",
  })
  await page.goto("/bills")
  const toggle = page.locator(".workspace-tools button").last()
  await expect(toggle.locator(sunIcon)).toBeVisible()

  const keyboardFrames = await recordIconTransition(toggle, () =>
    toggle.press("Enter")
  )
  expect(
    keyboardFrames.every(
      ({ count, rotating, scaling }) => count === 1 && !rotating && !scaling
    )
  ).toBe(true)
  await expect(toggle.locator(moonIcon)).toBeVisible()
  await expect(toggle).toBeFocused()

  await page.emulateMedia({ reducedMotion: "reduce" })
  await expect(toggle.locator(`:scope > ${moonIcon}`)).toBeVisible()
  const reducedFrames = await recordIconTransition(toggle, () => toggle.click())
  expect(
    reducedFrames.every(
      ({ count, rotating, scaling }) => count === 1 && !rotating && !scaling
    )
  ).toBe(true)
  await expect(toggle.locator(`:scope > ${sunIcon}`)).toBeVisible()
})

for (const [width, height] of [
  [1920, 1080],
  [1536, 960],
  [1440, 900],
  [1280, 800],
]) {
  test(`${width}px 下工作区与助手对齐，图标列保留额外底部留白`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height })
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.goto("/overview")
    await expect(page.locator(".overview-page")).toBeVisible()
    await page.locator('[data-copilot-trigger="rail"]').click()
    await expect(page.locator(".copilot-panel")).toBeVisible()

    const edges = await page.evaluate(() => {
      function bounds(selector: string) {
        const element = document.querySelector(selector)
        if (!element) throw new Error(`Missing ${selector}`)
        return element.getBoundingClientRect()
      }

      const toggle = document.querySelector(".rail-desktop-toggle")!
      const toggleBounds = toggle.getBoundingClientRect()
      const plate = getComputedStyle(toggle, "::before")
      const plateHeight = parseFloat(plate.height)
      const plateWidth = parseFloat(plate.width)
      const railBottom =
        toggleBounds.bottom - (toggleBounds.height - plateHeight) / 2
      const railLeft = toggleBounds.left + (toggleBounds.width - plateWidth) / 2
      const sidebar = bounds(".workspace-nav--desktop > .workspace-nav")
      const main = bounds(".workspace-main")
      const content = bounds(".overview-page")
      const copilot = bounds(".copilot-panel")

      return {
        bottoms: [sidebar.bottom, main.bottom, copilot.bottom],
        railBottom,
        rightGap: content.right - copilot.right,
        railLeft,
        railToSidebar: sidebar.left - railLeft - plateWidth,
        sidebarToContent: content.left - sidebar.right,
        copilotWidth: copilot.width,
      }
    })

    for (const bottom of edges.bottoms)
      expect(bottom).toBeCloseTo(height - 16, 1)
    expect(edges.railBottom).toBeCloseTo(height - 20, 1)
    expect(edges.rightGap).toBeCloseTo(0, 1)
    expect(edges.railLeft).toBe(16)
    expect(edges.railToSidebar).toBe(10)
    expect(edges.sidebarToContent).toBe(14)
    expect(edges.copilotWidth).toBe(368)
  })
}
