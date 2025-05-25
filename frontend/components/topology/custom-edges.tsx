import { memo } from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';
import { useSimulation } from '@/lib/contexts/simulation-context';
import { cn } from '@/lib/utils';

export const NetworkEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  animated = true,
}: EdgeProps & { animated?: boolean }) => {
  const { activeEffects } = useSimulation();
  const isActive = activeEffects.edges.has(id);

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      {/* Background glow for active state */}
      {isActive && (
        <path
          d={edgePath}
          className="react-flow__edge-path"
          strokeWidth={6}
          stroke="currentColor"
          strokeOpacity={0.2}
          filter="blur(2px)"
        />
      )}
      <path
        id={id}
        className={cn(
          'react-flow__edge-path',
          'transition-all duration-300 ease-in-out',
          isActive && [
            'stroke-primary',
            'stroke-[3]',
            'filter drop-shadow-[0_0_3px_rgba(var(--primary),.3)]'
          ]
        )}
        d={edgePath}
        strokeWidth={1.5}
        stroke="currentColor"
        markerEnd={markerEnd}
      />
      {/* Animated particle effect for active state */}
      {animated && isActive && (
        <circle
          r="3"
          fill="var(--primary)"
          className="animate-pulse"
        >
          <animateMotion
            dur="1.5s"
            repeatCount="indefinite"
            path={edgePath}
          />
        </circle>
      )}
    </>
  );
});

NetworkEdge.displayName = 'NetworkEdge'; 