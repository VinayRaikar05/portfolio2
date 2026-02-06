/**
 * Velocity Visualization Shader - Shows motion vectors as colored trails
 * 
 * Simpler approach: directly visualize the velocity field instead of
 * trying to distort a scene texture.
 */

export const velocityVisVertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const velocityVisFragmentShader = `
  uniform sampler2D uVelocityField;
  uniform sampler2D uBlueNoise;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uStrength;
  uniform vec3 uThemeColor;
  
  varying vec2 vUv;
  
  void main() {
    // Sample velocity field
    vec4 velocity = texture2D(uVelocityField, vUv);
    vec2 vel = velocity.xy;
    float velMagnitude = velocity.a;
    float distanceField = velocity.b;
    
    // Sample blue noise for texture
    vec2 noiseUV = vUv * uResolution / 64.0 + uTime * 0.01;
    float noise = texture2D(uBlueNoise, noiseUV).r;
    
    // Create flowing trails based on velocity
    vec3 color = vec3(0.0);
    float alpha = 0.0;
    
    if (velMagnitude > 0.01) {
      // Direction-based color
      vec2 velDir = normalize(vel + 0.001);
      float angle = atan(velDir.y, velDir.x);
      
      // Map angle to color (hue rotation)
      vec3 baseColor = uThemeColor;
      vec3 accentColor = vec3(0.8, 0.4, 1.0); // Purple accent
      color = mix(baseColor, accentColor, sin(angle * 2.0) * 0.5 + 0.5);
      
      // Intensity based on velocity magnitude
      float intensity = smoothstep(0.0, 1.0, velMagnitude * uStrength);
      
      // Add blue noise texture for organic feel
      intensity *= (0.7 + noise * 0.3);
      
      // Distance field creates soft brush strokes
      float brush = smoothstep(0.0, 0.5, distanceField);
      
      alpha = intensity * brush * 0.6;
      color *= intensity;
    }
    
    gl_FragColor = vec4(color, alpha);
  }
`;
