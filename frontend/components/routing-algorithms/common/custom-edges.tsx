'use client';

import React from 'react';
import { EdgeLabelRenderer, EdgeProps, getBezierPath, MarkerType } from 'reactflow';
import { SimulationEdgeData } from './types'; // Import specific data type
import { cn } from '@/lib/utils'; // Import cn

// Similar to the edge in topology-editor, but potentially with state for simulation
export function NetworkEdge({ 
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  data // Use SimulationEdgeData type
}: EdgeProps<SimulationEdgeData>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isHighlighted = data?.isHighlighted;

  return (
    <>
      {/* Use path directly, styled with cn like topology/custom-edges.tsx */}
      <path
        id={id}
        className={cn(
          'react-flow__edge-path', // Base class
          'fill-none transition-all duration-150 ease-in-out', // Base style
          isHighlighted
            ? 'stroke-primary stroke-[2.5px]' // Highlighted style
            : 'stroke-muted-foreground/70 stroke-[1.5px]' // Default style
        )}
        d={edgePath}
        // Define marker using the prop passed in (should be {type: MarkerType.ArrowClosed})
        markerEnd={markerEnd}
      />
      <EdgeLabelRenderer>
        {
          label && (
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: 'all',
              }}
              className={cn(
                "nodrag nopan bg-background/80 backdrop-blur-sm px-1 rounded text-[9px]",
                "border border-border/50 text-muted-foreground",
                isHighlighted && "!text-primary !border-primary/50"
              )}
            >
              {label} 
            </div>
          )
        }
      </EdgeLabelRenderer>
    </>
  );
}

export const edgeTypes = {
  networkEdge: NetworkEdge,
}; 