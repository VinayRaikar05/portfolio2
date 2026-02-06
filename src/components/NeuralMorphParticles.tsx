import { Canvas, useFrame } from '@react-three/fiber';
import { useMorphParticles } from '../hooks/useMorphParticles';
import { useMemo } from 'react';
import * as THREE from 'three';

// Exact User Configuration
const USER_CONFIG = {
    blurAlpha: 0.9,
    blurRadius: 0.05,
    pointSize: 0.06, // Larger for more glow overlap
    pointAlpha: 1,
    color0: new THREE.Color(0xc7d2fe), // Very bright Indigo
    color1: new THREE.Color(0xe9d5ff), // Very bright Purple
    color2: new THREE.Color(0xa5f3fc), // Very bright Cyan
    color3: new THREE.Color(0xddd6fe), // Very bright Violet
    wobbleStrength: 0.3,
    wobblePositionFrequency: 0.5,
    wobbleTimeFrequency: 0.5,
    warpStrength: 0.2,
    warpPositionFrequency: 0.5,
    warpTimeFrequency: 0.5,
    displacementIntensity: 1,
    displacementColorIntensity: 0,
    sizeRandomIntensity: 0.5,
    sizeRandomTimeFrequency: 0.2,
    sizeRandomMin: 0.5,
    sizeRandomMax: 1.5,
    divergence: 0,
    divergencePoint: new THREE.Vector3(0, 0, 0),
};

function MorphParticlesScene() {

    // 1. Generate geometries for Morphing
    const { geometry, positions, uvs } = useMemo(() => {
        const particleCount = 5000; // More particles for brain shape

        // Initial State: Random Sphere Cloud
        const sphereGeo = new THREE.SphereGeometry(2, 64, 64);

        // Target State: Brain Shape
        const targetPositions = new Float32Array(particleCount * 3);

        let pIndex = 0;
        while (pIndex < particleCount) {
            // Random point in a box roughly size of brain
            const x = (Math.random() - 0.5) * 4;
            const y = (Math.random() - 0.5) * 3;
            const z = (Math.random() - 0.5) * 4;

            // Brain shape approximation: 2 ellipsoids for hemispheres
            const xAbs = Math.abs(x);
            const gap = 0.15; // Gap between hemispheres

            if (xAbs < gap) continue;

            // Ellipsoid equation: (x/a)^2 + (y/b)^2 + (z/c)^2 <= 1
            const a = 1.6;
            const b = 1.2;
            const c = 1.5;

            // Calculate distance from center of each hemisphere
            const dist = (Math.pow(xAbs - gap, 2) / (a * a)) + (Math.pow(y, 2) / (b * b)) + (Math.pow(z, 2) / (c * c));

            // Use "cortex" (outer layer) mainly, but some inside
            if (dist <= 1.0) {
                // Add some noise/wrinkles to make it look like brain folds
                const noise = Math.sin(x * 10) * Math.cos(y * 10) * Math.sin(z * 10) * 0.1;

                targetPositions[pIndex * 3] = x + (x > 0 ? noise : -noise);
                targetPositions[pIndex * 3 + 1] = y + noise;
                targetPositions[pIndex * 3 + 2] = z + noise;
                pIndex++;
            }
        }

        console.log('[NeuralMorphParticles] Generated brain particles:', pIndex);
        console.log('[NeuralMorphParticles] Target positions length:', targetPositions.length);

        // Generate matching UVs to avoid mismatch warning
        const targetUvs = new Float32Array(particleCount * 2);
        for (let i = 0; i < particleCount; i++) {
            targetUvs[i * 2] = Math.random();
            targetUvs[i * 2 + 1] = Math.random();
        }

        return {
            geometry: sphereGeo,
            positions: [targetPositions],
            uvs: [targetUvs],
        };
    }, []);

    // 2. Initialize Hook
    // FIXED: Array destructuring instead of object
    const [updateMorphParticles, , { points }] = useMorphParticles({
        size: { width: window.innerWidth, height: window.innerHeight },
        dpr: Math.min(window.devicePixelRatio, 2),
        geometry, // Use the sphere geometry as base
        positions, // Pass the brain positions as target
        uvs, // Pass the brain UVs
    });

    // 3. Animate Loop
    useFrame((state) => {
        const time = state.clock.getElapsedTime();

        // Animate morph progress back and forth
        // Slower morph for better effect
        const progress = (Math.sin(time * 0.4) + 1) * 0.5;

        updateMorphParticles(state, {
            ...USER_CONFIG,
            morphProgress: progress,
        });

        // Rotate slowly
        if (points) {
            points.rotation.y = time * 0.15;
        }
    });

    // Debug logging
    if (points && points.frustumCulled) {
        points.frustumCulled = false; // Ensure it's false
        console.log("Points ready:", points);
    }

    return (
        <>
            {points && <primitive object={points} frustumCulled={false} />}
        </>
    );
}

interface NeuralMorphParticlesProps {
    enabled?: boolean;
}

export default function NeuralMorphParticles({ enabled = true }: NeuralMorphParticlesProps) {
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
                zIndex: 3,
            }}
        >
            <Canvas
                camera={{ position: [0, 0, 5], fov: 60 }}
                dpr={Math.min(window.devicePixelRatio, 2)}
                gl={{ alpha: true, antialias: true }}
            >
                <MorphParticlesScene />
            </Canvas>
        </div>
    );
}
