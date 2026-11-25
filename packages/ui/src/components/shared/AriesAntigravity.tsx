import {
  useBackdropCanvas,
  type BackdropShader,
} from "../../hooks/use-backdrop-canvas"

const count = 1500

// Keep position and velocity between frames so sudden changes of direction
// propagate through the field. Positions use viewport height as the unit.
function createField(gl: WebGL2RenderingContext) {
  const buffer = gl.createBuffer()
  const state = new Float32Array(count * 4)
  const appearanceBuffer = gl.createBuffer()
  const appearance = new Float32Array(count * 3)
  const columns = Math.max(
    1,
    Math.round(
      Math.sqrt((count * gl.drawingBufferWidth) / gl.drawingBufferHeight)
    )
  )
  const rows = Math.ceil(count / columns)

  function noise(n: number) {
    const value = Math.sin(n * 127.13) * 37293.7
    return value - Math.floor(value)
  }

  const particles = Array.from({ length: count }, (_, i) => {
    const key = i * 8
    const depth = 2 * noise(key + 2) - 1
    const phase = 2 * Math.PI * noise(key + 3)
    appearance.set([depth, phase, noise(key + 4)], i * 3)
    return {
      homeX: (((i % columns) + noise(key)) / columns) * 1.12 - 0.06,
      homeY: ((Math.floor(i / columns) + noise(key + 1)) / rows) * 1.12 - 0.06,
      depth,
      phase,
      band: (noise(key + 5) - 0.5) * 0.99,
      delay: noise(key + 6),
      frequency: 6.2 * (0.75 + 0.5 * noise(key + 7)),
    }
  })
  gl.bindBuffer(gl.ARRAY_BUFFER, appearanceBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, appearance, gl.STATIC_DRAW)
  gl.enableVertexAttribArray(1)
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0)
  gl.vertexAttribDivisor(1, 1)
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, state.byteLength, gl.DYNAMIC_DRAW)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0)
  gl.vertexAttribDivisor(0, 1)

  let previousAspect = 0
  let previousHeight = 0
  return {
    update(dt: number, time: number, x: number, y: number, still: boolean) {
      const height = gl.drawingBufferHeight
      const aspect = gl.drawingBufferWidth / height
      const resized = aspect !== previousAspect || height !== previousHeight
      for (let i = 0; i < count; i++) {
        const particle = particles[i]!
        const k = i * 4
        if (!previousHeight) {
          state[k] = particle.homeX * aspect
          state[k + 1] =
            particle.homeY - (still ? 0 : 0.45 + 0.4 * particle.delay)
        } else if (resized) {
          // Keep screen-relative position and drawing-pixel velocity through a resize.
          state[k] = (state[k]! * aspect) / previousAspect
          state[k + 2] = (state[k + 2]! * previousHeight) / height
          state[k + 3] = (state[k + 3]! * previousHeight) / height
        }
        const parallax = 1 - 0.12 * particle.depth
        const centerX = (0.5 + (x - 0.5) * parallax) * aspect
        const centerY = 0.5 + (y - 0.5) * parallax
        const dx = particle.homeX * aspect - centerX
        const dy =
          particle.homeY +
          (Math.sin(time * 0.7 + particle.phase) * 0.12) / 31.5 -
          centerY
        const distance = Math.max(0.00001, Math.hypot(dx, dy))
        const capture = Math.min(
          1,
          Math.max(0, (10.62 - distance * 31.5) / 3.24)
        )
        const weight = capture * capture * (3 - 2 * capture)
        const wave =
          0.3 * Math.sin(3 * Math.atan2(-dy, dx) - time * 0.8) +
          0.2 * Math.sin(particle.phase + time * 0.52)
        const radius = (7 + wave + particle.band) / 31.5
        const scale = 1 + weight * (radius / distance - 1)
        const tx = centerX + dx * scale
        const ty = centerY + dy * scale
        if (still) {
          state[k] = tx
          state[k + 1] = ty
          state[k + 2] = state[k + 3] = 0
          continue
        }
        if (time < particle.delay * 0.9) continue
        const { frequency } = particle
        // Analytic critically damped step, stable across refresh rates.
        const decay = Math.exp(-frequency * dt)
        for (let axis = 0; axis < 2; axis++) {
          const target = axis === 0 ? tx : ty
          const error = state[k + axis]! - target
          const velocity = state[k + axis + 2]!
          const slope = velocity + frequency * error
          state[k + axis] = target + (error + slope * dt) * decay
          state[k + axis + 2] = (velocity - frequency * slope * dt) * decay
        }
      }
      previousAspect = aspect
      previousHeight = height
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, state)
    },
    dispose() {
      gl.deleteBuffer(appearanceBuffer)
      gl.deleteBuffer(buffer)
    },
  }
}

const scene: BackdropShader = {
  particles: count,
  createField,
  vertex: `
layout(location=0) in vec4 particle;
layout(location=1) in vec3 appearance; // depth, phase, size variation
out vec2 local;
out vec3 tint;
flat out vec2 capsule;
out float opacity;
void main() {
  float unit = viewport.y/31.5;
  vec2 pos = particle.xy*viewport.y;
  vec2 delta = pos-fieldCenter*viewport;
  vec2 radial = normalize(delta+vec2(0.0001));
  vec2 velocity = particle.zw*viewport.y;
  float speed = length(velocity);
  float streak = clamp(speed/(30.0*unit),0.0,2.5);
  vec2 heading = speed>0.01 ? velocity/speed : radial;
  if(dot(heading,radial)<0.0) heading = -heading;
  vec2 axis = normalize(mix(radial,heading,smoothstep(0.0,1.0,streak)));
  float ringDistance = length(delta)/unit - 7.0;
  float band = exp(-ringDistance*ringDistance/36.0);
  float depth = appearance.x;
  float size = 0.54*unit*(1.0+0.32*depth)*(0.85+0.3*appearance.z);
  size *= (1.0+0.22*sin(clock*3.0+appearance.y));
  float radius = size*0.17*mix(0.55,1.0,band);
  float halfLength = max(radius,0.5*size*mix(0.25,1.0,band))*(1.0+1.2*streak);
  capsule = vec2(halfLength-radius,radius);
  vec2 corner = vec2(gl_VertexID & 1,gl_VertexID >> 1)*2.0-1.0;
  local = corner*(vec2(capsule.x+capsule.y,capsule.y)+1.0);
  vec2 screen = pos+axis*local.x+vec2(-axis.y,axis.x)*local.y;
  gl_Position = vec4(screen/viewport*2.0-1.0,0,1);
  float hue = fract(atan(-radial.y,radial.x)/6.2831853+clock*0.05+1.0)*3.0;
  int start = int(hue);
  tint = mix(palette[start],palette[(start+1)%3],smoothstep(0.0,1.0,fract(hue)));
  opacity = mix(0.25,1.0,band)*(1.0-0.35*max(-depth,0.0))*min(1.0,clock/0.6);
}`,
  fragment: `
out vec4 pixel;

in vec2 local;
in vec3 tint;
flat in vec2 capsule;
in float opacity;
void main() {
  float axis = clamp(local.x, -capsule.x, capsule.x);
  float distanceToEdge = length(local - vec2(axis,0)) - capsule.y;
  float alpha = opacity * (1.0-smoothstep(-0.65,0.8,distanceToEdge));
  pixel = vec4(tint*alpha,alpha);
}
`,
}

export function AriesAntigravity() {
  const canvas = useBackdropCanvas(scene)
  return (
    <div className="glass-backdrop aries-antigravity" aria-hidden="true">
      <canvas ref={canvas} />
    </div>
  )
}
