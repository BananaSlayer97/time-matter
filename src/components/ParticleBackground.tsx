import { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    opacity: number;
    hue: number;
}

export function ParticleBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const rafRef = useRef<number>(0);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const themeRef = useRef<'light' | 'dark'>('dark');

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false }); // Optimization: static background
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // Re-init count on large resize if needed, but keeping it simple for now
        };
        resize();
        window.addEventListener('resize', resize);

        // Update theme cache
        const updateTheme = () => {
            const isLight = document.documentElement.getAttribute('data-theme') === 'light' ||
                document.documentElement.getAttribute('data-theme') === 'dawn' ||
                document.documentElement.getAttribute('data-theme') === 'frost';
            themeRef.current = isLight ? 'light' : 'dark';
        };
        updateTheme();

        const observer = new MutationObserver(updateTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

        // Initialize particles
        const count = Math.min(60, Math.floor(window.innerWidth / 25)); // Slightly reduced density for performance
        particlesRef.current = Array.from({ length: count }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.2, // Slower for elegance
            vy: (Math.random() - 0.5) * 0.2,
            radius: Math.random() * 1.5 + 0.5,
            opacity: Math.random() * 0.4 + 0.1,
            hue: Math.random() * 60 + 30,
        }));

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousemove', handleMouseMove);

        const animate = () => {
            // Optimization: Fill with background color instead of clearRect for performance on some browsers
            // but clearRect is usually fine for transparent canvases. 
            // Since we use fixed background in CSS, clearRect is correct.
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const particles = particlesRef.current;
            const mouse = mouseRef.current;
            const isLight = themeRef.current === 'light';

            const len = particles.length;
            const connectDistSq = 120 * 120;
            const mouseDistSq = 200 * 200;

            for (let i = 0; i < len; i++) {
                const p = particles[i];

                // Mouse attraction (Squared distance check)
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < mouseDistSq) {
                    const dist = Math.sqrt(distSq); // Only sqrt if within range
                    const force = (200 - dist) * 0.00005;
                    p.vx += dx * force;
                    p.vy += dy * force;
                }

                // Damping
                p.vx *= 0.98;
                p.vy *= 0.98;

                p.x += p.vx;
                p.y += p.vy;

                // Wrap around
                if (p.x < 0) p.x = canvas.width;
                else if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                else if (p.y > canvas.height) p.y = 0;

                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                if (isLight) {
                    ctx.fillStyle = `hsla(${p.hue}, 50%, 40%, ${p.opacity * 0.5})`;
                } else {
                    ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.opacity})`;
                }
                ctx.fill();

                // Draw connections (Squared distance check)
                for (let j = i + 1; j < len; j++) {
                    const p2 = particles[j];
                    const cdx = p.x - p2.x;
                    const cdy = p.y - p2.y;
                    const cdistSq = cdx * cdx + cdy * cdy;

                    if (cdistSq < connectDistSq) {
                        const dist = Math.sqrt(cdistSq);
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        const lineAlpha = 0.08 * (1 - dist / 120);
                        if (isLight) {
                            ctx.strokeStyle = `hsla(40, 40%, 30%, ${lineAlpha * 0.4})`;
                        } else {
                            ctx.strokeStyle = `hsla(40, 60%, 60%, ${lineAlpha})`;
                        }
                        ctx.lineWidth = 0.4;
                        ctx.stroke();
                    }
                }
            }

            rafRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(rafRef.current);
            observer.disconnect();
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="particle-canvas"
            aria-hidden="true"
        />
    );
}
