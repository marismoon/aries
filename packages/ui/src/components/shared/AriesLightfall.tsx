import {
  useBackdropCanvas,
  useDarkGlass,
  type BackdropShader,
} from "../../hooks/use-backdrop-canvas"

const scene: BackdropShader = {
  fragment: `
out vec4 pixel;

float noise1(float lane) { return fract(sin(mod(lane, 479.0)*73.137)*2483.81); }
void main() {
  vec2 uv = gl_FragCoord.xy / viewport;
  vec2 plane = (uv-0.5)*2.0*viewport/viewport.x;
  // Integral of the initial speed boost over the 2.6-second entrance.
  float remaining = clamp(1.0-clock/2.6,0.0,1.0);
  float travel = 0.03*(clock + 7.8*(1.0-remaining*remaining*remaining));
  float stretch = 1.0 + 5.0*remaining*remaining;
  vec3 origin = vec3(0,-8.0/9.0,-2.0/9.0);
  vec3 ray = vec3(plane,3);
  // The camera sits inside a rounded tunnel. Bound the exit with the box
  // first, then converge onto the fourth-power surface along the same ray.
  vec3 farFace = (1.0-origin*sign(ray))/max(abs(ray),vec3(0.00001));
  float depth = min(farFace.x,min(farFace.y,farFace.z));
  for(int i=0;i<6;i++) {
    vec3 point = origin+ray*depth;
    vec3 squared = point*point;
    depth -= (dot(squared,squared)-1.0)/max(0.00001,4.0*dot(point*squared,ray));
  }
  vec3 hit = origin+ray*depth;
  float track = hit.x*200.0;
  float angle = atan(hit.z,hit.y);
  float trackPixel = max(0.001,length(vec2(dFdx(track),dFdy(track))));
  // The angular coordinate wraps. Differentiate the Cartesian hit instead.
  vec2 tangent = vec2(-hit.z,hit.y)/max(0.00001,dot(hit.yz,hit.yz));
  vec2 angularGradient = vec2(dot(tangent,dFdx(hit.yz)),dot(tangent,dFdy(hit.yz)));
  vec2 laneGradient = vec2(dFdx(track),dFdy(track));
  vec2 laneNormal = laneGradient/trackPixel;
  float radiansPerPixel = max(0.00001,abs(dot(angularGradient,vec2(-laneNormal.y,laneNormal.x))));
  float crossSlope = dot(angularGradient,laneNormal);
  const float period = 1.5707963;
  vec3 light = vec3(0);
  for(int layer=0;layer<2;layer++){
    float shifted = track+float(layer)*0.125;
    float lane = floor(shifted+0.5);
    float seed = noise1(lane+float(layer)*257.0);
    float rate = 1.0+floor(16.0*seed)/16.0;
    float tick = (9.0+travel)*rate;
    float phase = mod(angle-tick-noise1(lane*7.0+float(layer))*period+0.5*period,period)-0.5*period;
    float across = (shifted-lane)/trackPixel;
    float ahead = (phase-across*crossSlope)/radiansPerPixel;
    float behind = max(-phase,0.0);
    float decay = behind*19.0/stretch;
    float tail = exp(-decay)
      * (1.0-smoothstep(0.25*period,0.475*period,behind))
      * (1.0-smoothstep(1.2,3.2,decay));
    float width = 0.08/trackPixel;
    float sigma = max(0.55,0.75*width*mix(0.4,1.0,tail));
    float lineDistance = length(vec2(across,max(0.0,ahead)));
    float line = 0.75*width*mix(0.4,1.0,tail)/sigma * exp(-0.5*pow(lineDistance/sigma,2.0))*tail;
    float headWidth = max(0.7,1.2*width);
    float head = pow(1.2*width/headWidth,2.0)*exp(-0.5*dot(vec2(across,ahead),vec2(across,ahead))/(headWidth*headWidth));
    float laneMask = 1.0-smoothstep(0.36,0.5,abs(shifted-lane));
    vec3 swatch = palette[int(floor(seed*3.0))];
    vec3 hue = swatch*swatch;
    light += laneMask*(1.35+0.3*sin(13.0+travel+7.0*seed))*
      (line*hue + 3.0*head*mix(hue,vec3(1),0.6));
  }
  float fog = exp(-0.8*max(0.0,depth*length(ray)-0.6));
  vec2 top = (uv-vec2(0.5,1.05))*vec2(2.2,3.2);
  vec3 topColor = palette[0]*palette[0];
  light = light*fog*smoothstep(1.6,3.2,1.0/trackPixel) + topColor*0.25*exp(-dot(top,top));
  light *= min(1.0,(1.0-remaining)*2.2);
  vec3 result = sqrt(1.0-exp(-1.3*light*light/(light+0.025)));
  pixel = vec4(result,max(max(result.r,result.g),result.b));
}
`,
}

function LightfallCanvas() {
  const canvas = useBackdropCanvas(scene)
  return (
    <div className="glass-backdrop aries-lightfall" aria-hidden="true">
      <canvas ref={canvas} />
    </div>
  )
}

export function AriesLightfall() {
  return useDarkGlass() ? <LightfallCanvas /> : null
}
