'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import Image from 'next/image';
import { SimulationNodeData } from './types'; // Import specific data type
import { cn } from '@/lib/utils'; // For conditional classes

// Similar to the node in topology-editor but simplified for routing simulation
// Could be extended to show distance, visited status etc. via data prop

const NetworkNodeComponent = ({ data, isConnectable }: NodeProps<SimulationNodeData>) => {
  const HOST_IMG_URL = '/host.jpg'; // Consider moving URLs to a config/constants file
  const SWITCH_IMG_URL = '/switch.png';

  const imageUrl = data.type === 'switch' ? SWITCH_IMG_URL : HOST_IMG_URL;
  const label = data.label || (data.type === 'switch' ? 'Switch' : 'Router');

  return (
    <div className={cn(
        "w-[60px] h-[70px] flex flex-col justify-center items-center", // Fixed size
        "bg-background border border-border rounded-lg p-1 text-center", // Adjusted padding
        "transition-all duration-150 ease-in-out",
        data.isCurrent && "border-blue-500 border-2 ring-2 ring-blue-300 scale-105 shadow-lg", // Adjusted current style
        data.visited && !data.isCurrent && "border-gray-400 bg-gray-100 opacity-70", // Adjusted visited style
     )}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-muted-foreground rounded-full -top-1"
      />
      {/* Use img tag like topology editor for potentially better consistency */}
      <img
          src={imageUrl}
          alt={label}
          className={cn(
            "w-[28px] h-[28px] object-contain mb-0.5", // Slightly smaller image
            data.visited && !data.isCurrent && "opacity-60"
          )}
      />
      <div className="text-[9px] font-medium leading-tight text-center max-w-full truncate">{label}</div>
      {/* Display distance */}
      {data.distance !== undefined && (
        <div className={cn(
            "text-[8px] font-semibold mt-0 px-1 rounded",
            data.distance === '∞' ? "text-muted-foreground/80" : "text-blue-700 bg-blue-100/80",
            data.isCurrent && "!text-white !bg-blue-500"
            )}>
            {data.distance}
        </div>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-muted-foreground rounded-full -bottom-1"
      />
      <Handle
        type="source"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-muted-foreground rounded-full -left-1"
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-muted-foreground rounded-full -right-1"
      />
    </div>
  );
};

export const NetworkNode = memo(NetworkNodeComponent);

export const nodeTypes = {
  networkNode: NetworkNode, // Changed type name for clarity
}; 