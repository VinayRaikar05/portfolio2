/**
 * Blur Shader - Gaussian blur for downsampling high-res to low-res
 * 
 * Uses 9-tap Gaussian kernel for smooth velocity field propagation
 */

export const blurVertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const blurFragmentShader = `
  uniform sampler2D uTexture;
  uniform vec2 uResolution;
  
  varying vec2 vUv;
  
  void main() {
    vec2 texelSize = 1.0 / uResolution;
    
    // 9-tap Gaussian blur kernel
    // Center weight: 0.25, Adjacent: 0.125, Diagonal: 0.0625
    vec4 result = vec4(0.0);
    
    // Center
    result += texture2D(uTexture, vUv) * 0.25;
    
    // Adjacent (4 samples)
    result += texture2D(uTexture, vUv + vec2(-texelSize.x, 0.0)) * 0.125;
    result += texture2D(uTexture, vUv + vec2(texelSize.x, 0.0)) * 0.125;
    result += texture2D(uTexture, vUv + vec2(0.0, -texelSize.y)) * 0.125;
    result += texture2D(uTexture, vUv + vec2(0.0, texelSize.y)) * 0.125;
    
    // Diagonal (4 samples)
    result += texture2D(uTexture, vUv + vec2(-texelSize.x, -texelSize.y)) * 0.0625;
    result += texture2D(uTexture, vUv + vec2(texelSize.x, -texelSize.y)) * 0.0625;
    result += texture2D(uTexture, vUv + vec2(-texelSize.x, texelSize.y)) * 0.0625;
    result += texture2D(uTexture, vUv + vec2(texelSize.x, texelSize.y)) * 0.0625;
    
    gl_FragColor = result;
  }
`;
