/**
 * MotionVectorMap - Advanced motion vector system with ping-pong render targets
 * 
 * WHY: Creates fluid, paint-like distortion effects based on mouse movement.
 * Uses multi-resolution render targets for efficient velocity propagation.
 * 
 * Architecture:
 * 1. Paint pass: Render mouse + velocity to high-res target (1/4 screen)
 * 2. Blur pass: Downsample to low-res target (1/8 screen) for next frame
 * 3. Distortion pass: Apply to scene with blue noise jittering + RGB shift
 */
import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { useAnimation } from '../context/AnimationContext';
import { PingPongFramebuffer } from '../utils/PingPongFramebuffer';
import { generateBlueNoise, disposeBlueNoise } from '../utils/BlueNoiseGenerator';
import { paintVertexShader, paintFragmentShader } from '../shaders/paintShader';
import { blurVertexShader, blurFragmentShader } from '../shaders/blurShader';
import { distortionVertexShader, distortionFragmentShader } from '../shaders/distortionShader';

interface MotionVectorMapProps {
    enabled?: boolean;
    distortionStrength?: number;
}

export default function MotionVectorMap({
    enabled = true,
    distortionStrength = 1.0
}: MotionVectorMapProps) {
    const containerRef = useRef<HTMLCanvasElement | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.OrthographicCamera | null>(null);

    // Ping-pong framebuffers
    const highResPingPongRef = useRef<PingPongFramebuffer | null>(null);
    const lowResTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);

    // Materials
    const paintMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
    const blurMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
    const distortionMaterialRef = useRef<THREE.ShaderMaterial | null>(null);

    // Fullscreen quad
    const quadRef = useRef<THREE.Mesh | null>(null);

    // Mouse tracking
    const mouseRef = useRef({ x: 0, y: 0 });
    const prevMouseRef = useRef({ x: 0, y: 0 });
    const velocityRef = useRef({ x: 0, y: 0 });

    const rafRef = useRef<number>(0);
    const { uniformsRef } = useAnimation();

    const initRenderTargets = useCallback(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // High-res: 1/4 screen resolution
        const highResWidth = Math.floor(width / 4);
        const highResHeight = Math.floor(height / 4);

        // Low-res: 1/8 screen resolution
        const lowResWidth = Math.floor(width / 8);
        const lowResHeight = Math.floor(height / 8);

        // Create ping-pong framebuffers for high-res
        highResPingPongRef.current = new PingPongFramebuffer(highResWidth, highResHeight, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            type: THREE.HalfFloatType,
        });

        // Create low-res target
        lowResTargetRef.current = new THREE.WebGLRenderTarget(lowResWidth, lowResHeight, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            type: THREE.HalfFloatType,
        });
    }, []);

    const initScene = useCallback(() => {
        if (!containerRef.current) return;

        const width = window.innerWidth;
        const height = window.innerHeight;

        // Create renderer
        const renderer = new THREE.WebGLRenderer({
            canvas: containerRef.current,
            alpha: true,
            antialias: false,
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        rendererRef.current = renderer;

        // Create scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Create orthographic camera for fullscreen rendering
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        cameraRef.current = camera;

        // Initialize render targets
        initRenderTargets();

        // Generate blue noise texture
        const blueNoise = generateBlueNoise(64);

        // Create fullscreen quad geometry
        const geometry = new THREE.PlaneGeometry(2, 2);

        // Create paint material
        const paintMaterial = new THREE.ShaderMaterial({
            vertexShader: paintVertexShader,
            fragmentShader: paintFragmentShader,
            uniforms: {
                uMousePos: { value: [0, 0] },
                uMouseVelocity: { value: [0, 0] },
                uPreviousLowRes: { value: lowResTargetRef.current!.texture },
                uTime: { value: 0 },
                uDecay: { value: 0.95 },
                uResolution: { value: [width / 4, height / 4] },
            },
        });
        paintMaterialRef.current = paintMaterial;

        // Create blur material
        const blurMaterial = new THREE.ShaderMaterial({
            vertexShader: blurVertexShader,
            fragmentShader: blurFragmentShader,
            uniforms: {
                uTexture: { value: null },
                uResolution: { value: [width / 4, height / 4] },
            },
        });
        blurMaterialRef.current = blurMaterial;

        // Create distortion material
        const distortionMaterial = new THREE.ShaderMaterial({
            vertexShader: distortionVertexShader,
            fragmentShader: distortionFragmentShader,
            uniforms: {
                uScene: { value: null },
                uVelocityField: { value: null },
                uBlueNoise: { value: blueNoise },
                uResolution: { value: [width, height] },
                uTime: { value: 0 },
                uDistortionStrength: { value: distortionStrength },
                uThemeColor: { value: new THREE.Color(0x6366f1) }, // Indigo theme
            },
        });
        distortionMaterialRef.current = distortionMaterial;

        // Create fullscreen quad
        const quad = new THREE.Mesh(geometry, paintMaterial);
        quadRef.current = quad;
        scene.add(quad);
    }, [initRenderTargets, distortionStrength]);

    const animate = useCallback((time: number) => {
        if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
        if (!highResPingPongRef.current || !lowResTargetRef.current) return;
        if (!paintMaterialRef.current || !blurMaterialRef.current) return;
        if (!quadRef.current || !enabled) {
            rafRef.current = requestAnimationFrame(animate);
            return;
        }

        const timeSeconds = time * 0.001;

        // Calculate mouse velocity
        const dx = mouseRef.current.x - prevMouseRef.current.x;
        const dy = mouseRef.current.y - prevMouseRef.current.y;

        // Smooth velocity with decay
        velocityRef.current.x = velocityRef.current.x * 0.8 + dx * 0.2;
        velocityRef.current.y = velocityRef.current.y * 0.8 + dy * 0.2;

        prevMouseRef.current = { ...mouseRef.current };

        // Update paint material uniforms
        paintMaterialRef.current.uniforms.uMousePos.value = [
            mouseRef.current.x,
            mouseRef.current.y,
        ];
        paintMaterialRef.current.uniforms.uMouseVelocity.value = [
            velocityRef.current.x * 10, // Scale for visibility
            velocityRef.current.y * 10,
        ];
        paintMaterialRef.current.uniforms.uTime.value = timeSeconds;
        paintMaterialRef.current.uniforms.uPreviousLowRes.value = lowResTargetRef.current.texture;

        // PASS 1: Paint to high-res target
        quadRef.current.material = paintMaterialRef.current;
        rendererRef.current.setRenderTarget(highResPingPongRef.current.write());
        rendererRef.current.render(sceneRef.current, cameraRef.current);

        // Swap ping-pong buffers
        highResPingPongRef.current.swap();

        // PASS 2: Blur high-res to low-res
        blurMaterialRef.current.uniforms.uTexture.value = highResPingPongRef.current.read().texture;
        quadRef.current.material = blurMaterialRef.current;
        rendererRef.current.setRenderTarget(lowResTargetRef.current);
        rendererRef.current.render(sceneRef.current, cameraRef.current);

        // Reset render target
        rendererRef.current.setRenderTarget(null);

        // Store velocity field texture in uniforms for use by other components
        uniformsRef.current.uVelocityField = highResPingPongRef.current.read().texture;

        rafRef.current = requestAnimationFrame(animate);
    }, [enabled, uniformsRef]);

    useEffect(() => {
        // Create canvas element
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '1';
        canvas.style.opacity = '0'; // Hidden - only used for render targets
        document.body.appendChild(canvas);
        containerRef.current = canvas;

        initScene();

        const handleMouseMove = (e: MouseEvent) => {
            // Convert to normalized device coordinates [-1, 1]
            mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };

        const handleResize = () => {
            if (!rendererRef.current || !highResPingPongRef.current || !lowResTargetRef.current) return;

            const width = window.innerWidth;
            const height = window.innerHeight;

            rendererRef.current.setSize(width, height);

            // Resize render targets
            highResPingPongRef.current.setSize(
                Math.floor(width / 4),
                Math.floor(height / 4)
            );
            lowResTargetRef.current.setSize(
                Math.floor(width / 8),
                Math.floor(height / 8)
            );

            // Update material uniforms
            if (paintMaterialRef.current) {
                paintMaterialRef.current.uniforms.uResolution.value = [width / 4, height / 4];
            }
            if (blurMaterialRef.current) {
                blurMaterialRef.current.uniforms.uResolution.value = [width / 4, height / 4];
            }
            if (distortionMaterialRef.current) {
                distortionMaterialRef.current.uniforms.uResolution.value = [width, height];
            }
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('resize', handleResize);

        rafRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);

            if (containerRef.current && document.body.contains(containerRef.current)) {
                document.body.removeChild(containerRef.current);
            }

            if (rendererRef.current) {
                rendererRef.current.dispose();
            }
            if (highResPingPongRef.current) {
                highResPingPongRef.current.dispose();
            }
            if (lowResTargetRef.current) {
                lowResTargetRef.current.dispose();
            }
            if (paintMaterialRef.current) {
                paintMaterialRef.current.dispose();
            }
            if (blurMaterialRef.current) {
                blurMaterialRef.current.dispose();
            }
            if (distortionMaterialRef.current) {
                distortionMaterialRef.current.dispose();
            }

            disposeBlueNoise();
        };
    }, [initScene, animate]);

    // This component doesn't render anything visible - it only manages render targets
    return null;
}
