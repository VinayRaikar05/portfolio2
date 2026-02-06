import { ShaderChunk, type ShaderChunkTypes } from "./ShaderChunk";

const includePattern = /^[ \t]*#usf +<([\w\d./]+)>/gm;

function includeReplacer(_match: string, include: string): string {
    // Cast include to ShaderChunkTypes if possible, strict checking skipped for now
    return resolveIncludes(ShaderChunk[include as ShaderChunkTypes] || "");
}

export function resolveIncludes(string: string): string {
    return string.replace(includePattern, includeReplacer);
}
