import * as THREE from "three";
import { useCallback, useMemo } from "react";
import type { RootState } from "@react-three/fiber";
import {
    useCreateMorphParticles,
    type UseCreateMorphParticlesProps,
} from "./useCreateMorphParticles";
import type { HooksProps3D } from "./morphTypes";
import type { InteractiveMesh, MorphParticlePoints } from "./utils/useCreateObject";
import type { CustomParams } from "./utils/setUniforms";

export type MorphParticlesParams = {
    /** progress value to morph vertices,0~1 */
    morphProgress?: number;
    blurAlpha?: number;
    blurRadius?: number;
    pointSize?: number;
    /** default : `1` */
    pointAlpha?: number;
    /** Since the color is extracted based on the attribute `uv`, the intended behavior will not occur if there is no uv in the attribute. */
    picture?: THREE.Texture | false;
    /** The alpha map is a grayscale texture that controls the opacity across the surface (black: fully transparent; white: fully opaque). use the green channel when sampling this texture. It also affects the size of the point. default : `false` */
    alphaPicture?: THREE.Texture | false;
    color0?: THREE.Color;
    color1?: THREE.Color;
    color2?: THREE.Color;
    color3?: THREE.Color;
    /** This maps to point,texture */
    map?: THREE.Texture | false;
    /** The alpha map is a grayscale texture that controls the opacity across the surface (black: fully transparent; white: fully opaque). use the green channel when sampling this texture. default : `false` */
    alphaMap?: THREE.Texture | false;
    /** If ​​wobbleStrength is set to 0, wobble will stop. It will also affect noise calculation, default : `0` */
    wobbleStrength?: number;
    wobblePositionFrequency?: number;
    wobbleTimeFrequency?: number;
    /** default : `0` */
    warpStrength?: number;
    warpPositionFrequency?: number;
    warpTimeFrequency?: number;
    /** Manipulate the vertices using the color channels of this texture. The strength of the displacement changes depending on the g channel of this texture */
    displacement?: THREE.Texture | false;
    /** Strength of displacement. The strength of displacement depends on g ch, but is the value multiplied by it , default : `1` */
    displacementIntensity?: number;
    /** Strength to reflect color ch of displacement texture */
    displacementColorIntensity?: number;
    /** If set to 0, noise calculation stops, default : `0` */
    sizeRandomIntensity?: number;
    sizeRandomTimeFrequency?: number;
    sizeRandomMin?: number;
    sizeRandomMax?: number;
    /** Divergence rate of a point. Negative cases are dense, positive cases are divergent, default : `0` */
    divergence?: number;
    /** Divergence centre point, default : `THREE.Vector3(0)` */
    divergencePoint?: THREE.Vector3;
    /** you can get into the rhythm ♪ , default : `false` */
    beat?: number | false;
};

export type MorphParticlesObject = {
    scene: THREE.Scene;
    points: MorphParticlePoints;
    interactiveMesh: InteractiveMesh;
    //    renderTarget: THREE.WebGLRenderTarget; 
    //    output: THREE.Texture;
    positions: Float32Array[];
    uvs: Float32Array[];
};

export const MORPHPARTICLES_PARAMS: MorphParticlesParams = Object.freeze({
    morphProgress: 0,
    blurAlpha: 0.9,
    blurRadius: 0.05,
    pointSize: 0.05,
    pointAlpha: 1,
    picture: false,
    alphaPicture: false,
    color0: new THREE.Color(0xff0000),
    color1: new THREE.Color(0x00ff00),
    color2: new THREE.Color(0x0000ff),
    color3: new THREE.Color(0xffff00),
    map: false,
    alphaMap: false,
    wobbleStrength: 0.0,
    wobblePositionFrequency: 0.5,
    wobbleTimeFrequency: 0.5,
    warpStrength: 0.0,
    warpPositionFrequency: 0.5,
    warpTimeFrequency: 0.5,
    displacement: false,
    displacementIntensity: 1,
    displacementColorIntensity: 0,
    sizeRandomIntensity: 0,
    sizeRandomTimeFrequency: 0.2,
    sizeRandomMin: 0.5,
    sizeRandomMax: 1.5,
    divergence: 0,
    divergencePoint: new THREE.Vector3(0),
    beat: false,
});

// Mock hooks return type since I removed useSingleFBO
export type HooksReturn<P, O, C> = [
    (rootState: RootState, newParams?: P, customParams?: C) => void,
    (newParams?: P, customParams?: C) => void,
    O
];

export const useMorphParticles = ({
    size,
    // size, // Used
    dpr,
    // Unused in simplified port (no FBO)
    isSizeUpdate: _isSizeUpdate,
    renderTargetOptions: _renderTargetOptions,
    camera: _camera,
    geometry,
    positions,
    uvs,
    onBeforeInit,
}: HooksProps3D & UseCreateMorphParticlesProps): HooksReturn<
    MorphParticlesParams,
    MorphParticlesObject,
    CustomParams
> => {
    // Use Three context instead of useSingleFBO (simplified port assumption: direct render)
    // But original uses FBO. For our Neural Particle case, we just want particles in scene.
    // We skip FBO logic to save complexity, unless user wants output texture.
    // NeuralMorphParticles uses <primitive object={points} /> typically or just relies on scene.

    // const _rootState = useThree(); // Unused in this simplified version

    const scene = useMemo(() => new THREE.Scene(), []);

    const [
        updateUniform,
        {
            points,
            interactiveMesh,
            positions: generatedPositions,
            uvs: generatedUvs,
        },
    ] = useCreateMorphParticles({
        scene,
        size,
        dpr,
        geometry,
        positions,
        uvs,
        onBeforeInit,
    });

    // Simplified: We return updateFx that updates uniforms. We do NOT use FBO/RenderTarget logic here 
    // because standard usage in R3F is just adding meshes.
    // The reference uses "useSingleFBO" to render to texture.
    // If we skip that, we return standard objects.

    const updateFx = useCallback(
        (
            rootState: RootState, // This signature matches
            newParams?: MorphParticlesParams,
            customParams?: CustomParams
        ) => {
            updateUniform(rootState, newParams, customParams);
            // No renderTarget update
        },
        [updateUniform]
    );

    const updateParams = useCallback(
        (newParams?: MorphParticlesParams, customParams?: CustomParams) => {
            updateUniform(null, newParams, customParams);
        },
        [updateUniform]
    );

    return [
        updateFx,
        updateParams,
        {
            scene,
            points,
            interactiveMesh,
            positions: generatedPositions,
            uvs: generatedUvs,
        } as MorphParticlesObject,
    ];
};
