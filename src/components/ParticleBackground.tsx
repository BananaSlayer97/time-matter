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

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Initialize particles
        const count = Math.min(80, Math.floor(window.innerWidth / 20));
        particlesRef.current = Array.from({ length: count }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            radius: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.5 + 0.1,
            hue: Math.random() * 60 + 30, // warm gold to amber range
        }));

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousemove', handleMouseMove);

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const particles = particlesRef.current;
            const mouse = mouseRef.current;

            const isLight = document.documentElement.getAttribute('data-theme') === 'light';

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Mouse attraction
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 200) {
                    const force = (200 - dist) / 200 * 0.01;
                    p.vx += dx * force;
                    p.vy += dy * force;
                }

                // Damping
                p.vx *= 0.99;
                p.vy *= 0.99;

                p.x += p.vx;
                p.y += p.vy;

                // Wrap around
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                if (isLight) {
                    ctx.fillStyle = `hsla(${p.hue}, 50%, 40%, ${p.opacity * 0.6})`;
                } else {
                    ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.opacity})`;
                }
                ctx.fill();

                // Draw connections
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const cdx = p.x - p2.x;
                    const cdy = p.y - p2.y;
                    const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
                    if (cdist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        const lineAlpha = 0.08 * (1 - cdist / 120);
                        if (isLight) {
                            ctx.strokeStyle = `hsla(40, 40%, 30%, ${lineAlpha * 0.5})`;
                        } else {
                            ctx.strokeStyle = `hsla(40, 60%, 60%, ${lineAlpha})`;
                        }
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            rafRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(rafRef.current);
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
