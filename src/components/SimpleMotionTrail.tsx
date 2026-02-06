/**
 * Simple Motion Trail Effect
 * 
 * Creates visible colored trails that follow mouse movement.
 * No complex render targets - just direct canvas drawing.
 */
import { useEffect, useRef } from 'react';

interface SimpleMotionTrailProps {
    enabled?: boolean;
}

export default function SimpleMotionTrail({ enabled = true }: SimpleMotionTrailProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const prevMouseRef = useRef({ x: 0, y: 0 });
    const trailsRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number }>>([]);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        if (!enabled) return;

        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '5';
        document.body.appendChild(canvas);
        canvasRef.current = canvas;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const animate = () => {
            if (!ctx || !canvas) return;

            // Fade previous frame
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Calculate velocity
            const dx = mouseRef.current.x - prevMouseRef.current.x;
            const dy = mouseRef.current.y - prevMouseRef.current.y;
            const velocity = Math.sqrt(dx * dx + dy * dy);

            // Add new trail particles when mouse moves
            if (velocity > 1) {
                for (let i = 0; i < 3; i++) {
                    trailsRef.current.push({
                        x: mouseRef.current.x + (Math.random() - 0.5) * 20,
                        y: mouseRef.current.y + (Math.random() - 0.5) * 20,
                        vx: dx * 0.5,
                        vy: dy * 0.5,
                        life: 1.0,
                    });
                }
            }

            // Update and draw trails
            trailsRef.current = trailsRef.current.filter(trail => {
                trail.x += trail.vx;
                trail.y += trail.vy;
                trail.vx *= 0.95;
                trail.vy *= 0.95;
                trail.life -= 0.02;

                if (trail.life > 0) {
                    // Color based on velocity (indigo to purple)
                    const hue = 250 + velocity * 0.5;
                    const alpha = trail.life * 0.8;

                    ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(trail.x, trail.y, 3 + velocity * 0.1, 0, Math.PI * 2);
                    ctx.fill();

                    // Glow effect
                    ctx.fillStyle = `hsla(${hue}, 80%, 70%, ${alpha * 0.3})`;
                    ctx.beginPath();
                    ctx.arc(trail.x, trail.y, 8 + velocity * 0.2, 0, Math.PI * 2);
                    ctx.fill();

                    return true;
                }
                return false;
            });

            prevMouseRef.current = { ...mouseRef.current };
            rafRef.current = requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', resize);
        rafRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', resize);
            if (canvas && document.body.contains(canvas)) {
                document.body.removeChild(canvas);
            }
        };
    }, [enabled]);

    return null;
}
