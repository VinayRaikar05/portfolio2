import { resolveIncludes } from "./resolveShaders";
// import * as THREE from "three";

// Using 'any' for the specialized types to avoid deep type dependency hell,
// but the structure matches the reference.
export const createMaterialParameters = (
    parameters: any,
    onBeforeInit?: (parameters: any) => void
) => {
    onBeforeInit && onBeforeInit(parameters);
    parameters.vertexShader = resolveIncludes(parameters.vertexShader);
    parameters.fragmentShader = resolveIncludes(parameters.fragmentShader);
    return parameters;
};
