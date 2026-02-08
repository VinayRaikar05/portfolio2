import * as THREE from "three";
import { useEffect, useState } from "react";

export const useAddObject = (
    scene: THREE.Scene | false,
    geometry: THREE.BufferGeometry,
    material: THREE.ShaderMaterial,
    type: typeof THREE.Points | typeof THREE.Mesh
) => {
    const [object, setObject] = useState<THREE.Object3D>();

    useEffect(() => {
        // Explicitly handle constructor types to satisfy TypeScript constraints
        const obj = type === THREE.Points
            ? new THREE.Points(geometry, material)
            : new THREE.Mesh(geometry, material);
        setObject(obj);

        if (scene) {
            scene.add(obj);
        }

        return () => {
            if (scene) {
                scene.remove(obj);
            }
            obj.geometry.dispose();
            if (obj.material instanceof THREE.Material) {
                obj.material.dispose();
            }
        };
    }, [scene, geometry, material, type]);

    return object;
};
