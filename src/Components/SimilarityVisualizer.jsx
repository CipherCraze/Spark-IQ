import { useEffect, useRef } from 'react';

export const SimilarityVisualizer = ({ score }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.4;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
    ctx.fill();

    // Draw score arc
    const startAngle = -0.5 * Math.PI;
    const endAngle = startAngle + (score / 100) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.lineWidth = 12;
    ctx.strokeStyle = score > 85 ? '#10b981' : score > 70 ? '#3b82f6' : '#ef4444';
    ctx.stroke();

    // Draw score text
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${score}%`, centerX, centerY);

    // Draw label
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Originality Score', centerX, centerY + 30);
  }, [score]);

  return (
    <div className="flex flex-col items-center">
      <canvas 
        ref={canvasRef} 
        width={200} 
        height={200}
        className="w-40 h-40"
      />
      <div className="mt-2 text-xs text-gray-400">
        {score < 70 && 'Consider adding more original content'}
        {score >= 70 && score < 85 && 'Good originality - could be stronger'}
        {score >= 85 && 'Excellent original work'}
      </div>
    </div>
  );
};