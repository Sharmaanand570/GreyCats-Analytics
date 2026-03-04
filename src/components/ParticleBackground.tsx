import React, { useEffect, useState } from 'react';

const ParticleBackground: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    let animationFrameId: number;
    let targetX = 50;
    let targetY = 50;
    
    // Smooth trailing effect using lerp
    let currentX = 50;
    let currentY = 50;

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate percentage based on viewport
      targetX = (e.clientX / window.innerWidth) * 100;
      targetY = (e.clientY / window.innerHeight) * 100;
      if (!isHovering) setIsHovering(true);
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      // Let it slowly drift back to center when mouse leaves
      targetX = 50;
      targetY = 50;
    };

    const animate = () => {
      // Linear interpolation (lerp) for smooth easing
      // The lower the multiplier (0.05), the slower/smoother the follow
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      setMousePosition({
        x: currentX,
        y: currentY
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    // Start animation loop
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isHovering]);

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000"
      style={{
        // Soft, dynamic radial gradient that shifts with the mouse
        // Uses Google's brand colors (subtle blue, red, yellow) blended across the screen
        background: `
          radial-gradient(
            circle at ${mousePosition.x}% ${mousePosition.y}%, 
            rgba(66, 133, 244, 0.08) 0%, 
            rgba(234, 67, 53, 0.03) 35%, 
            transparent 60%
          ),
          radial-gradient(
            circle at ${100 - mousePosition.x}% ${100 - mousePosition.y}%, 
            rgba(251, 188, 5, 0.05) 0%, 
            rgba(52, 168, 83, 0.02) 40%, 
            transparent 70%
          )
        `,
        opacity: isHovering ? 1 : 0.4 // Fade out slightly when mouse leaves window
      }}
    />
  );
};

export default ParticleBackground;
