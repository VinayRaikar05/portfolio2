import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// --- SHADERS (User Provided Constellation Shaders) ---
const vertexShader = `
  uniform float uTime;
  uniform vec2 uCursorPosition;
  uniform float uScrollVelocity;
  
  attribute vec3 aBasePosition;
  attribute float aRandom;
  attribute float aDistanceFromCenter;
  
  varying vec3 vPosition;
  varying float vRandom;
  varying float vDistanceFromCenter;
  
  // Simplex noise function
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
    
    // Gentle drift
    float driftScale = 0.05;
    vec3 driftPos = pos * driftScale + uTime * 0.03;
    float driftNoise = snoise(driftPos) * 0.15;
    
    // Cursor influence (Field based)
    vec2 toCursor = uCursorPosition - pos.xy;
    float cursorDist = length(toCursor);
    float cursorFieldStrength = smoothstep(6.0, 0.0, cursorDist);
    
    float angle = atan(toCursor.y, toCursor.x) + uTime * 0.5;
    vec3 fieldOffset = vec3(
      cos(angle) * cursorFieldStrength * 0.08,
      sin(angle) * cursorFieldStrength * 0.08,
      cursorFieldStrength * 0.04 * sin(uTime * 0.3)
    );
    
    // Scroll velocity influence
    float velocityInfluence = uScrollVelocity * 0.08;
    vec3 velocityOffset = vec3(
      sin(pos.y * 1.5 + uTime * 0.5) * velocityInfluence,
      cos(pos.x * 1.5 + uTime * 0.5) * velocityInfluence,
      sin(pos.z * 2.0 + uTime * 0.3) * velocityInfluence * 0.5
    );
    
    pos += fieldOffset + velocityOffset;
    pos += normalize(pos + 0.001) * driftNoise;
    
    vPosition = pos;
    vRandom = aRandom;
    vDistanceFromCenter = aDistanceFromCenter;
    
    float baseSize = 2.5 + aRandom * 3.0;
    // Reduce size near center (optional, nice for text visibility)
    float sizeAttenuation = 0.5 + 0.5 * smoothstep(0.0, 4.0, aDistanceFromCenter);
    gl_PointSize = baseSize * sizeAttenuation;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;
const fragmentShader = `
  uniform float uTime;
  
  varying vec3 vPosition;
  varying float vRandom;
  varying float vDistanceFromCenter;
  
  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;
    
    float edgeFade = 1.0 - smoothstep(0.25, 0.5, dist);
    
    // Particle Color
    vec3 baseColor = vec3(0.38, 0.38, 0.42); // Gray-Blue
    
    // Opacity
    float baseAlpha = 0.35;
    float randomAlpha = vRandom * 0.2;
    float alpha = (baseAlpha + randomAlpha) * edgeFade;
    
    // Fade out near center
    float centerAlpha = smoothstep(0.0, 3.0, vDistanceFromCenter);
    alpha *= (0.4 + 0.6 * centerAlpha);
    
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // DEBUG RED
  }
`;
const connectionVertexShader = `
  uniform float uTime;
  uniform vec2 uCursorPosition;
  
  attribute float aLineIndex;
  attribute float aSignalPhase;
  
  varying float vSignal;
  varying float vCursorProximity;
  
  void main() {
    vec3 pos = position;
    
    vec2 toCursor = uCursorPosition - pos.xy;
    float cursorDist = length(toCursor);
    float cursorProximity = smoothstep(8.0, 0.0, cursorDist);
    
    // Wave effect
    float wave = sin(aLineIndex * 0.3 + uTime * 0.8 + aSignalPhase) * 0.015;
    pos.z += wave * (1.0 + cursorProximity);
    
    // Signal traveling
    float signalSpeed = 0.3;
    float signal = sin(aLineIndex * 0.2 - uTime * signalSpeed + aSignalPhase);
    
    vSignal = signal * 0.5 + 0.5;
    vCursorProximity = cursorProximity;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;
const connectionFragmentShader = `
  varying float vSignal;
  varying float vCursorProximity;
  
  void main() {
    vec3 baseColor = vec3(0.35, 0.35, 0.40);
    vec3 signalColor = vec3(0.38, 0.35, 0.55); // Purple-ish signal
    vec3 accentColor = vec3(0.31, 0.27, 0.90); // Indigo accent on hover
    
    vec3 color = mix(baseColor, signalColor, vSignal * 0.4);
    color = mix(color, accentColor, vCursorProximity * 0.15);
    
    float baseAlpha = 0.06;
    float signalAlpha = vSignal * 0.08;
    float alpha = baseAlpha + signalAlpha;
    
    gl_FragColor = vec4(color, alpha);
  }
`;
// --- COMPONENT ---
export default function CanvasLayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const uniformsRef = useRef({
    uTime: { value: 0 },
    uCursorPosition: { value: [0, 0] as [number, number] },
    uScrollVelocity: { value: 0 },
  });
  // Inertia State
  const smoothedCursor = useRef({ x: 0, y: 0 });
  const targetCursor = useRef({ x: 0, y: 0 });
  const smoothedVelocity = useRef(0);
  const targetVelocity = useRef(0);
  const lastScrollY = useRef(0);
  useEffect(() => {
    if (!containerRef.current) return;
    // 1. Setup Scene
    const scene = new THREE.Scene();
    const width = window.innerWidth;
    const height = window.innerHeight;
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. Create Particles
    const particleCount = 150;
    const positions = new Float32Array(particleCount * 3);
    const distancesFromCenter = new Float32Array(particleCount);
    const randoms = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const radius = 2 + (0.3 + Math.random() * 0.7) * 6; // Distribution

      const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 2;
      const y = Math.sin(angle) * radius * 0.6 + (Math.random() - 0.5) * 3;
      const z = (Math.random() - 0.5) * 4;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      distancesFromCenter[i] = Math.sqrt(x * x + y * y);
      randoms[i] = Math.random();
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aBasePosition', new THREE.BufferAttribute(positions.slice(), 3));
    geometry.setAttribute('aDistanceFromCenter', new THREE.BufferAttribute(distancesFromCenter, 1));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
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

    // 3. Create Connections
    const maxConnections = 300;
    const linePositions = new Float32Array(maxConnections * 2 * 3);
    const lineIndices = new Float32Array(maxConnections);
    const signalPhases = new Float32Array(maxConnections);

    let lineIndex = 0;
    // Nearest neighbor algorithm
    for (let i = 0; i < particleCount && lineIndex < maxConnections; i++) {
      const xi = positions[i * 3];
      const yi = positions[i * 3 + 1];
      const zi = positions[i * 3 + 2];

      const neighbors: { idx: number; dist: number }[] = [];
      for (let j = i + 1; j < particleCount; j++) {
        const dx = xi - positions[j * 3];
        const dy = yi - positions[j * 3 + 1];
        const dz = zi - positions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 3.5) neighbors.push({ idx: j, dist });
      }
      neighbors.sort((a, b) => a.dist - b.dist);

      for (const neighbor of neighbors.slice(0, 2)) {
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
    // 4. Animation Loop
    let rafId = 0;
    const animate = (time: number) => {
      uniformsRef.current.uTime.value = time * 0.001;
      // Smooth Cursor
      smoothedCursor.current.x += (targetCursor.current.x - smoothedCursor.current.x) * 0.1;
      smoothedCursor.current.y += (targetCursor.current.y - smoothedCursor.current.y) * 0.1;
      uniformsRef.current.uCursorPosition.value = [smoothedCursor.current.x, smoothedCursor.current.y];
      // Smooth Velocity
      smoothedVelocity.current += (targetVelocity.current - smoothedVelocity.current) * 0.1;
      uniformsRef.current.uScrollVelocity.value = smoothedVelocity.current;
      targetVelocity.current *= 0.95; // Decay velocity
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    // 5. Interaction Handlers
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      targetCursor.current = { x, y };
    };
    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;
      targetVelocity.current = delta * 0.01;
      lastScrollY.current = currentY;
    };
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
      renderer.dispose();
      if (containerRef.current) containerRef.current.removeChild(renderer.domElement);
    };
  }, []);
  console.log("CanvasLayer mounting");
  return <div ref={containerRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 100, pointerEvents: 'none', background: 'transparent' }} />;
}
