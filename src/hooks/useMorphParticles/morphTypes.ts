import * as THREE from "three";

export type Dpr = number | { shader?: number; fbo?: number } | false;

export type Size = {
    width: number;
    height: number;
    pixelRatio?: number;
};

export type HooksReturn<T, O, C> = [
    (rootState: any, newParams?: T, customParams?: C) => void,
    (newParams?: T, customParams?: C) => void,
    O
];

export type Create3DHooksProps = {
    size: Size;
    dpr: Dpr;
    scene?: THREE.Scene | false;
    onBeforeInit?: (object: any) => void;
};

export type HooksProps3D = {
    size: Size;
    dpr: Dpr;
    isSizeUpdate?: boolean;
    renderTargetOptions?: any;
    camera?: THREE.Camera;
    onBeforeInit?: (object: any) => void;
};
