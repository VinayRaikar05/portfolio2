import * as THREE from "three";
import { useMemo } from "react";
import { useResolution } from "./useResolution";
import { setUniform } from "./setUniforms";
import { vertexShader, fragmentShader } from "../shaders";
import { MORPHPARTICLES_PARAMS } from "..";

import { rewriteVertexShader } from "./rewriteVertexShader";
import { modifyAttributes } from "./modifyAttributes";
import { rewriteFragmentShader } from "./rewriteFragmentShader";
// import { createMaterialParameters } from "./createMaterialParameters";
import type { Size } from "../morphTypes";

export type MaterialProps = {
    /**
     * @param material
     * return `material`
     * @description
     * hook to intercept material creation.
     * You can customize the material by rewriting the vertex shader and fragment shader.
     */
    onBeforeInit?: (material: THREE.ShaderMaterial) => void;
};

// Simplify consts since we are inside app
const DEFAULT_TEXTURE = new THREE.Texture();
const MATERIAL_BASIC_PARAMS = {};
const ISDEV = import.meta.env ? import.meta.env.DEV : false;
// Re-import
import { createMaterialParameters } from "./createMaterialParameters";

export const useMaterial = ({
    size,
    dpr,
    geometry,
    positions,
    uvs,
    mapArray,
    onBeforeInit,
}: {
    size: Size;
    dpr: number | false;
    geometry: THREE.BufferGeometry;
    positions?: Float32Array[];
    uvs?: Float32Array[];
    mapArray?: THREE.Texture[];
} & MaterialProps) => {
    const modifiedPositions = useMemo(
        () => modifyAttributes(positions, geometry, "position", 3),
        [positions, geometry]
    );

    const modifiedUvs = useMemo(
        () => modifyAttributes(uvs, geometry, "uv", 2),
        [uvs, geometry]
    );

    const material = useMemo(() => {
        if (modifiedPositions.length !== modifiedUvs.length) {
            ISDEV &&
                console.log("use-shader-fx:positions and uvs are not matched");
        }

        // vertex
        const rewritedVertexShader = rewriteVertexShader(
            modifiedUvs,
            geometry,
            "uv",
            rewriteVertexShader(
                modifiedPositions,
                geometry,
                "position",
                vertexShader,
                3
            ),
            2
        );

        // fragment
        const { rewritedFragmentShader, mapArrayUniforms } =
            rewriteFragmentShader(mapArray, fragmentShader);

        const mat = new THREE.ShaderMaterial({
            ...createMaterialParameters(
                {
                    uniforms: {
                        uResolution: { value: new THREE.Vector2(0, 0) },
                        uMorphProgress: {
                            value: MORPHPARTICLES_PARAMS.morphProgress,
                        },
                        uBlurAlpha: { value: MORPHPARTICLES_PARAMS.blurAlpha },
                        uBlurRadius: { value: MORPHPARTICLES_PARAMS.blurRadius },
                        uPointSize: { value: MORPHPARTICLES_PARAMS.pointSize },
                        uPointAlpha: { value: MORPHPARTICLES_PARAMS.pointAlpha },
                        uPicture: { value: DEFAULT_TEXTURE },
                        uIsPicture: { value: false },
                        uAlphaPicture: { value: DEFAULT_TEXTURE },
                        uIsAlphaPicture: { value: false },
                        uColor0: { value: MORPHPARTICLES_PARAMS.color0 },
                        uColor1: { value: MORPHPARTICLES_PARAMS.color1 },
                        uColor2: { value: MORPHPARTICLES_PARAMS.color2 },
                        uColor3: { value: MORPHPARTICLES_PARAMS.color3 },
                        uMap: { value: DEFAULT_TEXTURE },
                        uIsMap: { value: false },
                        uAlphaMap: { value: DEFAULT_TEXTURE },
                        uIsAlphaMap: { value: false },
                        uTime: { value: 0 },
                        uWobblePositionFrequency: {
                            value: MORPHPARTICLES_PARAMS.wobblePositionFrequency,
                        },
                        uWobbleTimeFrequency: {
                            value: MORPHPARTICLES_PARAMS.wobbleTimeFrequency,
                        },
                        uWobbleStrength: {
                            value: MORPHPARTICLES_PARAMS.wobbleStrength,
                        },
                        uWarpPositionFrequency: {
                            value: MORPHPARTICLES_PARAMS.warpPositionFrequency,
                        },
                        uWarpTimeFrequency: {
                            value: MORPHPARTICLES_PARAMS.warpTimeFrequency,
                        },
                        uWarpStrength: { value: MORPHPARTICLES_PARAMS.warpStrength },
                        uDisplacement: { value: DEFAULT_TEXTURE },
                        uIsDisplacement: { value: false },
                        uDisplacementIntensity: {
                            value: MORPHPARTICLES_PARAMS.displacementIntensity,
                        },
                        uDisplacementColorIntensity: {
                            value: MORPHPARTICLES_PARAMS.displacementColorIntensity,
                        },
                        uSizeRandomIntensity: {
                            value: MORPHPARTICLES_PARAMS.sizeRandomIntensity,
                        },
                        uSizeRandomTimeFrequency: {
                            value: MORPHPARTICLES_PARAMS.sizeRandomTimeFrequency,
                        },
                        uSizeRandomMin: {
                            value: MORPHPARTICLES_PARAMS.sizeRandomMin,
                        },
                        uSizeRandomMax: {
                            value: MORPHPARTICLES_PARAMS.sizeRandomMax,
                        },
                        uDivergence: { value: MORPHPARTICLES_PARAMS.divergence },
                        uDivergencePoint: {
                            value: MORPHPARTICLES_PARAMS.divergencePoint,
                        },
                        ...mapArrayUniforms,
                    },
                    vertexShader: rewritedVertexShader,
                    fragmentShader: rewritedFragmentShader,
                },
                onBeforeInit
            ),
            ...MATERIAL_BASIC_PARAMS,
            blending: THREE.AdditiveBlending,
            // Must be transparent
            transparent: true,
            depthWrite: false, // Ensure depth write is false for transparent particles
        });

        return mat;
    }, [
        geometry,
        modifiedPositions,
        modifiedUvs,
        mapArray,
        onBeforeInit,
    ]);

    const resolution = useResolution(size, dpr);
    setUniform(material)("uResolution", resolution.clone());

    return { material, modifiedPositions, modifiedUvs };
};
