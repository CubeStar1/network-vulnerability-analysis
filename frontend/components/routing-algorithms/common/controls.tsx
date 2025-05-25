'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw, StepBack, StepForward, Plus, Trash2, Info } from "lucide-react";
import { SimulationNode } from './types'; // Assuming nodes have an id
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface SimulationControlsProps {
  nodes: SimulationNode[];
  isRunning: boolean;
  currentStep: number;
  totalSteps: number;
  startNodeId: string | null;
  onPlayPause: () => void;
  onReset: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onAddNode: (type: 'router' | 'switch') => void; // Example: Add router or switch
  onAddEdge: (source: string, target: string, weight: number) => void; // Needs UI for selection
  onClear: () => void;
  onSetStartNode: (nodeId: string) => void;
  onSpeedChange: (speed: number) => void; // Speed as interval in ms
}

export function SimulationControls({
  nodes,
  isRunning,
  currentStep,
  totalSteps,
  startNodeId,
  onPlayPause,
  onReset,
  onStepForward,
  onStepBackward,
  onAddNode,
  // onAddEdge, // Add edge UI needs more thought
  onClear,
  onSetStartNode,
  onSpeedChange
}: SimulationControlsProps) {

  const handleSpeedChange = (value: number[]) => {
    // Slider gives value from 0-100. Map to an interval (e.g., 2000ms to 100ms)
    const speed = 2000 - (value[0] * 19); // Adjust multiplier as needed
    onSpeedChange(speed);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-muted/50 rounded-md">
      {/* Node/Edge Controls */}
      <Button size="sm" variant="outline" onClick={() => onAddNode('router')}><Plus className="h-4 w-4 mr-1" /> Add Router</Button>
      <Button size="sm" variant="outline" onClick={() => onAddNode('switch')}><Plus className="h-4 w-4 mr-1" /> Add Switch</Button>
      {/* Add Edge Button/UI - Placeholder */}
      {/* <Button size="sm" variant="outline" onClick={() => {}}>Add Edge</Button> */}
      <div className="flex items-center gap-1">
        <Button size="sm" variant="destructive" onClick={onClear}><Trash2 className="h-4 w-4 mr-1" /> Clear</Button>
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button size="sm" variant="ghost" className="p-1 h-8 w-8">
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Use Delete or Backspace to remove selected nodes/edges</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Start Node Selection */}
      <div className="flex items-center gap-1.5">
          <Label htmlFor="start-node" className="text-sm">Start Node:</Label>
          <Select value={startNodeId ?? ''} onValueChange={onSetStartNode} disabled={isRunning || nodes.length === 0}>
            <SelectTrigger id="start-node" className="h-8 w-[100px] text-xs">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {nodes.map(node => (
                <SelectItem key={node.id} value={node.id} className="text-xs">
                  {node.data.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

      {/* Simulation Playback Controls */}
      <Button size="icon" variant="ghost" onClick={onStepBackward} disabled={isRunning || currentStep <= 0}>
        <StepBack className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="outline" onClick={onPlayPause} disabled={!startNodeId || totalSteps === 0}>
        {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <Button size="icon" variant="ghost" onClick={onStepForward} disabled={isRunning || currentStep >= totalSteps - 1}>
        <StepForward className="h-4 w-4" />
      </Button>
       <Button size="icon" variant="ghost" onClick={onReset} title="Reset Simulation">
        <RotateCcw className="h-4 w-4" />
      </Button>

      {/* Speed Control */}
      <div className="flex items-center gap-1.5 w-32">
        <Label htmlFor="speed-slider" className="text-sm">Speed:</Label>
        <Slider
            id="speed-slider"
            defaultValue={[50]} // Default speed (0-100)
            max={100}
            step={1}
            onValueChange={handleSpeedChange}
            className="flex-grow"
            disabled={isRunning}
        />
      </div>
       {/* Step Counter - Optional */}
       <div className="text-xs text-muted-foreground ml-auto">
         Step: {currentStep} / {totalSteps > 0 ? totalSteps -1 : 0}
       </div>
    </div>
  );
} 