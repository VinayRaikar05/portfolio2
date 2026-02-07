import * as THREE from "three";

const ISDEV = import.meta.env ? import.meta.env.DEV : false;

export const rewriteVertexShader = (
    modifeidAttributes: Float32Array[],
    targetGeometry: THREE.BufferGeometry,
    targetAttibute: "position" | "uv",
    vertexShader: string,
    itemSize: number
) => {
    const vTargetName =
        targetAttibute === "position" ? "positionTarget" : "uvTarget";
    const vAttributeRewriteKey =
        targetAttibute === "position"
            ? "#usf <morphPositions>"
            : "#usf <morphUvs>";
    const vTransitionRewriteKey =
        targetAttibute === "position"
            ? "#usf <morphPositionTransition>"
            : "#usf <morphUvTransition>";


    if (modifeidAttributes.length > 0) {
        // Delete the position at initialization and add the position after normalization
        targetGeometry.deleteAttribute(targetAttibute);
        targetGeometry.setAttribute(
            targetAttibute,
            new THREE.BufferAttribute(modifeidAttributes[0], itemSize)
        );

        let stringToAddToMorphAttibutes = "";
        let stringToAddToMorphAttibutesList = "";

        modifeidAttributes.forEach((target, index) => {
            targetGeometry.setAttribute(
                `${vTargetName}${index}`,
                new THREE.BufferAttribute(target, itemSize)
            );
            stringToAddToMorphAttibutes += `attribute vec${itemSize} ${vTargetName}${index};\n`;
            if (index === 0) {
                stringToAddToMorphAttibutesList += `${vTargetName}${index}`;
            } else {
                stringToAddToMorphAttibutesList += `,${vTargetName}${index}`;
            }
        });

        vertexShader = vertexShader.replace(
            `${vAttributeRewriteKey}`,
            stringToAddToMorphAttibutes
        );
        // Generate robust mixing logic (If/Else) instead of dynamic array indexing
        let morphLogic = `
        {
            float scaledProgress = uMorphProgress * ${modifeidAttributes.length - 1}.;
            float progress = fract(scaledProgress);
            ${targetAttibute === "position" ? "newPosition" : "newUv"} = ${targetAttibute === "position" ? `${vTargetName}0` : `${vTargetName}0`}; // Default
        `;

        for (let i = 0; i < modifeidAttributes.length - 1; i++) {
            const condition = i === 0
                ? `if (scaledProgress < ${i + 1}.0)`
                : `else if (scaledProgress < ${i + 1}.0)`;

            morphLogic += `
            ${condition} {
                ${targetAttibute === "position" ? "newPosition" : "newUv"} = mix(${vTargetName}${i}, ${vTargetName}${i + 1}, progress);
            }`;
        }
        // Handle last edge case (exact max value)
        morphLogic += `
            else {
                ${targetAttibute === "position" ? "newPosition" : "newUv"} = mix(${vTargetName}${modifeidAttributes.length - 2}, ${vTargetName}${modifeidAttributes.length - 1}, 1.0);
            }
        }
        `;

        vertexShader = vertexShader.replace(
            `${vAttributeRewriteKey}`,
            stringToAddToMorphAttibutes
        );
        vertexShader = vertexShader.replace(
            `${vTransitionRewriteKey}`,
            morphLogic
        );
    } else {
        vertexShader = vertexShader.replace(`${vAttributeRewriteKey}`, "");
        vertexShader = vertexShader.replace(`${vTransitionRewriteKey}`, "");
        if (!targetGeometry?.attributes[targetAttibute]?.array) {
            ISDEV &&
                console.error(
                    `use-shader-fx:geometry.attributes.${targetAttibute}.array is not found`
                );
        }
    }

    return vertexShader;
};
