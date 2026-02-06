/**
 * CanvasLayer - Persistent WebGL canvas with refined, calm motion
 * 
 * WHY: Single canvas with intelligent motion that feels engineered, not animated.
 * Key principles:
 * - Motion has inertia (exponential smoothing)
 * - Cursor modifies fields, not positions
 * - Calm factor increases as user progresses (training → convergence)
 * - Text area has sparse, calm particles
 * - Edge areas have more density but still controlled
 */
import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { useAnimation } from '../context/AnimationContext';

// GLSL Vertex Shader - Calm, intentional motion with field-based cursor influence
const vertexShader = `
  uniform float uTime;
  uniform float uScrollProgress;
  uniform float uSectionProgress;
  uniform vec2 uCursorPosition;
  uniform float uScrollVelocity;
  uniform float uTransitionProgress;
  uniform float uSectionIndex;
  uniform float uCalmFactor;
  
  attribute vec3 aBasePosition;
  attribute float aRandom;
  attribute float aNodeType;
  attribute float aDistanceFromCenter;
  
  varying vec3 vPosition;
  varying float vRandom;
  varying float vNodeType;
  varying float vDistortion;
  varying float vDistanceFromCenter;
  
  // Simplex noise - unchanged but used more sparingly
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  
  void main() {
    vec3 pos = aBasePosition;
    
    // Calm factor reduces all motion as user progresses
    // Home: 0.0 (dynamic), Contact: 1.0 (calm)
    float effectiveCalm = uCalmFactor * 0.7 + uSectionIndex * 0.05;
    float motionIntensity = 1.0 - effectiveCalm;
    
    // Distance-based calm zone - particles near center (text area) move less
    float centerCalm = smoothstep(0.0, 4.0, aDistanceFromCenter);
    float localIntensity = motionIntensity * (0.3 + 0.7 * centerCalm);
    
    // Very subtle drift - feels alive but not chaotic
    float driftScale = 0.08 * localIntensity;
    vec3 driftPos = pos * driftScale + uTime * 0.03;
    float driftNoise = snoise(driftPos) * 0.15 * localIntensity;
    
    // Cursor influence via FIELD, not direct position manipulation
    // Cursor creates a distortion field that affects motion direction
    vec2 toCursor = uCursorPosition - pos.xy;
    float cursorDist = length(toCursor);
    float cursorFieldStrength = smoothstep(6.0, 0.0, cursorDist) * (1.0 - effectiveCalm * 0.5);
    
    // Field-based cursor influence - subtle rotation around cursor
    float angle = atan(toCursor.y, toCursor.x) + uTime * 0.5;
    vec3 fieldOffset = vec3(
      cos(angle) * cursorFieldStrength * 0.08,
      sin(angle) * cursorFieldStrength * 0.08,
      cursorFieldStrength * 0.04 * sin(uTime * 0.3)
    );
    
    // Scroll velocity creates subtle destabilization, never chaos
    float velocityInfluence = uScrollVelocity * 0.08 * (1.0 - effectiveCalm);
    vec3 velocityOffset = vec3(
      sin(pos.y * 1.5 + uTime * 0.5) * velocityInfluence,
      cos(pos.x * 1.5 + uTime * 0.5) * velocityInfluence,
      sin(pos.z * 2.0 + uTime * 0.3) * velocityInfluence * 0.5
    );
    
    // Section transition - subtle morphing
    float transitionInfluence = uTransitionProgress * 0.15 * motionIntensity;
    vec3 transitionOffset = vec3(
      sin(pos.x * 2.0 + uSectionIndex) * transitionInfluence,
      cos(pos.y * 2.0 + uSectionIndex) * transitionInfluence,
      sin(pos.z * 2.0 + uSectionIndex) * transitionInfluence * 0.5
    );
    
    // Apply all displacements with calm-aware intensity
    pos += fieldOffset + velocityOffset + transitionOffset;
    pos += normalize(pos + 0.001) * driftNoise * localIntensity;
    
    // Very subtle quantization - only when not calm
    if (motionIntensity > 0.3) {
      float quantization = 0.03 * motionIntensity;
      pos = mix(pos, floor(pos / quantization) * quantization, 0.3);
    }
    
    vPosition = pos;
    vRandom = aRandom;
    vNodeType = aNodeType;
    vDistortion = driftNoise + cursorFieldStrength * 0.3;
    vDistanceFromCenter = aDistanceFromCenter;
    
    // Point size varies by distance from center (smaller near text)
    // and by calm factor (smaller when calm)
    float baseSize = 2.5 + aRandom * 3.0;
    float sizeAttenuation = 0.5 + 0.5 * centerCalm;
    float calmSizeReduction = 1.0 - effectiveCalm * 0.3;
    gl_PointSize = baseSize * sizeAttenuation * calmSizeReduction;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// GLSL Fragment Shader - Refined, premium color treatment
const fragmentShader = `
  uniform float uTime;
  uniform float uScrollProgress;
  uniform float uSectionIndex;
  uniform float uCalmFactor;
  
  varying vec3 vPosition;
  varying float vRandom;
  varying float vNodeType;
  varying float vDistortion;
  varying float vDistanceFromCenter;
  
  void main() {
    // Circular particle with soft edge
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;
    
    // Soft edge fade
    float edgeFade = 1.0 - smoothstep(0.25, 0.5, dist);
    
    // Monochrome base with subtle variation
    vec3 baseColor = vec3(0.38, 0.38, 0.42); // Subtle gray-blue
    
    // Node type adds slight variation (still monochrome)
    if (vNodeType < 0.33) {
      baseColor = vec3(0.35, 0.35, 0.40);
    } else if (vNodeType < 0.66) {
      baseColor = vec3(0.40, 0.40, 0.45);
    } else {
      baseColor = vec3(0.42, 0.42, 0.47);
    }
    
    // Accent color (indigo) appears only on interaction
    float accentStrength = vDistortion * 0.15 * (1.0 - uCalmFactor * 0.5);
    vec3 accentColor = vec3(0.31, 0.27, 0.90); // Indigo
    vec3 color = mix(baseColor, accentColor, accentStrength);
    
    // Distance from center affects brightness (subtle depth)
    float depthBrightness = 0.7 + 0.3 * smoothstep(0.0, 8.0, vDistanceFromCenter);
    color *= depthBrightness;
    
    // Alpha varies by calm factor and position
    // Calmer = more transparent, subtler
    float baseAlpha = 0.35 * (1.0 - uCalmFactor * 0.3);
    float randomAlpha = vRandom * 0.2;
    float alpha = (baseAlpha + randomAlpha) * edgeFade;
    
    // Further reduce alpha near center (text area)
    float centerAlpha = smoothstep(0.0, 3.0, vDistanceFromCenter);
    alpha *= (0.4 + 0.6 * centerAlpha);
    
    gl_FragColor = vec4(color, alpha);
  }
`;

// Connection line shader - Subtle, spectral lines
const connectionVertexShader = `
  uniform float uTime;
  uniform float uCalmFactor;
  uniform vec2 uCursorPosition;
  
  attribute float aLineIndex;
  attribute float aSignalPhase;
  
  varying float vLineIndex;
  varying float vSignal;
  varying float vCursorProximity;
  
  void main() {
    vec3 pos = position;
    
    // Cursor proximity creates subtle wave
    vec2 toCursor = uCursorPosition - pos.xy;
    float cursorDist = length(toCursor);
    float cursorProximity = smoothstep(8.0, 0.0, cursorDist) * (1.0 - uCalmFactor);
    
    // Very subtle wave along line
    float wave = sin(aLineIndex * 0.3 + uTime * 0.8 + aSignalPhase) * 0.015;
    pos.z += wave * (1.0 + cursorProximity);
    
    // Signal propagation - slow, deliberate
    float signalSpeed = 0.3 * (1.0 + uCalmFactor); // Slower when calm
    float signal = sin(aLineIndex * 0.2 - uTime * signalSpeed + aSignalPhase);
    
    vLineIndex = aLineIndex;
    vSignal = signal * 0.5 + 0.5; // 0 to 1
    vCursorProximity = cursorProximity;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const connectionFragmentShader = `
  uniform float uCalmFactor;
  uniform float uSectionIndex;
  
  varying float vLineIndex;
  varying float vSignal;
  varying float vCursorProximity;
  
  void main() {
    // Base line - very subtle
    vec3 baseColor = vec3(0.35, 0.35, 0.40);
    
    // Signal creates subtle pulse
    vec3 signalColor = vec3(0.38, 0.35, 0.55);
    vec3 color = mix(baseColor, signalColor, vSignal * 0.4);
    
    // Cursor proximity adds slight accent
    vec3 accentColor = vec3(0.31, 0.27, 0.90);
    color = mix(color, accentColor, vCursorProximity * 0.15);
    
    // Alpha - very subtle, decreases with calm factor
    float baseAlpha = 0.06 * (1.0 - uCalmFactor * 0.4);
    float signalAlpha = vSignal * 0.08 * (1.0 - uCalmFactor * 0.3);
    float alpha = baseAlpha + signalAlpha;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

// Create uniform objects for Three.js
function createUniforms() {
  return {
    uTime: { value: 0 },
    uScrollProgress: { value: 0 },
    uSectionProgress: { value: 0 },
    uCursorPosition: { value: [0, 0] as [number, number] },
    uScrollVelocity: { value: 0 },
    uTransitionProgress: { value: 0 },
    uSectionIndex: { value: 0 },
    uCalmFactor: { value: 0 },
  };
}

export default function CanvasLayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const linesRef = useRef<THREE.LineSegments | null>(null);
  const rafRef = useRef<number>(0);
  const uniformsRef = useRef(createUniforms());
  const { uniformsRef: contextUniformsRef } = useAnimation();
  
  // Smoothed values for inertia
  const smoothedCursorRef = useRef({ x: 0, y: 0 });
  const smoothedVelocityRef = useRef(0);
  const targetCalmRef = useRef(0);
  const currentCalmRef = useRef(0);

  // Camera positions for each section - more subtle movements
  const sectionCameraPositions = useRef([
    { pos: [0, 0, 14], target: [0, 0, 0] },      // home - wide, calm view
    { pos: [3, 1, 12], target: [1, 0, 0] },      // about - gentle approach
    { pos: [-2, -1, 11], target: [-1, 0, 0] },   // skills - subtle shift
    { pos: [0, 3, 10], target: [0, 1, 0] },      // projects - from above
    { pos: [2, -2, 12], target: [0.5, -0.5, 0] },// experience - gentle angle
    { pos: [0, 0, 8], target: [0, 0, 0] },       // contact - close, calm
  ]);

  const initScene = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera with moderate FOV
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.set(0, 0, 14);
    cameraRef.current = camera;

    // Renderer with alpha
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // REDUCED particle count for calmer feel (150 instead of 300)
    const particleCount = 150;
    const positions = new Float32Array(particleCount * 3);
    const distancesFromCenter = new Float32Array(particleCount);
    const randoms = new Float32Array(particleCount);
    const nodeTypes = new Float32Array(particleCount);

    // Create particles with distance-based distribution
    // More particles at edges, fewer near center (text area)
    for (let i = 0; i < particleCount; i++) {
      // Use polar-like distribution for edge bias
      const angle = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const radiusBias = 0.3 + Math.random() * 0.7; // Bias toward outer areas
      const radius = 2 + radiusBias * 6; // 2 to 8 units from center
      
      const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 2;
      const y = Math.sin(angle) * radius * 0.6 + (Math.random() - 0.5) * 3; // Flatter distribution
      const z = (Math.random() - 0.5) * 4;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      distancesFromCenter[i] = Math.sqrt(x * x + y * y);
      randoms[i] = Math.random();
      nodeTypes[i] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aBasePosition', new THREE.BufferAttribute(positions.slice(), 3));
    geometry.setAttribute('aDistanceFromCenter', new THREE.BufferAttribute(distancesFromCenter, 1));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
    geometry.setAttribute('aNodeType', new THREE.BufferAttribute(nodeTypes, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: uniformsRef.current,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;

    // REDUCED connections for calmer feel (300 instead of 800)
    const maxConnections = 300;
    const linePositions = new Float32Array(maxConnections * 2 * 3);
    const lineIndices = new Float32Array(maxConnections);
    const signalPhases = new Float32Array(maxConnections);

    let lineIndex = 0;
    for (let i = 0; i < particleCount && lineIndex < maxConnections; i++) {
      // Only connect to nearest neighbors
      const xi = positions[i * 3];
      const yi = positions[i * 3 + 1];
      const zi = positions[i * 3 + 2];
      
      // Find 2-3 nearest neighbors
      const neighbors: { idx: number; dist: number }[] = [];
      for (let j = i + 1; j < particleCount; j++) {
        const dx = xi - positions[j * 3];
        const dy = yi - positions[j * 3 + 1];
        const dz = zi - positions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (dist < 3.5) {
          neighbors.push({ idx: j, dist });
        }
      }
      
      // Sort by distance and take closest 2
      neighbors.sort((a, b) => a.dist - b.dist);
      const closestNeighbors = neighbors.slice(0, 2);
      
      for (const neighbor of closestNeighbors) {
        if (lineIndex >= maxConnections) break;
        
        const j = neighbor.idx;
        linePositions[lineIndex * 6] = xi;
        linePositions[lineIndex * 6 + 1] = yi;
        linePositions[lineIndex * 6 + 2] = zi;
        linePositions[lineIndex * 6 + 3] = positions[j * 3];
        linePositions[lineIndex * 6 + 4] = positions[j * 3 + 1];
        linePositions[lineIndex * 6 + 5] = positions[j * 3 + 2];
        
        lineIndices[lineIndex] = lineIndex;
        signalPhases[lineIndex] = Math.random() * Math.PI * 2;
        
        lineIndex++;
      }
    }

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions.slice(0, lineIndex * 6), 3));
    lineGeometry.setAttribute('aLineIndex', new THREE.BufferAttribute(lineIndices.slice(0, lineIndex), 1));
    lineGeometry.setAttribute('aSignalPhase', new THREE.BufferAttribute(signalPhases.slice(0, lineIndex), 1));

    const lineMaterial = new THREE.ShaderMaterial({
      vertexShader: connectionVertexShader,
      fragmentShader: connectionFragmentShader,
      uniforms: uniformsRef.current,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);
    linesRef.current = lines;
  }, []);

  // Animation loop with inertia and smoothing
  useEffect(() => {
    initScene();

    const animate = (time: number) => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

      // Update time uniform
      uniformsRef.current.uTime.value = time * 0.001;
      contextUniformsRef.current.uTime = uniformsRef.current.uTime.value;

      // Smooth cursor with inertia (exponential smoothing)
      const targetCursorX = contextUniformsRef.current.uCursorPosition[0];
      const targetCursorY = contextUniformsRef.current.uCursorPosition[1];
      smoothedCursorRef.current.x += (targetCursorX - smoothedCursorRef.current.x) * 0.08;
      smoothedCursorRef.current.y += (targetCursorY - smoothedCursorRef.current.y) * 0.08;
      uniformsRef.current.uCursorPosition.value = [
        smoothedCursorRef.current.x,
        smoothedCursorRef.current.y
      ];

      // Smooth scroll velocity
      const targetVelocity = contextUniformsRef.current.uScrollVelocity;
      smoothedVelocityRef.current += (targetVelocity - smoothedVelocityRef.current) * 0.1;
      uniformsRef.current.uScrollVelocity.value = smoothedVelocityRef.current;

      // Calculate and smooth calm factor
      // Increases with scroll progress and section index
      targetCalmRef.current = contextUniformsRef.current.uScrollProgress * 0.6 + 
                              contextUniformsRef.current.uSectionIndex * 0.08;
      targetCalmRef.current = Math.min(targetCalmRef.current, 0.9);
      currentCalmRef.current += (targetCalmRef.current - currentCalmRef.current) * 0.05;
      uniformsRef.current.uCalmFactor.value = currentCalmRef.current;
      contextUniformsRef.current.uCalmFactor = currentCalmRef.current;

      // Sync other uniforms
      uniformsRef.current.uScrollProgress.value = contextUniformsRef.current.uScrollProgress;
      uniformsRef.current.uSectionProgress.value = contextUniformsRef.current.uSectionProgress;
      uniformsRef.current.uTransitionProgress.value = contextUniformsRef.current.uTransitionProgress;
      uniformsRef.current.uSectionIndex.value = contextUniformsRef.current.uSectionIndex;

      // Camera interpolation with inertia
      const currentSectionIdx = Math.floor(uniformsRef.current.uSectionIndex.value);
      const sectionBlend = uniformsRef.current.uSectionProgress.value;
      
      const currentCam = sectionCameraPositions.current[currentSectionIdx] || sectionCameraPositions.current[0];
      const nextCam = sectionCameraPositions.current[Math.min(currentSectionIdx + 1, sectionCameraPositions.current.length - 1)];

      const targetPos = [
        currentCam.pos[0] + (nextCam.pos[0] - currentCam.pos[0]) * sectionBlend,
        currentCam.pos[1] + (nextCam.pos[1] - currentCam.pos[1]) * sectionBlend,
        currentCam.pos[2] + (nextCam.pos[2] - currentCam.pos[2]) * sectionBlend,
      ];

      // Exponential smoothing for camera (slower = more premium feel)
      const cameraLerp = 0.03;
      cameraRef.current.position.x += (targetPos[0] - cameraRef.current.position.x) * cameraLerp;
      cameraRef.current.position.y += (targetPos[1] - cameraRef.current.position.y) * cameraLerp;
      cameraRef.current.position.z += (targetPos[2] - cameraRef.current.position.z) * cameraLerp;

      const targetLook = [
        currentCam.target[0] + (nextCam.target[0] - currentCam.target[0]) * sectionBlend,
        currentCam.target[1] + (nextCam.target[1] - currentCam.target[1]) * sectionBlend,
        currentCam.target[2] + (nextCam.target[2] - currentCam.target[2]) * sectionBlend,
      ];
      cameraRef.current.lookAt(targetLook[0], targetLook[1], targetLook[2]);

      // Very subtle camera drift from cursor (reduced when calm)
      const cursorDrift = 0.003 * (1.0 - currentCalmRef.current * 0.5);
      cameraRef.current.position.x += smoothedCursorRef.current.x * cursorDrift;
      cameraRef.current.position.y += smoothedCursorRef.current.y * cursorDrift;

      rendererRef.current.render(sceneRef.current, cameraRef.current);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!rendererRef.current || !cameraRef.current) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      rendererRef.current.setSize(width, height);
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (containerRef.current && rendererRef.current.domElement) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
      }
      if (particlesRef.current) {
        particlesRef.current.geometry.dispose();
        (particlesRef.current.material as THREE.ShaderMaterial).dispose();
      }
      if (linesRef.current) {
        linesRef.current.geometry.dispose();
        (linesRef.current.material as THREE.ShaderMaterial).dispose();
      }
    };
  }, [initScene, contextUniformsRef]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: 'transparent' }}
    />
  );
}
