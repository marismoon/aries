import type { Locator } from "@playwright/test"

import { expect, test } from "./fixtures"

// Cycle order starting from the default palette (ariesanalytics).
const defaultPalette = "ariesanalytics"
const brandCycle = [
  "mental-health",
  "northern-lights",
  "pet-adoption",
  "mono",
  "ariesanalytics",
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

type IconRole = "outgoing" | "incoming" | "other"

type IconSwitch = {
  /** 每次 DOM 变化后按钮内图标数量的最大值。 */
  maxIcons: number
  /** 新图标插入时的行内 transform，即 motion 的进入起点。 */
  incomingFrom: string | null
  /** 切换期间 motion 写入的行内 transform（退出终点、进入终点）。 */
  writes: { icon: IconRole; transform: string }[]
  /** 落在图标上的每条 WAAPI 关键帧效果在起点、中点、终点的状态。 */
  effects: {
    icon: IconRole
    start: IconFrame
    middle: IconFrame
    end: IconFrame
  }[]
  /** 动画全部结束后的计算样式。 */
  final: IconFrame
}

type IconSwitchWindow = Window & {
  __e2eIconEffects?: KeyframeEffect[]
  __e2eIconSwitch?: {
    outgoing: Element | null
    incoming: Element | null
    incomingFrom: string | null
    from: number
    maxIcons: number
    writes: { element: Element; transform: string }[]
    observer: MutationObserver
  }
}

/**
 * 在页面脚本执行前登记所有 Web Animations 关键帧效果。motion 把独立的
 * rotate/scale 合并成一条 WAAPI transform 动画（`new KeyframeEffect`），
 * 登记在创建时同步完成，与 runner 速度和帧率无关。
 */
function trackKeyframeEffects() {
  const win = window as IconSwitchWindow
  const effects: KeyframeEffect[] = []
  win.__e2eIconEffects = effects
  const NativeEffect = window.KeyframeEffect
  window.KeyframeEffect = class extends NativeEffect {
    // KeyframeEffect 有两个构造重载，参数原样转交。
    constructor(...args: unknown[]) {
      super(...(args as ConstructorParameters<typeof NativeEffect>))
      effects.push(this)
    }
  }
  const nativeAnimate = Element.prototype.animate
  Element.prototype.animate = function (keyframes, options) {
    const animation = nativeAnimate.call(this, keyframes, options)
    if (animation.effect instanceof NativeEffect) effects.push(animation.effect)
    return animation
  }
}

/** 解析 motion 写入的 `scale(…) rotate(…)`，scale(0) 时矩阵无法体现旋转。 */
function parseIconTransform(transform: string) {
  const rotate = /rotate\((-?[\d.]+)deg\)/.exec(transform)?.[1]
  const scale = /scale\((-?[\d.]+)\)/.exec(transform)?.[1]
  return {
    rotating: rotate != null && Number(rotate) !== 0,
    scaling: scale != null && Number(scale) !== 1,
  }
}

/**
 * 激活开关并记录一次图标切换。全部信号都是同步登记的，不依赖采样恰好落在
 * 动画中段：
 * - MutationObserver 记录每次 DOM 变化后的图标数量与 motion 的行内 transform；
 * - motion 按时间推进，慢 runner 上首帧迟于退出时长（85ms）时会直接写入
 *   退出终点而不创建 WAAPI 动画，所以两端状态以行内写入为准；
 * - 实际创建的每条关键帧效果用暂停的副本按进度取值，检查中点同时旋转和缩放。
 */
async function recordIconSwitch(
  button: Locator,
  activate: () => Promise<void>
): Promise<IconSwitch> {
  await button.evaluate((control) => {
    const win = window as IconSwitchWindow
    const iconHost = (node: Node) =>
      node instanceof HTMLElement && node.querySelector(":scope > svg")
        ? node
        : null
    const observer = new MutationObserver((records) => {
      const state = win.__e2eIconSwitch!
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          const host = iconHost(node)
          if (!host) return
          state.incoming = host
          state.incomingFrom = host.style.transform || null
        })
        const host = iconHost(record.target)
        if (record.type === "attributes" && host) {
          state.writes.push({ element: host, transform: host.style.transform })
        }
      }
      state.maxIcons = Math.max(
        state.maxIcons,
        control.querySelectorAll("svg").length
      )
    })
    observer.observe(control, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style"],
    })
    win.__e2eIconSwitch = {
      outgoing: control.querySelector("svg")?.parentElement ?? null,
      incoming: null,
      incomingFrom: null,
      from: win.__e2eIconEffects!.length,
      maxIcons: control.querySelectorAll("svg").length,
      writes: [],
      observer,
    }
  })
  await activate()
  // 结束信号：新图标已插入、motion 已写入它的进入终点，且没有图标动画在运行。
  await expect
    .poll(
      () =>
        button.evaluate((control) => {
          const win = window as IconSwitchWindow
          const state = win.__e2eIconSwitch!
          const effects = win.__e2eIconEffects!.slice(state.from)
          const running = control
            .getAnimations({ subtree: true })
            .some(
              ({ effect }) =>
                effect instanceof KeyframeEffect && effects.includes(effect)
            )
          return (
            state.incoming != null &&
            state.incoming.isConnected &&
            state.writes.some(({ element }) => element === state.incoming) &&
            !running
          )
        }),
      { message: "新图标应插入并完成进入动画，且图标动画全部结束" }
    )
    .toBe(true)
  return button.evaluate((control) => {
    const win = window as IconSwitchWindow
    const state = win.__e2eIconSwitch!
    state.observer.disconnect()
    const roleOf = (element: Element | null): IconRole =>
      element === state.outgoing
        ? "outgoing"
        : element === state.incoming
          ? "incoming"
          : "other"
    const frameOf = (element: Element): IconFrame => {
      const { transform } = getComputedStyle(element)
      const { a, b, c } = new DOMMatrixReadOnly(
        transform === "none" ? undefined : transform
      )
      return {
        count: 1,
        rotating: Math.abs(b) > 0.001 || Math.abs(c) > 0.001,
        scaling: Math.abs(Math.hypot(a, b) - 1) > 0.001,
      }
    }
    const probe = document.createElement("span")
    probe.style.cssText = "position:fixed;display:block;width:20px;height:20px"
    document.body.append(probe)
    const effects = win
      .__e2eIconEffects!.slice(state.from)
      .flatMap((effect): IconSwitch["effects"] => {
        const host =
          effect.target instanceof SVGElement
            ? effect.target.parentElement
            : effect.target
        if (host !== state.outgoing && host !== state.incoming) return []
        const keyframes = effect.getKeyframes().map((keyframe) => {
          const copy: Record<string, unknown> = { ...keyframe }
          delete copy.computedOffset
          return copy as Keyframe
        })
        if (!keyframes.some((keyframe) => "transform" in keyframe)) return []
        const { delay, activeDuration } = effect.getComputedTiming()
        const replay = probe.animate(keyframes, {
          ...effect.getTiming(),
          fill: "both",
        })
        replay.pause()
        const at = (progress: number) => {
          replay.currentTime = Number(delay) + Number(activeDuration) * progress
          return frameOf(probe)
        }
        const sampled = {
          icon: roleOf(host),
          start: at(0),
          middle: at(0.5),
          end: at(1),
        }
        replay.cancel()
        return [sampled]
      })
    probe.remove()
    const icons = control.querySelectorAll("svg")
    const final = [icons[0], icons[0]?.parentElement]
      .filter((element) => element != null)
      .map(frameOf)
    return {
      maxIcons: state.maxIcons,
      incomingFrom: state.incomingFrom,
      writes: state.writes.map(({ element, transform }) => ({
        icon: roleOf(element),
        transform,
      })),
      effects,
      final: {
        count: icons.length,
        rotating: final.some(({ rotating }) => rotating),
        scaling: final.some(({ scaling }) => scaling),
      },
    }
  })
}

test("主题跟随系统，并保留明暗和配色偏好", async ({ page }) => {
  // Exercise preference persistence without rendering the transition frames.
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" })
  await page.goto("/")
  await expect(page).toHaveURL(/\/overview$/)
  const root = page.locator("html")
  const chromeColor = page.locator('meta[name="theme-color"]')
  await expect(root).toHaveClass(/\bdark\b/)
  // Default palette (ariesanalytics) dark canvas: --dark-hue 220.
  await expect(chromeColor).toHaveAttribute("content", "hsl(220 6% 12%)")

  const switchToLight = page.getByRole("button", { name: "切换到浅色模式" })
  const switchToDark = page.getByRole("button", { name: "切换到深色模式" })
  await expect(switchToLight).toHaveAttribute("title", /切换到浅色模式.*Shift/)
  await switchToLight.click()
  await expect(page.getByRole("menu")).toHaveCount(0)
  await expect(switchToDark).toHaveAttribute("title", /切换到深色模式.*Shift/)
  await expect(root).toHaveClass(/\blight\b/)
  // Default palette (ariesanalytics) light canvas.
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
  await expect(root).toHaveAttribute("data-palette", "mental-health")
  await expect(palette).toBeFocused()
  for (const brand of ["northern-lights", "pet-adoption"]) {
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

  await page.reload({ waitUntil: "domcontentloaded" })
  await expect(root).toHaveClass(/\blight\b/)
  await expect(root).toHaveAttribute("data-palette", "pet-adoption")
  await switchToDark.click()
  await expect(root).toHaveClass(/\bdark\b/)
  await expect(page.getByRole("menu")).toHaveCount(0)
  const storedTheme = () =>
    page.evaluate(() => localStorage.getItem("aries-theme"))
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
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" })
  await expect(root).toHaveClass(/\blight\b/)
  await page.reload({ waitUntil: "domcontentloaded" })
  await expect(switchToDark).toBeVisible()
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" })
  await expect(root).toHaveClass(/\bdark\b/)
  await expect(root).toHaveAttribute("data-palette", "pet-adoption")
  await expect(switchToLight).toBeVisible()
})

for (const mode of ["light", "dark"] as const) {
  test(`${mode} 下所有品牌覆盖表面、控件与图表，状态色与品牌色保持色相间隔`, async ({
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
    const sharedDarkTokens = new Set(["--border", "--layout-control-border"])
    const statusTokens = [
      "--success",
      "--success-bg",
      "--warning",
      "--warning-bg",
      "--danger",
      "--danger-bg",
      "--info",
      "--info-bg",
    ]
    // OKLCH hue of each resolved token (DESIGN_SYSTEM §2.5): the primary keeps
    // >=30° from danger and warning and >=25° from success and info; chart
    // series keep >=25° from danger and warning.
    const readHues = (names: string[]) =>
      root.evaluate((element, tokens) => {
        const canvas = document.createElement("canvas")
        canvas.width = canvas.height = 1
        const context = canvas.getContext("2d", { willReadFrequently: true })!
        const probe = document.createElement("span")
        // Global colour transitions would report the previous token's value.
        probe.style.transition = "none"
        element.querySelector("body")?.append(probe)
        const linear = (v: number) => {
          v /= 255
          return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
        }
        const hues = tokens.map((token) => {
          probe.style.color = `var(${token})`
          context.clearRect(0, 0, 1, 1)
          context.fillStyle = getComputedStyle(probe).color
          context.fillRect(0, 0, 1, 1)
          const [r, g, b] = Array.from(context.getImageData(0, 0, 1, 1).data)
            .slice(0, 3)
            .map(linear) as [number, number, number]
          const l = Math.cbrt(
            0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
          )
          const m = Math.cbrt(
            0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
          )
          const s = Math.cbrt(
            0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
          )
          const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
          const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
          // A grey has no hue: report none, and the gap checks skip it.
          if (Math.hypot(a, bb) < 0.02) return null
          return ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360
        })
        probe.remove()
        return hues
      }, names)
    const hueGap = (a: number | null, b: number | null) => {
      if (a === null || b === null) return 180
      const d = Math.abs(a - b) % 360
      return Math.min(d, 360 - d)
    }
    const readTokens = (names: string[]) =>
      root.evaluate((element, tokens) => {
        const styles = getComputedStyle(element)
        return tokens.map((token) => styles.getPropertyValue(token).trim())
      }, names)
    const brandStyles: string[][] = []

    const cycle = brandCycle

    for (const value of cycle) {
      await palette.click()
      await expect(root).toHaveAttribute("data-palette", value)
      await expect(root).toHaveClass(new RegExp(`\\b${mode}\\b`))
      await expect(page.getByRole("menu")).toHaveCount(0)
      brandStyles.push(await readTokens(brandTokens))
      expect(
        await readTokens(statusTokens),
        `${value} 状态色有定义`
      ).not.toContain("")
      const [primary, success, warning, danger, info, ...charts] =
        (await readHues([
          "--primary",
          "--success",
          "--warning",
          "--danger",
          "--info",
          "--chart-1",
          "--chart-2",
          "--chart-3",
          "--chart-4",
          "--chart-5",
        ])) as [
          number | null,
          number | null,
          number | null,
          number | null,
          number | null,
          ...(number | null)[],
        ]
      for (const [name, hue, min] of [
        ["danger", danger, 30],
        ["warning", warning, 30],
        ["success", success, 25],
        ["info", info, 25],
      ] as const) {
        expect(
          hueGap(primary, hue),
          `${value} 主色与 ${name}`
        ).toBeGreaterThanOrEqual(min)
      }
      for (const [index, hue] of charts.entries()) {
        for (const alarm of [danger, warning]) {
          expect(
            hueGap(hue, alarm),
            `${value} chart-${index + 1} 与告警色`
          ).toBeGreaterThanOrEqual(25)
        }
      }
    }

    for (const [index, token] of brandTokens.entries()) {
      const values = brandStyles.map((style) => style[index])
      expect(values, `${token} 有有效定义`).not.toContain("")
      // Dark hairlines are one shared white-alpha ladder (dark-base.css), not per brand.
      if (mode === "dark" && sharedDarkTokens.has(token)) continue
      expect(new Set(values).size, `${token} 跟随品牌`).toBe(cycle.length)
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
    await expect(root).toHaveAttribute("data-palette", defaultPalette)
    const original = await palette.boundingBox()
    if (!original) throw new Error("Palette switcher unavailable")
    expect(original.width).toEqual(original.height)

    await page.keyboard.press("Tab")
    await palette.focus()
    await expect(palette).toHaveCSS("outline-style", "solid")
    await palette.press("Enter")
    await expect(root).toHaveAttribute("data-palette", brandCycle[0])
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

      if (id === "northern-lights") {
        await page.reload()
        await expect(root).toHaveAttribute("data-palette", id)
        await page.mouse.move(0, 0)
        await palette.hover()
        await expect(
          page.locator('[data-slot="tooltip-content"]')
        ).toContainText("当前配色为北极光，下一个配色为暖陶土")
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
        // Language, brand and theme; dark glass also carries the Demo's glass
        // backdrop switch (header extra, first) and the dark-style switch.
        await expect(buttons).toHaveCount(colorScheme === "dark" ? 5 : 3)
        await expect(actions.getByRole("link")).toHaveCount(0)
        if (colorScheme === "dark") {
          await expect(buttons.first()).toHaveAccessibleName("玻璃背景")
        }
        await expect(
          buttons.nth(colorScheme === "dark" ? 3 : 1)
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
  await page.addInitScript(trackKeyframeEffects)
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
    const switched = await recordIconSwitch(toggle, () => toggle.click())
    const still = { count: 1, rotating: false, scaling: false }
    const moving = { rotating: true, scaling: true }
    // 逐一出现：任何一次 DOM 变化后按钮内都最多只有一个图标。
    expect(switched.maxIcons).toBe(1)
    // 旧图标退到「旋转且缩小」的终点后移除，新图标从同样的状态进入并回到原位。
    expect(switched.writes.map(({ icon }) => icon)).toEqual([
      "outgoing",
      "incoming",
    ])
    expect(parseIconTransform(switched.writes[0]!.transform)).toEqual(moving)
    expect(parseIconTransform(switched.incomingFrom ?? "")).toEqual(moving)
    expect(switched.writes[1]!.transform).toBe("none")
    // 进入动画实际运行，且 motion 创建的每条动画在中点都同时旋转和缩放。
    expect(switched.effects.some(({ icon }) => icon === "incoming")).toBe(true)
    for (const { middle } of switched.effects) {
      expect(middle).toEqual({ count: 1, ...moving })
    }
    // 结束后静止。
    expect(switched.final).toEqual(still)
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
    // The rail plate sits centered between the viewport edge and the sidebar.
    expect(edges.railLeft).toBe(13)
    expect(edges.railToSidebar).toBe(13)
    expect(edges.sidebarToContent).toBe(14)
    expect(edges.copilotWidth).toBe(368)
  })
}
