/**
 * DistortionLayer - Visualizes motion vectors as fluid colored trails
 * 
 * WHY: Shows the velocity field directly as visible trails instead of trying
 * to distort a scene texture (which requires complex render target setup).
 */
import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { useAnimation } from '../context/AnimationContext';
import { generateBlueNoise } from '../utils/BlueNoiseGenerator';
import { debugVertexShader, debugFragmentShader } from '../shaders/debugShader';

interface DistortionLayerProps {
    enabled?: boolean;
    distortionStrength?: number;
}

export default function DistortionLayer({
    enabled = true,
    distortionStrength = 1.0
}: DistortionLayerProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
    const materialRef = useRef<THREE.ShaderMaterial | null>(null);
    const rafRef = useRef<number>(0);

    const { uniformsRef } = useAnimation();

    const initScene = useCallback(() => {
        if (!canvasRef.current) return;

        const width = window.innerWidth;
        const height = window.innerHeight;

        // Create renderer
        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            alpha: true,
            antialias: false,
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        rendererRef.current = renderer;

        // Create scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Create orthographic camera
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        cameraRef.current = camera;

        // Generate blue noise
        const blueNoise = generateBlueNoise(64);

        // Create velocity visualization material
        const material = new THREE.ShaderMaterial({
            vertexShader: velocityVisVertexShader,
            fragmentShader: velocityVisFragmentShader,
            uniforms: {
                uVelocityField: { value: null },
                uBlueNoise: { value: blueNoise },
                uResolution: { value: [width, height] },
                uTime: { value: 0 },
                uStrength: { value: distortionStrength * 2.0 }, // Boost visibility
                uThemeColor: { value: new THREE.Color(0x6366f1) }, // Indigo theme
            },
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        materialRef.current = material;

        // Create fullscreen quad
        const geometry = new THREE.PlaneGeometry(2, 2);
        const quad = new THREE.Mesh(geometry, material);
        scene.add(quad);
    }, [distortionStrength]);

    const animate = useCallback((time: number) => {
        if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
        if (!materialRef.current || !enabled) {
            rafRef.current = requestAnimationFrame(animate);
            return;
        }

        const timeSeconds = time * 0.001;

        // Update uniforms
        materialRef.current.uniforms.uTime.value = timeSeconds;

        // Get velocity field from context (set by MotionVectorMap)
        if (uniformsRef.current.uVelocityField) {
            materialRef.current.uniforms.uVelocityField.value = uniformsRef.current.uVelocityField;
        }

        // Render
        rendererRef.current.render(sceneRef.current, cameraRef.current);

        rafRef.current = requestAnimationFrame(animate);
    }, [enabled, uniformsRef]);

    useEffect(() => {
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '5'; // Above particles but below UI
        document.body.appendChild(canvas);
        canvasRef.current = canvas;

        initScene();

        const handleResize = () => {
            if (!rendererRef.current || !materialRef.current) return;

            const width = window.innerWidth;
            const height = window.innerHeight;

            rendererRef.current.setSize(width, height);
            materialRef.current.uniforms.uResolution.value = [width, height];
        };

        window.addEventListener('resize', handleResize);
        rafRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener('resize', handleResize);

            if (canvasRef.current && document.body.contains(canvasRef.current)) {
                document.body.removeChild(canvasRef.current);
            }

            if (rendererRef.current) {
                rendererRef.current.dispose();
            }
            if (materialRef.current) {
                materialRef.current.dispose();
            }
        };
    }, [initScene, animate]);

    return null;
}
