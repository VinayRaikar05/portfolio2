/**
 * PingPongFramebuffer - Manages ping-pong rendering between two framebuffers
 * 
 * WHY: Ping-pong architecture enables temporal feedback loops where the output
 * of one frame becomes the input of the next, creating fluid, paint-like effects.
 */
import * as THREE from 'three';

export class PingPongFramebuffer {
    private targetA: THREE.WebGLRenderTarget;
    private targetB: THREE.WebGLRenderTarget;
    private current: 'A' | 'B' = 'A';

    constructor(width: number, height: number, options?: THREE.RenderTargetOptions) {
        const defaultOptions: THREE.RenderTargetOptions = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            type: THREE.HalfFloatType, // Use half-float for better precision with velocities
            ...options,
        };

        this.targetA = new THREE.WebGLRenderTarget(width, height, defaultOptions);
        this.targetB = new THREE.WebGLRenderTarget(width, height, defaultOptions);
    }

    /**
     * Get the current read target (source)
     */
    read(): THREE.WebGLRenderTarget {
        return this.current === 'A' ? this.targetA : this.targetB;
    }

    /**
     * Get the current write target (destination)
     */
    write(): THREE.WebGLRenderTarget {
        return this.current === 'A' ? this.targetB : this.targetA;
    }

    /**
     * Swap read and write targets
     */
    swap(): void {
        this.current = this.current === 'A' ? 'B' : 'A';
    }

    /**
     * Resize both targets
     */
    setSize(width: number, height: number): void {
        this.targetA.setSize(width, height);
        this.targetB.setSize(width, height);
    }

    /**
     * Dispose both targets
     */
    dispose(): void {
        this.targetA.dispose();
        this.targetB.dispose();
    }
}
