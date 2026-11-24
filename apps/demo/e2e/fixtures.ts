import { test as base } from "@playwright/test"

export { expect } from "@playwright/test"

export const sidebarAvatarUrl = "https://github.com/pranathip.png"
export const externalPlaceholderHeader = "x-playwright-external-placeholder"

export const test = base.extend<{ isolateNetwork: void }>({
  isolateNetwork: [
    async ({ context }, use) => {
      await context.route(
        /^https?:\/\/(?!(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:[/?#]|$))/i,
        (route) =>
          route.fulfill({
            status: 404,
            headers: { [externalPlaceholderHeader]: "1" },
            body: "",
          })
      )
      await use()
    },
    { auto: true },
  ],
})
