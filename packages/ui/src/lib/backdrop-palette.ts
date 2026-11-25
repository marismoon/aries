// Convert the active OKLCH theme tokens to sRGB for both GPU uniforms and
// renderers that take hex colours. Canvas resolves the browser's colour space.
export function readBackdropPalette(): string[] {
  const probe = document.createElement("span")
  const sample = document.createElement("canvas")
  sample.width = sample.height = 1
  const context = sample.getContext("2d", { willReadFrequently: true })
  if (!context) return []
  document.body.append(probe)
  try {
    return ["--primary", "--chart-2", "--chart-3"].map((token) => {
      probe.style.color = `var(${token})`
      context.fillStyle = getComputedStyle(probe).color
      context.fillRect(0, 0, 1, 1)
      return (
        "#" +
        Array.from(
          context.getImageData(0, 0, 1, 1).data.slice(0, 3),
          (channel) => channel.toString(16).padStart(2, "0")
        ).join("")
      )
    })
  } finally {
    probe.remove()
  }
}
