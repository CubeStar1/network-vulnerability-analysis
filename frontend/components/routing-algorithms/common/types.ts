import { Node, Edge } from 'reactflow';

// Base types used across different algorithm simulators

export interface SimulationNodeData {
  label: string;
  type: 'router' | 'switch'; // Define specific node types for routing
  // Add algorithm-specific state here, e.g.:
  distance?: number | string; // Can be Infinity represented as string or number
  visited?: boolean;
  isCurrent?: boolean;
}

export interface SimulationEdgeData {
  weight: number;
  isPath?: boolean;
  isVisited?: boolean;
  isHighlighted?: boolean;
  securityRisk?: number;
}

// Extend React Flow types with our custom data
export type SimulationNode = Node<SimulationNodeData>;
export type SimulationEdge = Edge<SimulationEdgeData>;

// Interface for the simulation state managed by each simulator component
export interface SimulationState<StepType> { // Make StepType generic
  nodes: SimulationNode[];
  edges: SimulationEdge[];
  steps: StepType[]; 
  currentStepIndex: number;
  isRunning: boolean;
  speed: number; // Interval speed in ms
  startNodeId: string | null;
  endNodeId: string | null; // Optional: for pathfinding visualization
  log: string[];
} 