import { useEffect, useRef } from "react"
import { readBackdropPalette } from "../lib/backdrop-palette"

export interface BackdropShader {
  fragment: string
  maxPixelRatio?: number
  linearPalette?: boolean
  vertex?: string
  particles?: number
  createField?: (gl: WebGL2RenderingContext) => {
    update: (
      dt: number,
      time: number,
      x: number,
      y: number,
      still: boolean
    ) => void
    dispose: () => void
  }
}

const uniforms = `
precision highp float;
uniform vec2 viewport;
uniform float clock;
uniform vec2 fieldCenter;
uniform vec3 palette[3];
`
const fullscreen = `
void main() {
  vec2 corner = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(corner * 2.0 - 1.0, 0, 1);
}`

function link(gl: WebGL2RenderingContext, scene: BackdropShader) {
  const program = gl.createProgram()
  if (!program) return null
  for (const [type, source] of [
    [gl.VERTEX_SHADER, scene.vertex ?? fullscreen],
    [gl.FRAGMENT_SHADER, scene.fragment],
  ] as const) {
    const shader = gl.createShader(type)
    if (!shader) {
      gl.deleteProgram(program)
      return null
    }
    gl.shaderSource(shader, "#version 300 es\n" + uniforms + source)
    gl.compileShader(shader)
    gl.attachShader(program, shader)
    gl.deleteShader(shader)
  }
  gl.linkProgram(program)
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program
  console.error(gl.getProgramInfoLog(program))
  gl.deleteProgram(program)
  return null
}

export function useBackdropCanvas(scene: BackdropShader) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const root = document.documentElement
    const motion = matchMedia("(prefers-reduced-motion: reduce)")
    let gl: WebGL2RenderingContext | null = null
    let program: WebGLProgram | null = null
    let locations: Record<string, WebGLUniformLocation | null> = {}
    let field:
      ReturnType<NonNullable<BackdropShader["createField"]>> | undefined
    let frame = 0
    let previous = 0
    let time = 0
    let x = 0.5,
      y = 0.5
    function stop() {
      cancelAnimationFrame(frame)
      frame = 0
      previous = 0
    }
    function draw(now: number) {
      if (!gl || !program) return
      const dt = previous ? Math.min(0.1, (now - previous) / 1000) : 0
      previous = now
      time += dt
      if (field) {
        const ease = 1 - Math.exp(-dt * 8)
        x += (0.5 + 0.25 * Math.sin(time * 0.5) - x) * ease
        y += (0.5 - 0.25 * Math.cos(time) - y) * ease
        field.update(dt, motion.matches ? 2.8 : time, x, y, motion.matches)
        gl.uniform2f(locations.fieldCenter ?? null, x, y)
      }
      gl.uniform2f(locations.viewport ?? null, canvas!.width, canvas!.height)
      gl.uniform1f(locations.clock ?? null, motion.matches ? 2.8 : time)
      gl.clear(gl.COLOR_BUFFER_BIT)
      if (scene.particles)
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, scene.particles)
      else gl.drawArrays(gl.TRIANGLES, 0, 3)
      if (!motion.matches) frame = requestAnimationFrame(draw)
    }
    function refresh() {
      stop()
      if (
        !canvas ||
        document.hidden ||
        !root.classList.contains("dark") ||
        root.dataset.darkStyle === "clean"
      )
        return
      gl ??= canvas.getContext("webgl2", {
        alpha: true,
        antialias: false,
        depth: false,
      })
      if (!gl || gl.isContextLost()) return
      if (!program) {
        program = link(gl, scene)
        if (!program) return
        gl.useProgram(program)
        locations = Object.fromEntries(
          ["viewport", "clock", "fieldCenter", "palette[0]", "pixelRatio"].map(
            (name) => [name, gl!.getUniformLocation(program!, name)]
          )
        )
        if (scene.particles) {
          gl.enable(gl.BLEND)
          gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
        }
      }
      const box = canvas.getBoundingClientRect()
      const ratio = Math.min(devicePixelRatio, scene.maxPixelRatio ?? 1.5)
      const w = Math.max(1, Math.round(box.width * ratio))
      const h = Math.max(1, Math.round(box.height * ratio))
      if (w !== canvas.width || h !== canvas.height) {
        canvas.width = w
        canvas.height = h
      }
      gl.viewport(0, 0, w, h)
      gl.uniform1f(locations.pixelRatio ?? null, ratio)
      field ??= scene.createField?.(gl)
      const rgb = readBackdropPalette().flatMap((hex) =>
        [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      )
      const palette = scene.linearPalette
        ? rgb.map((channel) =>
            channel <= 0.04045
              ? channel / 12.92
              : ((channel + 0.055) / 1.055) ** 2.4
          )
        : rgb
      gl.uniform3fv(locations["palette[0]"] ?? null, palette)
      draw(performance.now())
    }
    function lost(event: Event) {
      event.preventDefault()
      stop()
      program = null
      field = undefined
    }
    canvas.addEventListener("webglcontextlost", lost)
    canvas.addEventListener("webglcontextrestored", refresh)
    const size = new ResizeObserver(refresh)
    size.observe(canvas)
    const appearance = new MutationObserver(refresh)
    appearance.observe(root, {
      attributes: true,
      attributeFilter: ["class", "data-dark-style", "data-palette"],
    })
    const events = new AbortController()
    const options = { passive: true, signal: events.signal }
    motion.addEventListener("change", refresh, options)
    document.addEventListener("visibilitychange", refresh, options)
    refresh()
    return () => {
      stop()
      events.abort()
      size.disconnect()
      appearance.disconnect()
      canvas.removeEventListener("webglcontextlost", lost)
      canvas.removeEventListener("webglcontextrestored", refresh)
      field?.dispose()
      if (program) gl?.deleteProgram(program)
      const retired = gl
      queueMicrotask(() => {
        if (!canvas.isConnected)
          retired?.getExtension("WEBGL_lose_context")?.loseContext()
      })
    }
  }, [scene])
  return ref
}
