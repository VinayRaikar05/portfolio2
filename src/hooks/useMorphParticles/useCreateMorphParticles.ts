import * as THREE from "three";
import type { RootState } from "@react-three/fiber";
import {
    type InteractiveMesh,
    type MorphParticlePoints,
    useCreateObject,
} from "./utils/useCreateObject";
import { useMaterial } from "./utils/useMaterial";
import type { MorphParticlesParams } from ".";
import {
    setUniform,
    type CustomParams,
    setCustomUniform,
} from "./utils/setUniforms";
import { useCallback, useMemo } from "react";
import type { Create3DHooksProps } from "./morphTypes";
import type { Dpr, Size } from "./morphTypes";

// Simple GetDpr since we don't need complex external file
const getDpr = (dpr: Dpr): { shader: number | false; fbo: number | false } => {
    if (typeof dpr === "number") {
        return { shader: dpr, fbo: dpr };
    }
    return {
        shader: (dpr && dpr.shader) || false,
        fbo: (dpr && dpr.fbo) || false,
    };
};

export type UseCreateMorphParticlesProps = {
    size: Size;
    dpr: Dpr;
    /** default : `THREE.SphereGeometry(1, 32, 32)` */
    geometry?: THREE.BufferGeometry;
    positions?: Float32Array[];
    uvs?: Float32Array[];
    /** Array of textures to map to points. Mapped at random. */
    mapArray?: THREE.Texture[];
};

type UpdateUniform = (
    rootState: RootState | null,
    newParams?: MorphParticlesParams,
    customParams?: CustomParams
) => void;

type UseCreateMorphParticlesReturn = [
    UpdateUniform,
    {
        points: MorphParticlePoints;
        interactiveMesh: InteractiveMesh;
        positions: Float32Array[];
        uvs: Float32Array[];
    }
];

export const useCreateMorphParticles = ({
    size,
    dpr,
    scene = false,
    geometry,
    positions,
    uvs,
    mapArray,
    onBeforeInit,
}: Create3DHooksProps &
    UseCreateMorphParticlesProps): UseCreateMorphParticlesReturn => {
    const _dpr = getDpr(dpr);

    const morphGeometry = useMemo(() => {
        const geo = geometry || new THREE.SphereGeometry(1, 32, 32);
        geo.setIndex(null);
        // Since it is a particle, normal is not necessary
        if (geo.attributes.normal) geo.deleteAttribute("normal");
        return geo;
    }, [geometry]);

    const { material, modifiedPositions, modifiedUvs } = useMaterial({
        size,
        dpr: _dpr.shader,
        geometry: morphGeometry,
        positions,
        uvs,
        mapArray,
        onBeforeInit,
    });

    const { points, interactiveMesh } = useCreateObject({
        scene,
        geometry: morphGeometry,
        material,
    });

    const updateValue = setUniform(material);
    const updateCustomValue = setCustomUniform(material);

    const updateUniform = useCallback<UpdateUniform>(
        (rootState, newParams, customParams) => {
            if (rootState) {
                updateValue(
                    "uTime",
                    newParams?.beat || rootState.clock.getElapsedTime()
                );
                // Mouse update (added custom from previous port)
                if (rootState.pointer) {
                    // We could set uMouse here if shader had it, but reference shader doesn't explicitly use uMouse in vertex/frag.
                    // However keeping it for potential custom extensions.
                }
            }
            if (newParams === undefined) {
                return;
            }
            updateValue("uMorphProgress", newParams.morphProgress);
            updateValue("uBlurAlpha", newParams.blurAlpha);
            updateValue("uBlurRadius", newParams.blurRadius);
            updateValue("uPointSize", newParams.pointSize);
            updateValue("uPointAlpha", newParams.pointAlpha);
            if (newParams.picture) {
                updateValue("uPicture", newParams.picture);
                updateValue("uIsPicture", true);
            } else if (newParams.picture === false) {
                updateValue("uIsPicture", false);
            }
            if (newParams.alphaPicture) {
                updateValue("uAlphaPicture", newParams.alphaPicture);
                updateValue("uIsAlphaPicture", true);
            } else if (newParams.alphaPicture === false) {
                updateValue("uIsAlphaPicture", false);
            }
            updateValue("uColor0", newParams.color0);
            updateValue("uColor1", newParams.color1);
            updateValue("uColor2", newParams.color2);
            updateValue("uColor3", newParams.color3);
            if (newParams.map) {
                updateValue("uMap", newParams.map);
                updateValue("uIsMap", true);
            } else if (newParams.map === false) {
                updateValue("uIsMap", false);
            }
            if (newParams.alphaMap) {
                updateValue("uAlphaMap", newParams.alphaMap);
                updateValue("uIsAlphaMap", true);
            } else if (newParams.alphaMap === false) {
                updateValue("uIsAlphaMap", false);
            }
            updateValue("uWobbleStrength", newParams.wobbleStrength);
            updateValue(
                "uWobblePositionFrequency",
                newParams.wobblePositionFrequency
            );
            updateValue("uWobbleTimeFrequency", newParams.wobbleTimeFrequency);
            updateValue("uWarpStrength", newParams.warpStrength);
            updateValue("uWarpPositionFrequency", newParams.warpPositionFrequency);
            updateValue("uWarpTimeFrequency", newParams.warpTimeFrequency);
            if (newParams.displacement) {
                updateValue("uDisplacement", newParams.displacement);
                updateValue("uIsDisplacement", true);
            } else if (newParams.displacement === false) {
                updateValue("uIsDisplacement", false);
            }
            updateValue("uDisplacementIntensity", newParams.displacementIntensity);
            updateValue(
                "uDisplacementColorIntensity",
                newParams.displacementColorIntensity
            );
            updateValue("uSizeRandomIntensity", newParams.sizeRandomIntensity);
            updateValue(
                "uSizeRandomTimeFrequency",
                newParams.sizeRandomTimeFrequency
            );
            updateValue("uSizeRandomMin", newParams.sizeRandomMin);
            updateValue("uSizeRandomMax", newParams.sizeRandomMax);
            updateValue("uDivergence", newParams.divergence);
            updateValue("uDivergencePoint", newParams.divergencePoint);

            updateCustomValue(customParams);
        },
        [updateValue, updateCustomValue]
    );

    return [
        updateUniform,
        {
            points,
            interactiveMesh,
            positions: modifiedPositions,
            uvs: modifiedUvs,
        },
    ];
};
