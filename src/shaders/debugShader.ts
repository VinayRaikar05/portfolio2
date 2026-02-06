/**
 * DEBUG: Ultra-simple shader to test if anything renders at all
 */

export const debugVertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const debugFragmentShader = `
  uniform sampler2D uVelocityField;
  uniform float uTime;
  
  varying vec2 vUv;
  
  void main() {
    // Sample velocity field
    vec4 velocity = texture2D(uVelocityField, vUv);
    
    // DEBUG: Just show velocity magnitude as brightness
    float mag = length(velocity.xy);
    
    // Make it VERY visible - bright red where there's velocity
    vec3 color = vec3(mag * 100.0, 0.0, 0.0);
    float alpha = mag * 100.0;
    
    // Also show a test pattern to confirm shader is running
    float test = step(0.49, fract(vUv.x * 10.0)) * step(0.49, fract(vUv.y * 10.0));
    color += vec3(test * 0.1);
    alpha = max(alpha, test * 0.3);
    
    gl_FragColor = vec4(color, alpha);
  }
`;
