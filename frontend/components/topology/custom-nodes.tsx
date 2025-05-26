import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';
import { useSimulation } from '@/lib/contexts/simulation-context';

interface CustomNodeData {
  label: string;
  imageUrl: string;
}

export const NetworkNode = memo(({ id, data }: NodeProps<CustomNodeData>) => {
  const { 
    activeEffects, 
    designatedAttackerId, 
    identifiedAttackerInfo, 
    isAttackerActive, 
    selectedRunId, 
    latestRun 
  } = useSimulation();

  const isActive = activeEffects.nodes.has(id);
  const isDesignated = id === designatedAttackerId;
  
  const isConfirmedAttackerPostSim = identifiedAttackerInfo?.id === id;
  const isCurrentlyAttackingDuringSim = isDesignated && isAttackerActive; // Real-time attack event from h1

  // New flag: Attacker is considered 'detected' as soon as simulation starts and h1 is the target
  const isAttackerDetectedEarly = 
    isDesignated && 
    latestRun && 
    (latestRun.status === 'initiated' || latestRun.status === 'running');

  // Unified red highlight: if detected early OR confirmed post-sim
  const showRedHighlight = isAttackerDetectedEarly || isConfirmedAttackerPostSim;

  return (
    <div
      className={cn(
        'w-[60px] h-[60px] flex flex-col justify-center items-center',
        'bg-white border border-border rounded-lg p-1.5 text-center',
        'transition-all duration-300 ease-in-out',

        // Base active style (e.g., pinged), if not the red-highlighted attacker
        isActive && !showRedHighlight && [
          'ring-2 ring-primary ring-offset-2',
          'scale-110',
          'shadow-lg shadow-primary/20',
          'border-primary'
        ],

        // Unified Red Highlight for h1 (detected early or confirmed post-sim)
        showRedHighlight && [
          'border-red-600 border-2',
          'shadow-xl shadow-red-600/40',
          // Optional: Add a ring if it's also actively involved in an event or confirmed
          (isCurrentlyAttackingDuringSim || isConfirmedAttackerPostSim) && 'ring-2 ring-red-400 ring-offset-1'
        ],
        
        // Styling for h1 if it's also active (e.g., pinged) while being red-highlighted
        isActive && showRedHighlight && [
          'border-red-600 border-2', // Keep red border
          'ring-2 ring-red-400 ring-offset-1', // Ensure red ring for active events on attacker
          'scale-110', // Standard active scale
          'shadow-xl shadow-red-500/60' // Potentially stronger shadow if active
        ]
      )}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className={cn(
          '!bg-muted-foreground',
          'transition-colors duration-300',
          isActive && !showRedHighlight && '!bg-primary', // Blue for normal active
          showRedHighlight && '!bg-red-600' // Red for attacker handles
        )} 
      />
      <img
        src={data.imageUrl}
        alt={data.label}
        className={cn(
          'w-[30px] h-[30px] object-contain mb-0.5',
          'transition-transform duration-300',
          isActive && 'scale-110'
        )}
      />
      <div className={cn(
        'text-[8px] text-muted-foreground truncate w-full',
        'transition-colors duration-300',
        isActive && 'text-primary font-medium'
      )}>
        {data.label}
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className={cn(
          '!bg-muted-foreground',
          'transition-colors duration-300',
          isActive && !showRedHighlight && '!bg-primary', // Blue for normal active
          showRedHighlight && '!bg-red-600' // Red for attacker handles
        )} 
      />
      <Handle 
        type="source" 
        position={Position.Left} 
        id="l" 
        className={cn(
          '!bg-muted-foreground !top-1/2',
          'transition-colors duration-300',
          isActive && !showRedHighlight && '!bg-primary', // Blue for normal active
          showRedHighlight && '!bg-red-600' // Red for attacker handles
        )} 
      />
      <Handle 
        type="target" 
        position={Position.Right} 
        id="r" 
        className={cn(
          '!bg-muted-foreground !top-1/2',
          'transition-colors duration-300',
          isActive && !showRedHighlight && '!bg-primary', // Blue for normal active
          showRedHighlight && '!bg-red-600' // Red for attacker handles
        )} 
      />
    </div>
  );
});

NetworkNode.displayName = 'NetworkNode'; 