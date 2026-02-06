/**
 * Paint Shader - Renders mouse input with velocity as 2D distance field
 * 
 * Mixes previous low-res velocity to create propagation effect.
 * Output: vec4(velocity.x, velocity.y, distance, intensity)
 */

export const paintVertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const paintFragmentShader = `
  uniform vec2 uMousePos;
  uniform vec2 uMouseVelocity;
  uniform sampler2D uPreviousLowRes;
  uniform float uTime;
  uniform float uDecay;
  uniform vec2 uResolution;
  
  varying vec2 vUv;
  
  void main() {
    // Calculate distance from mouse position
    vec2 mouseUV = (uMousePos + 1.0) * 0.5; // Convert from [-1,1] to [0,1]
    vec2 toMouse = vUv - mouseUV;
    float dist = length(toMouse * vec2(uResolution.x / uResolution.y, 1.0));
    
    // Create smooth falloff using distance field
    float radius = 0.15; // Brush radius
    float softness = 0.1; // Edge softness
    float influence = 1.0 - smoothstep(radius - softness, radius + softness, dist);
    
    // Current velocity contribution
    vec2 currentVelocity = uMouseVelocity * influence;
    
    // Sample previous low-res buffer for velocity propagation
    vec4 prevLowRes = texture2D(uPreviousLowRes, vUv);
    vec2 prevVelocity = prevLowRes.xy;
    
    // Mix current and previous velocity with decay
    vec2 finalVelocity = currentVelocity + prevVelocity * uDecay;
    
    // Distance field value
    float distanceField = influence;
    
    // Intensity (magnitude of velocity)
    float intensity = length(finalVelocity);
    
    // Output: RG = velocity, B = distance field, A = intensity
    gl_FragColor = vec4(finalVelocity, distanceField, intensity);
  }
`;
