import { Canvas, useFrame } from '@react-three/fiber';
import { useMorphParticles } from '../hooks/useMorphParticles';
import { useFluid } from '@funtech-inc/use-shader-fx';
import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';

// Exact User Configuration
const USER_CONFIG = {
    blurAlpha: 0.9,
    blurRadius: 0.05,
    pointSize: 0.06,
    pointAlpha: 1,
    color0: new THREE.Color(0xc7d2fe),
    color1: new THREE.Color(0xe9d5ff),
    color2: new THREE.Color(0xa5f3fc),
    color3: new THREE.Color(0xddd6fe),
    wobbleStrength: 0.1, // Reduced from 0.3
    wobblePositionFrequency: 0.5,
    wobbleTimeFrequency: 0.5,
    warpStrength: 0.1, // Reduced from 0.2
    warpPositionFrequency: 0.5,
    warpTimeFrequency: 0.5,
    displacementIntensity: 2.0, // Increased for fluid
    displacementColorIntensity: 0,
    sizeRandomIntensity: 0.5,
    sizeRandomTimeFrequency: 0.2,
    sizeRandomMin: 0.5,
    sizeRandomMax: 1.5,
    divergence: 0,
    divergencePoint: new THREE.Vector3(0, 0, 0),
};

interface MorphParticlesSceneProps {
    currentShape: number;
}

function MorphParticlesScene({ currentShape }: MorphParticlesSceneProps) {

    // 1. Generate geometries for Morphing
    const { geometry, positions, uvs } = useMemo(() => {
        const particleCount = 6000; // Increased for better density

        // Helper to generate a Float32Array
        const createBuffer = () => new Float32Array(particleCount * 3);
        const createUVBuffer = () => new Float32Array(particleCount * 2);

        // --- Shape 1: Brain (Original) ---
        const brainPos = createBuffer();
        const brainUvs = createUVBuffer();
        let pIndex = 0;
        while (pIndex < particleCount) {
            const x = (Math.random() - 0.5) * 4;
            const y = (Math.random() - 0.5) * 3;
            const z = (Math.random() - 0.5) * 4;
            const xAbs = Math.abs(x);
            const gap = 0.15;
            if (xAbs < gap) continue;
            const a = 1.6, b = 1.2, c = 1.5;
            const dist = (Math.pow(xAbs - gap, 2) / (a * a)) + (Math.pow(y, 2) / (b * b)) + (Math.pow(z, 2) / (c * c));
            if (dist <= 1.0) {
                const noise = Math.sin(x * 10) * Math.cos(y * 10) * Math.sin(z * 10) * 0.1;
                brainPos[pIndex * 3] = x + (x > 0 ? noise : -noise);
                brainPos[pIndex * 3 + 1] = y + noise;
                brainPos[pIndex * 3 + 2] = z + noise;

                // Brain UVs
                brainUvs[pIndex * 2] = (brainPos[pIndex * 3] / 4) + 0.5;
                brainUvs[pIndex * 2 + 1] = (brainPos[pIndex * 3 + 1] / 3) + 0.5;
                pIndex++;
            }
        }

        // --- Shape 2: Sphere (Planet) ---
        const spherePos = createBuffer();
        const sphereUvs = createUVBuffer();
        for (let i = 0; i < particleCount; i++) {
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 2.5; // Radius
            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            spherePos[i * 3] = x;
            spherePos[i * 3 + 1] = y;
            spherePos[i * 3 + 2] = z;

            // Sphere UVs (Equirectangular)
            sphereUvs[i * 2] = (theta / (2 * Math.PI)) + 0.5;
            sphereUvs[i * 2 + 1] = (phi / Math.PI);
        }

        // --- Shape 3: DNA Helix (Twist) ---
        const helixPos = createBuffer();
        const helixUvs = createUVBuffer();
        for (let i = 0; i < particleCount; i++) {
            const t = (i / particleCount) * 20 - 10; // -10 to 10
            const radius = 1.5;

            // Double Helix
            const offset = i % 2 === 0 ? 0 : Math.PI;
            const x = Math.cos(t + offset) * radius;
            const z = Math.sin(t + offset) * radius;
            const y = t * 0.4;

            // Add volume/randomness
            const rOffset = (Math.random() - 0.5) * 0.5;

            helixPos[i * 3] = x + rOffset;
            helixPos[i * 3 + 1] = y;
            helixPos[i * 3 + 2] = z + rOffset;

            helixUvs[i * 2] = (i / particleCount);
            helixUvs[i * 2 + 1] = 0.5 + (Math.sin(t) * 0.5);
        }

        // --- Sequence: Brain -> Sphere -> Helix -> Brain ---
        // This allows we to morph 0->1->2->3 and then snap back to 0
        return {
            geometry: new THREE.SphereGeometry(2, 64, 64),
            positions: [brainPos, spherePos, helixPos, brainPos],
            uvs: [brainUvs, sphereUvs, helixUvs, brainUvs],
        };
    }, []);

    // 2. Initialize Hook
    const [updateMorphParticles, , { points }] = useMorphParticles({
        size: { width: window.innerWidth, height: window.innerHeight },
        dpr: Math.min(window.devicePixelRatio, 2),
        geometry,
        positions,
        uvs,
    });

    // 3. Fluid Effect
    const { render: updateFluid, velocity } = useFluid({
        size: { width: window.innerWidth, height: window.innerHeight, top: 0, left: 0 },
        dpr: Math.min(window.devicePixelRatio, 2),
        pressureIterations: 20,
        forceBias: 3.0,
        radius: new THREE.Vector2(0.05, 0.05),
        dissipation: 0.98,
    });



    // Ref to track current visual progress
    const progressRef = useMemo(() => ({ value: 0 }), []);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        updateFluid(state, {
            radius: new THREE.Vector2(0.05, 0.05),
            forceBias: 3.0,
        });

        // Debug Log (Throttled)
        if (state.clock.elapsedTime % 1.0 < 0.05) {
            // console.log("Progress:", progressRef.value, "CurrentShape:", currentShape);
        }

        // Smooth Lerp to target shape
        const target = currentShape;
        const speed = 2.0 * state.clock.getDelta(); // Morph speed

        // If we are at 3 (Brain), and target is 0 (also Brain), we need to snap logic?
        // No, my sequence is 0, 1, 2. 
        // 0=Brain, 1=Sphere, 2=Helix. 
        // But I added a 4th pos (Brain) at index 3.
        // So valid states are 0, 1, 2.
        // If I go 2 -> 0, I should animate 2 -> 3.
        // Then once at 3, snap to 0.

        // Complex logic:
        // If currentShape represents the index in the 0..2 cycle.
        // If we want to go from 2 to 0, we aim for 3.

        let aim = target;
        // Logic to wrap around: If we are effectively at 2 and want 0, we aim for 3.
        if (progressRef.value > 2.5 && target === 0) {
            aim = 3;
        }

        // Interpolate
        const diff = aim - progressRef.value;
        if (Math.abs(diff) > 0.001) {
            progressRef.value += diff * speed;
        } else {
            // Reached target
            if (aim === 3) {
                progressRef.value = 0; // Snap back to true 0
            }
        }

        // Normalize for shader (0..1 across the whole set? No, uMorphProgress 0..1 maps to index 0..N-1)
        // Reference shader: "scaledProgress = uMorphProgress * (length-1)"
        // So if I pass uMorphProgress = 0.5 in a 4-item array:
        // Scaled = 0.5 * 3 = 1.5. Index 1 to 2. Correct.
        // So I just pass `progressRef.value / 3` (since length is 4, max index is 3)
        const shaderProgress = progressRef.value / 3;

        updateMorphParticles(state, {
            ...USER_CONFIG,
            morphProgress: shaderProgress,
            displacement: velocity,
            displacementIntensity: 4.0,
            displacementColorIntensity: 0.8,
        });

        // Scroll & Mouse Rotation
        if (points) {
            // Strictly SIDEWAYS rotation on scroll (Y-axis)
            points.rotation.y = window.scrollY * 0.002 + (time * 0.05);

            // Add simple mouse influence (Optional, subtle)
            const mouseX = (state.pointer.x * Math.PI) / 10;
            // Removed vertical tilt (rotation.x) to prevent "up and down" confusion
            points.rotation.y += mouseX * 0.5; // Only rotate sideways
        }
    });



    return (
        <>
            {points && <primitive object={points} frustumCulled={false} />}
        </>
    );
}

// --- CONSTELLATION SHADERS ---
const constellationVertexShader = `
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
    
    float baseSize = 2.0 + aRandom * 2.5; // REDUCED SIZE (was 4.0 + 5.0)
    // Reduce size near center (optional, nice for text visibility)
    float sizeAttenuation = 0.5 + 0.5 * smoothstep(0.0, 4.0, aDistanceFromCenter);
    gl_PointSize = baseSize * sizeAttenuation;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;
const constellationFragmentShader = `
  uniform float uTime;
  
  varying vec3 vPosition;
  varying float vRandom;
  varying float vDistanceFromCenter;
  
  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;
    
    float edgeFade = 1.0 - smoothstep(0.25, 0.5, dist);
    
    // Particle Color - BRIGHTER
    vec3 baseColor = vec3(0.6, 0.6, 0.65);
    
    // Opacity
    float baseAlpha = 0.35;
    float randomAlpha = vRandom * 0.2;
    float alpha = (baseAlpha + randomAlpha) * edgeFade;
    
    // Fade out near center
    float centerAlpha = smoothstep(0.0, 3.0, vDistanceFromCenter);
    alpha *= (0.4 + 0.6 * centerAlpha);
    
    gl_FragColor = vec4(baseColor, alpha);
  }
`;
const connVertexShader = `
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
    float cursorProximity = smoothstep(12.0, 0.0, cursorDist);
    
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
const connFragmentShader = `
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

function ConstellationGroup() {
    // Generate Geometry
    const { positions, distances, randoms, linePositions, lineIndices, signalPhases } = useMemo(() => {
        const particleCount = 800; // DOUBLE COUNT
        const positions = new Float32Array(particleCount * 3);
        const distances = new Float32Array(particleCount);
        const randoms = new Float32Array(particleCount);

        const width = 60; // Extra Wide
        const height = 40; // Extra Tall
        const depth = 120; // HUGE DEPTH (Tunnel)

        for (let i = 0; i < particleCount; i++) {
            // Rectangular distribution
            const x = (Math.random() - 0.5) * width;
            const y = (Math.random() - 0.5) * height;
            // Spread deep into the background (-100 to +20)
            const z = (Math.random() - 0.5) * depth - 40.0;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
            distances[i] = Math.sqrt(x * x + y * y);
            randoms[i] = Math.random();
        }

        // Connections
        const maxConnections = 1200; // 3x Connections
        const linePositions = new Float32Array(maxConnections * 2 * 3);
        const lineIndices = new Float32Array(maxConnections);
        const signalPhases = new Float32Array(maxConnections);

        let lineIndex = 0;
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
                if (dist < 5.0) neighbors.push({ idx: j, dist }); // Longer connections
            }
            neighbors.sort((a, b) => a.dist - b.dist);
            for (const neighbor of neighbors.slice(0, 3)) {
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

        return {
            positions, distances, randoms,
            linePositions: linePositions.slice(0, lineIndex * 6),
            lineIndices: lineIndices.slice(0, lineIndex),
            signalPhases: signalPhases.slice(0, lineIndex)
        };
    }, []);

    const pointsRef = useRef<THREE.Points>(null);
    const linesRef = useRef<THREE.LineSegments>(null);
    const cursorRef = useRef({ x: 0, y: 0 });
    const groupRef = useRef<THREE.Group>(null);


    // Uniforms
    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uCursorPosition: { value: new THREE.Vector2(0, 0) },
        uScrollVelocity: { value: 0 },
    }), []);

    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            // Map mouse to approx world space for shader
            const aspect = window.innerWidth / window.innerHeight;
            // At z=6, visible height is smaller, but let's approximate
            cursorRef.current.x = ((e.clientX / window.innerWidth) * 2 - 1) * 10 * aspect;
            cursorRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1) * 10;
        };
        const handleScroll = () => {
            // simplified velocity proxy
        };
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('scroll', handleScroll);
        }
    }, []);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        uniforms.uTime.value = time;
        // Smooth cursor
        uniforms.uCursorPosition.value.x += (cursorRef.current.x - uniforms.uCursorPosition.value.x) * 0.1;
        uniforms.uCursorPosition.value.y += (cursorRef.current.y - uniforms.uCursorPosition.value.y) * 0.1;

        // SCROLL ZOOM EFFECT
        // As we scroll down (scrollY increases), move the group +Z (forward)
        // Adjust the multiplier for speed
        if (groupRef.current) {
            const scrollZ = window.scrollY * 0.015;
            groupRef.current.position.z = scrollZ;

            // Optional: Subtle rotation of the whole universe
            groupRef.current.rotation.z = time * 0.02;
        }
    });

    return (
        <group ref={groupRef} renderOrder={-1}>
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} args={[positions, 3]} />
                    <bufferAttribute attach="attributes-aBasePosition" count={positions.length / 3} array={positions} itemSize={3} args={[positions, 3]} />
                    <bufferAttribute attach="attributes-aDistanceFromCenter" count={distances.length} array={distances} itemSize={1} args={[distances, 1]} />
                    <bufferAttribute attach="attributes-aRandom" count={randoms.length} array={randoms} itemSize={1} args={[randoms, 1]} />
                </bufferGeometry>
                <shaderMaterial
                    vertexShader={constellationVertexShader}
                    fragmentShader={constellationFragmentShader}
                    uniforms={uniforms}
                    transparent={true}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>
            <lineSegments ref={linesRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={linePositions.length / 3} array={linePositions} itemSize={3} args={[linePositions, 3]} />
                    <bufferAttribute attach="attributes-aLineIndex" count={lineIndices.length} array={lineIndices} itemSize={1} args={[lineIndices, 1]} />
                    <bufferAttribute attach="attributes-aSignalPhase" count={signalPhases.length} array={signalPhases} itemSize={1} args={[signalPhases, 1]} />
                </bufferGeometry>
                <shaderMaterial
                    vertexShader={connVertexShader}
                    fragmentShader={connFragmentShader}
                    uniforms={uniforms}
                    transparent={true}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </lineSegments>
        </group>
    );
}

interface NeuralMorphParticlesProps {
    enabled?: boolean;
}

export default function NeuralMorphParticles({ enabled = true }: NeuralMorphParticlesProps) {
    const [currentShape, setCurrentShape] = useState(0);

    // Click Handler (Global cycled)
    const nextShape = useCallback(() => {
        setCurrentShape(prev => {
            const next = (prev + 1) % 3;
            // console.log("Morphing to shape index:", next);
            return next;
        });
    }, []);

    useEffect(() => {
        window.addEventListener('click', nextShape);
        return () => window.removeEventListener('click', nextShape);
    }, [nextShape]);

    if (!enabled) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0, // Changed from 3 to 0 to sit behind DOM if needed, but above background
            }}
        >

            <Canvas
                camera={{ position: [0, 0, 6], fov: 60 }} // ZOOMED IN (was 14)
                dpr={Math.min(window.devicePixelRatio, 2)}
                gl={{ alpha: true, antialias: true }}
                eventSource={document.body}
                eventPrefix="page"
                style={{ pointerEvents: 'none' }}
            >
                {/* Background Constellation */}
                <ConstellationGroup />

                {/* Foreground Morphing Particles */}
                <MorphParticlesScene currentShape={currentShape} />
            </Canvas>
        </div>
    );
}
