/**
 * Distortion Shader - Final effect with blue noise jittering and RGB chromatic aberration
 * 
 * Uses 9-tap sampling with blue noise offsets for high-quality distortion.
 * Applies velocity-based RGB color separation for premium visual effect.
 */

export const distortionVertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const distortionFragmentShader = `
  uniform sampler2D uScene;
  uniform sampler2D uVelocityField;
  uniform sampler2D uBlueNoise;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uDistortionStrength;
  uniform vec3 uThemeColor; // Indigo theme color
  
  varying vec2 vUv;
  
  // Blue noise jitter offsets for 9 taps
  const vec2 offsets[9] = vec2[9](
    vec2(0.0, 0.0),
    vec2(-1.0, -1.0),
    vec2(0.0, -1.0),
    vec2(1.0, -1.0),
    vec2(-1.0, 0.0),
    vec2(1.0, 0.0),
    vec2(-1.0, 1.0),
    vec2(0.0, 1.0),
    vec2(1.0, 1.0)
  );
  
  void main() {
    // Sample velocity field
    vec4 velocity = texture2D(uVelocityField, vUv);
    vec2 vel = velocity.xy;
    float velMagnitude = velocity.a;
    
    // Sample blue noise for jittering
    vec2 noiseUV = vUv * uResolution / 64.0 + uTime * 0.01;
    float noise = texture2D(uBlueNoise, noiseUV).r;
    
    // Base distortion strength
    float distortionAmount = velMagnitude * uDistortionStrength * 0.02;
    
    // RGB chromatic aberration based on velocity
    float aberration = velMagnitude * uDistortionStrength * 0.005;
    
    // 9-tap sampling with blue noise jittering
    vec3 color = vec3(0.0);
    float totalWeight = 0.0;
    
    for (int i = 0; i < 9; i++) {
      // Jitter offset using blue noise
      vec2 jitter = offsets[i] * 0.001 * (noise * 2.0 - 1.0);
      
      // Distortion offset
      vec2 offset = vel * distortionAmount + jitter;
      
      // Sample with chromatic aberration
      vec2 uvR = vUv + offset + vel * aberration;
      vec2 uvG = vUv + offset;
      vec2 uvB = vUv + offset - vel * aberration;
      
      // Clamp UVs to prevent edge artifacts
      uvR = clamp(uvR, 0.0, 1.0);
      uvG = clamp(uvG, 0.0, 1.0);
      uvB = clamp(uvB, 0.0, 1.0);
      
      // Sample each channel separately
      float r = texture2D(uScene, uvR).r;
      float g = texture2D(uScene, uvG).g;
      float b = texture2D(uScene, uvB).b;
      
      // Weight based on tap position (center has more weight)
      float weight = i == 0 ? 0.3 : 0.0875; // Center: 0.3, Others: 0.7/8
      
      color += vec3(r, g, b) * weight;
      totalWeight += weight;
    }
    
    color /= totalWeight;
    
    // Apply subtle theme color tint based on velocity
    vec3 tint = mix(vec3(1.0), uThemeColor, velMagnitude * 0.15);
    color *= tint;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;
