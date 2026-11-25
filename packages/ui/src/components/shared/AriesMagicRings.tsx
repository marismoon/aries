import {
  useBackdropCanvas,
  useDarkGlass,
  type BackdropShader,
} from "../../hooks/use-backdrop-canvas"

const scene: BackdropShader = {
  maxPixelRatio: 2,
  linearPalette: true,
  fragment: `
out vec4 pixel;
uniform float pixelRatio;

// Map emitted light to premultiplied RGBA before combining visible layers.
vec4 expose(vec3 emission) {
  float peak = max(emission.r,max(emission.g,emission.b));
  float alpha = 1.0-exp(-peak);
  vec3 chroma = emission/max(peak,1e-8);
  float highlight = 0.4*smoothstep(1.4,3.6,peak);
  return vec4(alpha*mix(chroma,vec3(1),highlight),alpha);
}

void main() {
  float unit = min(viewport.x, viewport.y);
  vec2 p = (gl_FragCoord.xy - 0.5 * viewport) / unit;
  float radial = length(p);
  float angle = atan(abs(p.y),max(0.00001,abs(p.x))) / 1.5707963;
  float halfWidth = 2.0*pixelRatio*max(0.5,1.0-angle);
  const float haloScale = 0.045;
  const float haloLimit = 4.5*haloScale + 0.008;
  vec3 glow = vec3(0);
  vec4 coreTransmission = vec4(1);
  for (int i = 0; i < 6; ++i) {
    float layer = float(i);
    float age = clock - layer * 0.5;
    if (age < 0.0) continue;
    float t = mod(max(0.0, age), 3.45);
    float radius = 0.35 + layer * 0.1 + 0.1 * (1.0 - pow(1.0 - t / 3.45, 2.0));
    float strength = min(smoothstep(0.0,0.7,t),1.0-smoothstep(0.5,3.25,t));
    float taper = pow(1.5, layer);
    if (age < 3.45) taper /= max(0.08,smoothstep(0.0,0.9,age));
    float energy = strength * max(0.0,exp(-10.0*radius*pow(angle*taper,3.0))-0.002);
    float distanceToRing = abs(radial-radius);
    float edge = clamp((haloLimit-distanceToRing)/(0.55*haloLimit),0.0,1.0);
    float falloff = exp(-distanceToRing/haloScale);
    vec3 tint = mix(palette[0],palette[1],layer/5.0);
    glow += tint*energy*edge*edge*(0.5*pow(falloff,4.0)+0.9*falloff);

    float coverage = clamp(halfWidth+0.5-distanceToRing*unit,0.0,1.0);
    if (coverage > 0.0) {
      coreTransmission *= 1.0-expose(tint*energy*coverage*1.7);
    }
  }
  // Screen each exposed core over the combined glow. The complementary
  // product collects all six cores without allocating intermediate textures.
  pixel = 1.0-(1.0-expose(glow))*coreTransmission;
}
`,
}

function MagicRingsCanvas() {
  const canvas = useBackdropCanvas(scene)
  return (
    <div className="glass-backdrop aries-magic-rings" aria-hidden="true">
      <canvas ref={canvas} />
    </div>
  )
}

export function AriesMagicRings() {
  return useDarkGlass() ? <MagicRingsCanvas /> : null
}
