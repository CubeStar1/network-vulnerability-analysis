'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  XYPosition,
  MarkerType,
  NodeChange,
  EdgeChange,
  OnNodesChange,
  OnEdgesChange,
  Controls,
  Background,
  ReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { SimulationControls } from '../common/controls';
import { SimulationNode, SimulationEdge, SimulationState, SimulationNodeData, SimulationEdgeData } from '../common/types';
import { runBellmanFord, BellmanFordStep } from './logic/bellman-ford';
import { toast } from "sonner"
import { nodeTypes } from '../common/custom-nodes';
import { edgeTypes } from '../common/custom-edges';
import { Button } from "@/components/ui/button";

// Comparison metrics interface
interface RoutingMetrics {
  totalDistance: number;
  totalSecurityRisk: number;
  hopCount: number;
  pathNodes: string[];
}

// Full Network Analysis Comparison Data Interface
interface ComparisonData {
  classicResults: Record<string, RoutingMetrics | null>; // nodeId -> metrics
  sarResults: Record<string, RoutingMetrics | null>; // nodeId -> metrics
  isComparisonMode: boolean;
  sourceNodeId: string | null;
}

const initialNodes: SimulationNode[] = [
  // Source and destination
  { id: 'A', type: 'networkNode', data: { label: 'A (Source)', type: 'router', distance: '∞', visited: false, isCurrent: false }, position: { x: 50, y: 200 } },
  { id: 'F', type: 'networkNode', data: { label: 'F (Target)', type: 'router', distance: '∞', visited: false, isCurrent: false }, position: { x: 650, y: 200 } },
  
  // Upper path (very secure but much longer)
  { id: 'B', type: 'networkNode', data: { label: 'B (Secure)', type: 'switch', distance: '∞', visited: false, isCurrent: false }, position: { x: 200, y: 80 } },
  { id: 'C', type: 'networkNode', data: { label: 'C (Secure)', type: 'switch', distance: '∞', visited: false, isCurrent: false }, position: { x: 350, y: 60 } },
  { id: 'D', type: 'networkNode', data: { label: 'D (Secure)', type: 'router', distance: '∞', visited: false, isCurrent: false }, position: { x: 500, y: 80 } },
  
  // Lower path (very risky but much shorter)
  { id: 'E', type: 'networkNode', data: { label: 'E (Risky)', type: 'switch', distance: '∞', visited: false, isCurrent: false }, position: { x: 350, y: 340 } },
  
  // Middle alternative (balanced)
  { id: 'G', type: 'networkNode', data: { label: 'G (Medium)', type: 'router', distance: '∞', visited: false, isCurrent: false }, position: { x: 350, y: 200 } },
];

const initialEdges: SimulationEdge[] = [
  // Upper secure path (much longer distances, very low security risk)
  { id: 'A-B', source: 'A', target: 'B', type: 'networkEdge', label: '8', data: { weight: 8, isHighlighted: false, securityRisk: 0.05 }, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'B-C', source: 'B', target: 'C', type: 'networkEdge', label: '7', data: { weight: 7, isHighlighted: false, securityRisk: 0.05 }, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'C-D', source: 'C', target: 'D', type: 'networkEdge', label: '6', data: { weight: 6, isHighlighted: false, securityRisk: 0.1 }, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'D-F', source: 'D', target: 'F', type: 'networkEdge', label: '8', data: { weight: 8, isHighlighted: false, securityRisk: 0.05 }, markerEnd: { type: MarkerType.ArrowClosed } },
  
  // Lower risky path (much shorter distances, very high security risk)
  { id: 'A-E', source: 'A', target: 'E', type: 'networkEdge', label: '3', data: { weight: 3, isHighlighted: false, securityRisk: 0.9 }, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'E-F', source: 'E', target: 'F', type: 'networkEdge', label: '2', data: { weight: 2, isHighlighted: false, securityRisk: 0.95 }, markerEnd: { type: MarkerType.ArrowClosed } },
  
  // Middle alternative path (balanced but not optimal for either)
  { id: 'A-G', source: 'A', target: 'G', type: 'networkEdge', label: '5', data: { weight: 5, isHighlighted: false, securityRisk: 0.4 }, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'G-F', source: 'G', target: 'F', type: 'networkEdge', label: '4', data: { weight: 4, isHighlighted: false, securityRisk: 0.5 }, markerEnd: { type: MarkerType.ArrowClosed } },
  
  // Cross connections for more routing complexity
  { id: 'B-G', source: 'B', target: 'G', type: 'networkEdge', label: '4', data: { weight: 4, isHighlighted: false, securityRisk: 0.2 }, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'G-D', source: 'G', target: 'D', type: 'networkEdge', label: '3', data: { weight: 3, isHighlighted: false, securityRisk: 0.3 }, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'C-E', source: 'C', target: 'E', type: 'networkEdge', label: '5', data: { weight: 5, isHighlighted: false, securityRisk: 0.7 }, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'G-E', source: 'G', target: 'E', type: 'networkEdge', label: '2', data: { weight: 2, isHighlighted: false, securityRisk: 0.6 }, markerEnd: { type: MarkerType.ArrowClosed } },
  
  // Additional paths to create more dramatic differences
  { id: 'B-E', source: 'B', target: 'E', type: 'networkEdge', label: '6', data: { weight: 6, isHighlighted: false, securityRisk: 0.8 }, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'D-E', source: 'D', target: 'E', type: 'networkEdge', label: '4', data: { weight: 4, isHighlighted: false, securityRisk: 0.75 }, markerEnd: { type: MarkerType.ArrowClosed } },
];

let idCounter = 2;
const getNodeId = (type: 'router' | 'switch') => `${type.charAt(0)}${++idCounter}`;

const initialSimulationState: SimulationState<BellmanFordStep> = {
  nodes: initialNodes,
  edges: initialEdges,
  steps: [],
  currentStepIndex: -1,
  isRunning: false,
  speed: 2000,
  startNodeId: null,
  endNodeId: null,
  log: [],
};

function BellmanFordSimulatorFlow() {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);
  const [simulationState, setSimulationState] = useState<SimulationState<BellmanFordStep>>(initialSimulationState);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [algorithmMode, setAlgorithmMode] = useState<'classic' | 'sar'>('classic');
  const [securityFactor, setSecurityFactor] = useState(0.5);
  const [isInteractive, setIsInteractive] = useState(true);
  
  // Edge creation modal state
  const [showEdgeModal, setShowEdgeModal] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
  const [edgeWeight, setEdgeWeight] = useState('1');
  const [edgeSecurityRisk, setEdgeSecurityRisk] = useState('low');

  // Security risk options
  const securityRiskOptions = [
    { value: 'low', label: 'Low Risk (0.1)', risk: 0.1, description: 'Secure, trusted connection', color: 'bg-green-100 text-green-800' },
    { value: 'medium-low', label: 'Medium-Low (0.3)', risk: 0.3, description: 'Generally safe with minor concerns', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'medium', label: 'Medium Risk (0.5)', risk: 0.5, description: 'Moderate security concerns', color: 'bg-orange-100 text-orange-800' },
    { value: 'medium-high', label: 'Medium-High (0.7)', risk: 0.7, description: 'Notable security issues', color: 'bg-red-100 text-red-700' },
    { value: 'high', label: 'High Risk (0.8)', risk: 0.8, description: 'Significant vulnerabilities', color: 'bg-red-200 text-red-800' },
    { value: 'critical', label: 'Critical Risk (0.9)', risk: 0.9, description: 'Severe security threats', color: 'bg-red-300 text-red-900' },
  ];

  // Updated comparison state for full network analysis
  const [comparisonData, setComparisonData] = useState<ComparisonData>({
    classicResults: {},
    sarResults: {},
    isComparisonMode: false,
    sourceNodeId: null,
  });

  // Calculate routing metrics from algorithm results
  const calculateRoutingMetrics = useCallback((
    steps: BellmanFordStep[],
    startNodeId: string,
    targetNodeId: string,
    alpha: number,
    beta: number
  ): RoutingMetrics | null => {
    if (steps.length === 0) return null;
    
    const finalStep = steps[steps.length - 1];
    const targetDistance = finalStep.distances[targetNodeId];
    
    if (targetDistance === Infinity) {
      return null; // No path found
    }
    
    // Build path from start to target
    const buildPath = (target: string): string[] => {
      const path: string[] = [];
      let current = target;
      
      while (current && current !== startNodeId) {
        path.unshift(current);
        current = finalStep.path[current] || '';
      }
      if (current === startNodeId) {
        path.unshift(startNodeId);
      }
      return path;
    };
    
    const pathNodes = buildPath(targetNodeId);
    const hopCount = pathNodes.length - 1;
    
    // Calculate total security risk along the path
    let totalSecurityRisk = 0;
    let totalDistance = 0;
    
    for (let i = 0; i < pathNodes.length - 1; i++) {
      const sourceNode = pathNodes[i];
      const targetNode = pathNodes[i + 1];
      
      // Find the edge between these nodes
      const edge = edges.find(e => 
        (e.source === sourceNode && e.target === targetNode) ||
        (e.source === targetNode && e.target === sourceNode)
      );
      
      if (edge) {
        const edgeData = edge.data as SimulationEdgeData;
        totalDistance += edgeData.weight || 0;
        totalSecurityRisk += edgeData.securityRisk || 0;
      }
    }
    
    return {
      totalDistance,
      totalSecurityRisk,
      hopCount,
      pathNodes,
    };
  }, [edges]);

  const onNodesChange: OnNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChangeInternal(changes);
  }, [onNodesChangeInternal]);

  const onEdgesChange: OnEdgesChange = useCallback((changes: EdgeChange[]) => {
    onEdgesChangeInternal(changes);
    if (changes.some(c => c.type === 'remove')) {
        handleReset();
    }
  }, [onEdgesChangeInternal]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setPendingConnection(connection);
      setEdgeWeight('1');
      setEdgeSecurityRisk('low');
      setShowEdgeModal(true);
    },
    []
  );

  const handleCreateEdge = useCallback(() => {
    if (!pendingConnection) return;
    
    const weight = parseInt(edgeWeight, 10);
    if (isNaN(weight) || weight <= 0) {
      toast.error("Invalid weight. Please enter a positive number.");
      return;
    }
    
    // Always use selected security risk for both modes
    const selectedRiskOption = securityRiskOptions.find(opt => opt.value === edgeSecurityRisk);
    const securityRisk = selectedRiskOption?.risk || 0.1;
    
    const newEdge: SimulationEdge = {
      id: `${pendingConnection.source}-${pendingConnection.target}-${Math.random().toString(16).slice(2)}`,
      source: pendingConnection.source!,
      target: pendingConnection.target!,
      type: 'networkEdge',
      label: weight.toString(),
      data: { weight: weight, isHighlighted: false, securityRisk: securityRisk },
      markerEnd: { type: MarkerType.ArrowClosed },
    };
    
    setEdges((eds) => addEdge(newEdge, eds));
    setShowEdgeModal(false);
    setPendingConnection(null);
    
    // Show toast with both weight and security risk for comparison
    toast.success(`Edge created: Weight ${weight}, ${selectedRiskOption?.label}${algorithmMode === 'classic' ? ' (risk ignored in Classic mode)' : ''}`);
  }, [pendingConnection, edgeWeight, edgeSecurityRisk, algorithmMode, securityRiskOptions, setEdges]);

  const handleCancelEdge = useCallback(() => {
    setShowEdgeModal(false);
    setPendingConnection(null);
  }, []);

  const handleAddNode = (type: 'router' | 'switch') => {
    const newNodeId = getNodeId(type);
    const position: XYPosition = {
      x: Math.random() * 400 + 50,
      y: Math.random() * 300 + 50,
    };
    const newNodeData: SimulationNodeData = {
        label: `${type === 'router' ? 'R' : 'S'}${idCounter}`,
        type: type,
        distance: '∞',
        visited: false,
        isCurrent: false,
    };
    const newNode: SimulationNode = {
      id: newNodeId,
      type: 'networkNode',
      position,
      data: newNodeData,
    };
    setNodes((nds) => nds.concat(newNode));
    if (handleReset) handleReset();
  };

  const handleClear = useCallback(() => {
    if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
    }
    setNodes(initialNodes);
    setEdges(initialEdges);
    setSimulationState(prev => ({ ...initialSimulationState, speed: prev.speed, nodes: initialNodes, edges: initialEdges }));
    setComparisonData({
      classicResults: {},
      sarResults: {},
      isComparisonMode: false,
      sourceNodeId: null,
    });
    idCounter = 2;
    toast.info("Graph cleared and reset to initial topology.");
  }, [setNodes, setEdges]);

  const handleReset = useCallback(() => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    setNodes(nds => nds.map(n => ({ ...n, data: { ...(n.data as SimulationNodeData), distance: '∞', visited: false, isCurrent: false }, className: '' })));
    setEdges(eds => eds.map(e => ({ ...e, data: { ...(e.data as SimulationEdgeData), isHighlighted: false }, animated: false, style: {} })));
    setSimulationState(prev => ({
        ...prev,
        steps: [],
        currentStepIndex: -1,
        isRunning: false,
        startNodeId: null,
        log: [],
    }));
  }, [setNodes, setEdges]);

  const applyStep = useCallback((step: BellmanFordStep) => {
    setNodes((nds) =>
      nds.map((node) => {
        const nodeData = node.data as SimulationNodeData;
        const distance = step.distances[node.id];
        const isCurrent = false; // Bellman-Ford doesn't have a "current" node concept
        const visited = distance !== Infinity && distance !== 0; // Mark as visited if distance is set
        return {
          ...node,
          data: {
            ...nodeData,
            distance: distance === Infinity ? '∞' : distance,
            visited: visited,
            isCurrent: isCurrent,
          },
          className: visited ? 'node-visited' : '',
        };
      })
    );
    setEdges((eds) =>
      eds.map((edge) => {
        const edgeData = edge.data as SimulationEdgeData;
        const isHighlighted = edge.id === step.highlightedEdgeId;
        return {
          ...edge,
          data: { ...edgeData, isHighlighted: isHighlighted, },
          animated: isHighlighted,
          style: { stroke: isHighlighted ? '#0ea5e9' : undefined, strokeWidth: isHighlighted ? 2.5 : 1.5 },
        };
      })
    );
    setSimulationState(prev => ({ ...prev, log: [step.message] }));
  }, [setNodes, setEdges]);

  const handleSetStartNode = useCallback((nodeId: string | null) => {
    handleReset();
    if (!nodeId) return;

    if (nodes.length > 0) {
        const currentNodes = nodes;
        const currentEdges = edges;
        const steps = runBellmanFord(
          currentNodes as SimulationNode[], 
          currentEdges as SimulationEdge[], 
          nodeId,
          algorithmMode === 'sar'
            ? { mode: 'sar', beta: securityFactor }
            : { mode: 'classic', beta: 0 }
        );
        if (steps.length > 0) {
            // Clear any existing visual state first
            setNodes(nds => nds.map(n => ({ 
              ...n, 
              data: { ...(n.data as SimulationNodeData), distance: '∞', visited: false, isCurrent: false }, 
              className: '' 
            })));
            setEdges(eds => eds.map(e => ({ 
              ...e, 
              data: { ...(e.data as SimulationEdgeData), isHighlighted: false }, 
              animated: false, 
              style: {} 
            })));
            
            setSimulationState(prev => ({
                ...prev,
                startNodeId: nodeId,
                steps: steps,
                currentStepIndex: -1, // Start at -1, no steps applied yet
                isRunning: false, // Ensure not running
                log: []
            }));
            toast.success(`Bellman-Ford initialized. Start node: ${nodeId}. Click play to begin.`);
        } else {
             toast.error("Failed to generate simulation steps.");
        }
    } else {
        toast.warning("Add nodes to the graph first.");
    }
  }, [nodes, edges, handleReset, algorithmMode, securityFactor, setNodes, setEdges]);

  const handleStepForward = useCallback(() => {
    setSimulationState((prev) => {
      if (prev.currentStepIndex >= prev.steps.length - 1) {
        if (simulationIntervalRef.current) {
          clearInterval(simulationIntervalRef.current);
          simulationIntervalRef.current = null;
        }
        toast.info("Simulation completed!");
        return { ...prev, isRunning: false };
      }
      const nextStepIndex = prev.currentStepIndex + 1;
      const nextStep = prev.steps[nextStepIndex];
      if (nextStep) {
        applyStep(nextStep);
      }
      return { ...prev, currentStepIndex: nextStepIndex };
    });
  }, [applyStep]);

  const handleStepBackward = useCallback(() => {
    setSimulationState((prev) => {
      // Always pause when stepping backward
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
      
      if (prev.currentStepIndex <= 0) {
        // Go back to initial state (before any steps)
        setNodes(nds => nds.map(n => ({ 
          ...n, 
          data: { ...(n.data as SimulationNodeData), distance: '∞', visited: false, isCurrent: false }, 
          className: '' 
        })));
        setEdges(eds => eds.map(e => ({ 
          ...e, 
          data: { ...(e.data as SimulationEdgeData), isHighlighted: false }, 
          animated: false, 
          style: {} 
        })));
        return { ...prev, currentStepIndex: -1, isRunning: false };
      }
      
      const prevStepIndex = prev.currentStepIndex - 1;
      const prevStep = prev.steps[prevStepIndex];
      if (prevStep) {
        applyStep(prevStep);
      }
      return { ...prev, currentStepIndex: prevStepIndex, isRunning: false };
    });
  }, [applyStep, setNodes, setEdges]);

  const handlePlayPause = useCallback(() => {
    setSimulationState(prev => {
        if (prev.isRunning) {
            // Pause
            if (simulationIntervalRef.current) {
              clearInterval(simulationIntervalRef.current);
              simulationIntervalRef.current = null;
            }
            return { ...prev, isRunning: false };
        } else {
            // Play
            if (!prev.startNodeId) {
                toast.error("Select a start node first.");
                return prev;
            }
            if (prev.currentStepIndex >= prev.steps.length - 1) {
                toast.info("Simulation finished. Reset to run again.");
                return prev;
            }
            
            // Clear any existing interval first
            if (simulationIntervalRef.current) {
              clearInterval(simulationIntervalRef.current);
              simulationIntervalRef.current = null;
            }
            
            // Create new interval with current speed
            simulationIntervalRef.current = setInterval(() => {
              handleStepForward();
            }, prev.speed);
            
            return { ...prev, isRunning: true };
        }
    });
  }, [handleStepForward]);

  const handleStepForwardManual = useCallback(() => {
    // Manual step forward should pause the simulation
    setSimulationState((prev) => {
      // Pause if running
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
      
      if (prev.currentStepIndex >= prev.steps.length - 1) {
        toast.info("Simulation completed!");
        return { ...prev, isRunning: false };
      }
      
      const nextStepIndex = prev.currentStepIndex + 1;
      const nextStep = prev.steps[nextStepIndex];
      if (nextStep) {
        applyStep(nextStep);
      }
      return { ...prev, currentStepIndex: nextStepIndex, isRunning: false };
    });
  }, [applyStep]);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSimulationState(prev => {
        const newState = { ...prev, speed: newSpeed };
        
        // If currently running, restart the interval with new speed
        if (prev.isRunning && simulationIntervalRef.current) {
            clearInterval(simulationIntervalRef.current);
            simulationIntervalRef.current = setInterval(() => {
              handleStepForward();
            }, newSpeed);
        }
        
        return newState;
    });
  }, [handleStepForward]);

  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    };
  }, []);

  const isFrozen = !isInteractive;

  // Full Network Analysis Function
  const runFullNetworkAnalysis = useCallback((startNodeId: string) => {
    if (!startNodeId) {
      toast.error("Please select a start node for network analysis.");
      return;
    }
    
    const currentNodes = nodes as SimulationNode[];
    const currentEdges = edges as SimulationEdge[];
    
    // Run Classic Bellman-Ford (β=0)
    const classicSteps = runBellmanFord(currentNodes, currentEdges, startNodeId, {
      mode: 'classic',
      beta: 0
    });
    
    // Run SAR Bellman-Ford (user-selected β)
    const sarSteps = runBellmanFord(currentNodes, currentEdges, startNodeId, {
      mode: 'sar',
      beta: securityFactor
    });
    
    // Calculate metrics for ALL destinations
    const allDestinations = currentNodes.filter(n => n.id !== startNodeId);
    const classicResults: Record<string, RoutingMetrics | null> = {};
    const sarResults: Record<string, RoutingMetrics | null> = {};
    
    allDestinations.forEach(node => {
      classicResults[node.id] = calculateRoutingMetrics(classicSteps, startNodeId, node.id, 1, 0);
      sarResults[node.id] = calculateRoutingMetrics(sarSteps, startNodeId, node.id, 1 - securityFactor, securityFactor);
    });
    
    // Update comparison state
    setComparisonData({
      classicResults,
      sarResults,
      isComparisonMode: true,
      sourceNodeId: startNodeId,
    });
    
    // Calculate summary statistics
    const reachableClassic = Object.values(classicResults).filter(r => r !== null).length;
    const reachableSAR = Object.values(sarResults).filter(r => r !== null).length;
    const totalDestinations = allDestinations.length;
    const routeChanges = Object.keys(classicResults).filter(nodeId => {
      const classic = classicResults[nodeId];
      const sar = sarResults[nodeId];
      return classic && sar && classic.pathNodes.join('→') !== sar.pathNodes.join('→');
    }).length;
    
    toast.success(`Network analysis complete! ${totalDestinations} destinations analyzed. Classic: ${reachableClassic} reachable, SAR: ${reachableSAR} reachable, ${routeChanges} route changes.`);
  }, [nodes, edges, securityFactor, calculateRoutingMetrics]);

  return (
      <div className="w-full h-full flex flex-col border rounded-lg overflow-hidden bg-card">
        {/* Algorithm Mode Controls */}
        <div className="p-3 border-b bg-muted/20">
          <div className="flex items-center justify-center gap-4">
            <label className="text-sm font-medium">
              Algorithm Mode:
              <select
                value={algorithmMode}
                onChange={e => setAlgorithmMode(e.target.value as 'classic' | 'sar')}
                className="ml-2 px-2 py-1 text-sm border rounded"
              >
                <option value="classic">Classic Bellman-Ford</option>
                <option value="sar">Security-Aware Routing (SAR)</option>
              </select>
            </label>
            {algorithmMode === 'sar' && (
              <label className="text-sm font-medium">
                Security Weight (β):
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.1}
                  value={securityFactor}
                  onChange={e => setSecurityFactor(Number(e.target.value))}
                  className="ml-2 w-16 px-2 py-1 text-sm border rounded"
                />
                <span className="ml-1 text-xs text-gray-500">
                  (α={((1 - securityFactor).toFixed(1))})
                </span>
              </label>
            )}
            
            {/* Full Network Analysis Button */}
            <Button 
              size="sm" 
              variant="default" 
              onClick={() => runFullNetworkAnalysis(simulationState.startNodeId!)} 
              disabled={!simulationState.startNodeId}
              className="bg-purple-600 hover:bg-purple-700"
            >
              ⚖️ Compare Algorithms
            </Button>
          </div>
        </div>

        <SimulationControls
          nodes={nodes as SimulationNode[]}
          isRunning={simulationState.isRunning}
          currentStep={simulationState.currentStepIndex}
          totalSteps={simulationState.steps.length}
          startNodeId={simulationState.startNodeId}
          onPlayPause={handlePlayPause}
          onReset={handleReset}
          onStepForward={handleStepForwardManual}
          onStepBackward={handleStepBackward}
          onAddNode={handleAddNode}
        onAddEdge={() => { toast.info("Connect nodes by dragging from handles.") }}
          onClear={handleClear}
          onSetStartNode={handleSetStartNode}
          onSpeedChange={handleSpeedChange}
        />
        
        {/* Main content area with grid layout */}
        <div className="grid grid-cols-3 gap-2 p-2 h-[480px]">
          {/* React Flow Canvas - spans 2 columns */}
          <div className="col-span-2 relative border rounded-lg overflow-hidden">
           <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={isFrozen ? undefined : onNodesChange}
              onEdgesChange={isFrozen ? undefined : onEdgesChange}
              onConnect={isFrozen ? undefined : onConnect}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              fitViewOptions={{ maxZoom: 0.9, minZoom: 0.7 }}
              defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
              deleteKeyCode={isFrozen ? [] : ['Backspace', 'Delete']}
              nodesDraggable={!isFrozen}
              nodesConnectable={!isFrozen}
              elementsSelectable={!isFrozen}
              edgesFocusable={!isFrozen}
              panOnDrag={!isFrozen}
              panOnScroll={!isFrozen}
              zoomOnScroll={!isFrozen}
              zoomOnPinch={!isFrozen}
              zoomOnDoubleClick={!isFrozen}
              className="bg-background"
            >
              <Controls onInteractiveChange={setIsInteractive} />
              <Background gap={16} />
            </ReactFlow>
          </div>

          {/* Logging section - spans 1 column */}
          <div className="col-span-1 flex flex-col border rounded-lg overflow-hidden bg-gray-50">
            {/* Step-by-step log */}
            <div className="h-[220px] p-3 border-b flex flex-col">
              <div className="text-sm font-semibold text-blue-800 mb-2">
                Step-by-step Log:
                {simulationState.steps.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-gray-600">
                    ({Math.max(0, simulationState.currentStepIndex + 1)}/{simulationState.steps.length})
                  </span>
                )}
              </div>
              <div className="flex-1 overflow-y-auto">
                {simulationState.steps.length > 0 ? (
                  simulationState.currentStepIndex >= 0 ? (
                    simulationState.steps
                      .slice(0, simulationState.currentStepIndex + 1)
                      .map((step, idx) => (
                      <div
                        key={idx}
                        className={`text-xs py-1 px-2 mb-1 rounded transition-colors ${
                          idx === simulationState.currentStepIndex
                            ? 'bg-blue-200 text-blue-800 font-medium border border-blue-300'
                            : idx < simulationState.currentStepIndex
                            ? 'bg-gray-100 text-gray-600'
                            : 'text-gray-400'
                        }`}
                      >
                        <span className="font-medium">Step {idx + 1}:</span> {step.message}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-500 italic py-1">
                      Ready to start simulation. Click play or step forward to begin...
                    </div>
                  )
                ) : (
                  <div className="text-xs text-gray-500 italic py-1">
                    Select a start node and begin simulation to see step-by-step progress...
                  </div>
                )}
              </div>
            </div>

            {/* Edge Relaxation Visualization (replaces Priority Queue for Bellman-Ford) */}
            <div className="h-[220px] p-3 flex flex-col">
              <div className="text-sm font-semibold text-orange-800 mb-2 flex items-center">
                <span>Edge Relaxation</span>
                <div className="ml-2 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {simulationState.steps.length > 0 && simulationState.currentStepIndex >= 0 ? (
                  <div className="space-y-1">
                    {/* Header */}
                    <div className="text-xs text-gray-500 font-medium mb-2 pb-1 border-b border-gray-300">
                      Current Iteration: {simulationState.steps[simulationState.currentStepIndex]?.iteration || 0}
                    </div>
                    
                    {/* Show current distances */}
                    {Object.entries(simulationState.steps[simulationState.currentStepIndex]?.distances || {})
                      .filter(([nodeId, distance]) => distance !== Infinity)
                      .sort(([, a], [, b]) => (a as number) - (b as number))
                      .map(([nodeId, distance], idx) => (
                        <div
                          key={nodeId}
                          className={`text-xs py-2 px-3 rounded-lg border transition-all duration-200 ${
                            simulationState.steps[simulationState.currentStepIndex]?.relaxedEdge?.includes(nodeId)
                              ? 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-900 font-bold border-orange-400 shadow-sm' 
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex items-center">
                              {simulationState.steps[simulationState.currentStepIndex]?.relaxedEdge?.includes(nodeId) && 
                                <span className="text-orange-600 mr-1">⚡</span>}
                              <span className="font-medium">{nodeId}</span>
                            </span>
                            <span className={`font-mono ${
                              simulationState.steps[simulationState.currentStepIndex]?.relaxedEdge?.includes(nodeId) 
                                ? 'text-orange-800' : 'text-gray-600'
                            }`}>
                              {(distance as number).toFixed(1)}
                            </span>
                          </div>
                          {simulationState.steps[simulationState.currentStepIndex]?.relaxedEdge?.includes(nodeId) && (
                            <div className="text-xs text-orange-700 mt-1 opacity-75">
                              Recently relaxed
                            </div>
                          )}
                        </div>
                      ))}
                    
                    {/* Show if negative cycle detected */}
                    {simulationState.steps[simulationState.currentStepIndex]?.isNegativeCycleDetected && (
                      <div className="text-xs text-red-600 italic py-3 text-center bg-red-100 rounded-lg border border-dashed border-red-300">
                        ⚠️ Negative cycle detected!
                      </div>
                    )}
                    
                    {/* Empty state */}
                    {Object.entries(simulationState.steps[simulationState.currentStepIndex]?.distances || {})
                      .filter(([nodeId, distance]) => distance !== Infinity).length === 0 && (
                      <div className="text-xs text-gray-500 italic py-3 text-center bg-gray-100 rounded-lg border border-dashed border-gray-300">
                        🔄 Relaxing edges...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 italic py-3 text-center">
                    Edge relaxation status will appear during simulation...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Routing Tables Section - Below main grid */}
        <div className="p-4 border-t bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="text-lg font-bold text-purple-800 mb-4 flex items-center">
            <span>📊 Routing Tables</span>
            <div className="ml-3 w-4 h-4 bg-purple-500 rounded-full animate-pulse"></div>
            {simulationState.startNodeId && (
              <span className="ml-4 text-sm font-normal text-gray-600">
                From source node: {simulationState.startNodeId}
              </span>
            )}
          </div>
          
          {simulationState.steps.length > 0 && simulationState.currentStepIndex >= 0 && simulationState.startNodeId ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Shortest Paths Table */}
              <div className="bg-white rounded-lg shadow-sm border border-purple-200 overflow-hidden">
                <div className="bg-purple-100 px-4 py-3 border-b border-purple-200">
                  <h3 className="text-sm font-semibold text-purple-800">Shortest Paths</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Destination</th>
                        <th className="px-4 py-2 text-center font-medium text-gray-700">Distance</th>
                        <th className="px-4 py-2 text-center font-medium text-gray-700">Status</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Complete Path</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Object.entries(simulationState.steps[simulationState.currentStepIndex]?.distances || {})
                        .filter(([nodeId, distance]) => 
                          nodeId !== simulationState.startNodeId && distance !== Infinity
                        )
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([nodeId, distance]) => {
                          // Build path from start to this node
                          const buildPath = (targetId: string): string[] => {
                            const path: string[] = [];
                            let current = targetId;
                            const currentStep = simulationState.steps[simulationState.currentStepIndex];
                            
                            while (current && current !== simulationState.startNodeId) {
                              path.unshift(current);
                              current = currentStep?.path[current] || '';
                            }
                            if (current === simulationState.startNodeId) {
                              path.unshift(simulationState.startNodeId!);
                            }
                            return path;
                          };
                          
                          const fullPath = buildPath(nodeId);
                          const isCompleted = distance !== Infinity;
                          
                          return (
                            <tr key={nodeId} className={`hover:bg-gray-50 ${isCompleted ? 'bg-purple-50' : ''}`}>
                              <td className="px-4 py-3">
                                <span className="font-medium text-gray-900">{nodeId}</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                  {(distance as number).toFixed(1)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {isCompleted ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    ✓ Computed
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    ⏳ Processing
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm text-gray-600 font-mono">
                                  {fullPath.join(' → ')}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                  {Object.entries(simulationState.steps[simulationState.currentStepIndex]?.distances || {})
                    .filter(([nodeId, distance]) => 
                      nodeId !== simulationState.startNodeId && distance !== Infinity
                    ).length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      <div className="text-4xl mb-2">🔍</div>
                      <div className="text-sm">No routes discovered yet...</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Next Hop Table */}
              <div className="bg-white rounded-lg shadow-sm border border-purple-200 overflow-hidden">
                <div className="bg-purple-100 px-4 py-3 border-b border-purple-200">
                  <h3 className="text-sm font-semibold text-purple-800">Next Hop Routing</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Destination</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Next Hop</th>
                        <th className="px-4 py-2 text-center font-medium text-gray-700">Metric</th>
                        <th className="px-4 py-2 text-center font-medium text-gray-700">Hops</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Object.entries(simulationState.steps[simulationState.currentStepIndex]?.distances || {})
                        .filter(([nodeId, distance]) => 
                          nodeId !== simulationState.startNodeId && distance !== Infinity
                        )
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([nodeId, distance]) => {
                          // Build path from start to this node
                          const buildPath = (targetId: string): string[] => {
                            const path: string[] = [];
                            let current = targetId;
                            const currentStep = simulationState.steps[simulationState.currentStepIndex];
                            
                            while (current && current !== simulationState.startNodeId) {
                              path.unshift(current);
                              current = currentStep?.path[current] || '';
                            }
                            if (current === simulationState.startNodeId) {
                              path.unshift(simulationState.startNodeId!);
                            }
                            return path;
                          };
                          
                          const fullPath = buildPath(nodeId);
                          const nextHop = fullPath.length > 1 ? fullPath[1] : nodeId;
                          const hopCount = fullPath.length - 1;
                          const isCompleted = distance !== Infinity;
                          
                          return (
                            <tr key={nodeId} className={`hover:bg-gray-50 ${isCompleted ? 'bg-purple-50' : ''}`}>
                              <td className="px-4 py-3">
                                <span className="font-medium text-gray-900">{nodeId}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium">
                                  {nextHop}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="font-mono text-sm">
                                  {(distance as number).toFixed(1)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="text-sm text-gray-600">
                                  {hopCount}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                  {Object.entries(simulationState.steps[simulationState.currentStepIndex]?.distances || {})
                    .filter(([nodeId, distance]) => 
                      nodeId !== simulationState.startNodeId && distance !== Infinity
                    ).length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      <div className="text-4xl mb-2">📋</div>
                      <div className="text-sm">Routing table will populate as routes are discovered...</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <div className="text-2xl mb-2">🗺️</div>
              <div className="text-sm font-medium mb-1">Routing Tables</div>
              <div className="text-xs text-gray-400">
                Select a start node and begin simulation to view routing information
              </div>
            </div>
          )}
        </div>

        {/* Full Network Comparison Results Section */}
        {comparisonData.isComparisonMode && Object.keys(comparisonData.classicResults).length > 0 && (
          <div className="p-4 border-t bg-gradient-to-r from-blue-50 to-green-50">
            <div className="text-lg font-bold text-blue-800 mb-4 flex items-center">
              <span>🌐 Full Network Analysis Results</span>
              <div className="ml-3 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
              {comparisonData.sourceNodeId && (
                <span className="ml-4 text-sm font-normal text-gray-600">
                  Source: {comparisonData.sourceNodeId} → All Destinations | Security Weight (β): {securityFactor.toFixed(1)}
                </span>
              )}
            </div>
            
            {/* Enhanced Network Summary Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-4">
                <div className="text-sm font-semibold text-blue-800">Total Destinations</div>
                <div className="text-2xl font-bold text-blue-600">
                  {Object.keys(comparisonData.classicResults).length}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-green-200 p-4">
                <div className="text-sm font-semibold text-green-800">Classic Reachable</div>
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(comparisonData.classicResults).filter(r => r !== null).length}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-4">
                <div className="text-sm font-semibold text-purple-800">SAR Reachable</div>
                <div className="text-2xl font-bold text-purple-600">
                  {Object.values(comparisonData.sarResults).filter(r => r !== null).length}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-orange-200 p-4">
                <div className="text-sm font-semibold text-orange-800">Route Changes</div>
                <div className="text-2xl font-bold text-orange-600">
                  {Object.keys(comparisonData.classicResults).filter(nodeId => {
                    const classic = comparisonData.classicResults[nodeId];
                    const sar = comparisonData.sarResults[nodeId];
                    return classic && sar && classic.pathNodes.join('→') !== sar.pathNodes.join('→');
                  }).length}
                </div>
              </div>

              {/* Security Improvement Metric */}
              <div className="bg-white rounded-lg shadow-sm border border-emerald-200 p-4">
                <div className="text-sm font-semibold text-emerald-800">Avg Risk Reduction</div>
                <div className="text-2xl font-bold text-emerald-600">
                  {(() => {
                    const validPairs = Object.keys(comparisonData.classicResults).filter(nodeId => {
                      const classic = comparisonData.classicResults[nodeId];
                      const sar = comparisonData.sarResults[nodeId];
                      return classic && sar;
                    });
                    
                    if (validPairs.length === 0) return "0%";
                    
                    const totalReduction = validPairs.reduce((sum, nodeId) => {
                      const classic = comparisonData.classicResults[nodeId]!;
                      const sar = comparisonData.sarResults[nodeId]!;
                      const reduction = ((classic.totalSecurityRisk - sar.totalSecurityRisk) / classic.totalSecurityRisk) * 100;
                      return sum + reduction;
                    }, 0);
                    
                    const avgReduction = totalReduction / validPairs.length;
                    return `${avgReduction > 0 ? '+' : ''}${avgReduction.toFixed(1)}%`;
                  })()}
                </div>
              </div>

              {/* Distance Trade-off Metric */}
              <div className="bg-white rounded-lg shadow-sm border border-amber-200 p-4">
                <div className="text-sm font-semibold text-amber-800">Avg Distance Cost</div>
                <div className="text-2xl font-bold text-amber-600">
                  {(() => {
                    const validPairs = Object.keys(comparisonData.classicResults).filter(nodeId => {
                      const classic = comparisonData.classicResults[nodeId];
                      const sar = comparisonData.sarResults[nodeId];
                      return classic && sar;
                    });
                    
                    if (validPairs.length === 0) return "0%";
                    
                    const totalIncrease = validPairs.reduce((sum, nodeId) => {
                      const classic = comparisonData.classicResults[nodeId]!;
                      const sar = comparisonData.sarResults[nodeId]!;
                      const increase = ((sar.totalDistance - classic.totalDistance) / classic.totalDistance) * 100;
                      return sum + increase;
                    }, 0);
                    
                    const avgIncrease = totalIncrease / validPairs.length;
                    return `${avgIncrease > 0 ? '+' : ''}${avgIncrease.toFixed(1)}%`;
                  })()}
                </div>
              </div>
            </div>

            {/* Algorithm Performance Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Algorithm Performance Summary</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Classic Bellman-Ford Summary */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                    Classic Bellman-Ford (β=0)
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Distance:</span>
                      <span className="font-mono font-medium">
                        {Object.values(comparisonData.classicResults)
                          .filter(r => r !== null)
                          .reduce((sum, r) => sum + r!.totalDistance, 0)
                          .toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Security Risk:</span>
                      <span className="font-mono font-medium text-red-600">
                        {Object.values(comparisonData.classicResults)
                          .filter(r => r !== null)
                          .reduce((sum, r) => sum + r!.totalSecurityRisk, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Risk per Route:</span>
                      <span className="font-mono font-medium text-red-600">
                        {(() => {
                          const validRoutes = Object.values(comparisonData.classicResults).filter(r => r !== null);
                          if (validRoutes.length === 0) return "0.00";
                          const avgRisk = validRoutes.reduce((sum, r) => sum + r!.totalSecurityRisk, 0) / validRoutes.length;
                          return avgRisk.toFixed(2);
                        })()}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-blue-300">
                      <span className="text-blue-700 font-medium">✓ Optimal distance-based routing</span>
                    </div>
                  </div>
                </div>

                {/* SAR Summary */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    Security-Aware Routing (β={securityFactor.toFixed(1)})
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Distance:</span>
                      <span className="font-mono font-medium">
                        {Object.values(comparisonData.sarResults)
                          .filter(r => r !== null)
                          .reduce((sum, r) => sum + r!.totalDistance, 0)
                          .toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Security Risk:</span>
                      <span className="font-mono font-medium text-green-600">
                        {Object.values(comparisonData.sarResults)
                          .filter(r => r !== null)
                          .reduce((sum, r) => sum + r!.totalSecurityRisk, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Risk per Route:</span>
                      <span className="font-mono font-medium text-green-600">
                        {(() => {
                          const validRoutes = Object.values(comparisonData.sarResults).filter(r => r !== null);
                          if (validRoutes.length === 0) return "0.00";
                          const avgRisk = validRoutes.reduce((sum, r) => sum + r!.totalSecurityRisk, 0) / validRoutes.length;
                          return avgRisk.toFixed(2);
                        })()}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-green-300">
                      <span className="text-green-700 font-medium">🛡️ Security-optimized routing</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overall Recommendation */}
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">📊 Network Security Analysis</h4>
                <div className="text-sm text-purple-700">
                  {(() => {
                    const classicTotalRisk = Object.values(comparisonData.classicResults)
                      .filter(r => r !== null)
                      .reduce((sum, r) => sum + r!.totalSecurityRisk, 0);
                    
                    const sarTotalRisk = Object.values(comparisonData.sarResults)
                      .filter(r => r !== null)
                      .reduce((sum, r) => sum + r!.totalSecurityRisk, 0);
                    
                    const classicTotalDistance = Object.values(comparisonData.classicResults)
                      .filter(r => r !== null)
                      .reduce((sum, r) => sum + r!.totalDistance, 0);
                    
                    const sarTotalDistance = Object.values(comparisonData.sarResults)
                      .filter(r => r !== null)
                      .reduce((sum, r) => sum + r!.totalDistance, 0);
                    
                    const riskReduction = ((classicTotalRisk - sarTotalRisk) / classicTotalRisk) * 100;
                    const distanceIncrease = ((sarTotalDistance - classicTotalDistance) / classicTotalDistance) * 100;
                    
                    if (riskReduction > 10) {
                      return `🎯 SAR provides significant security improvement (${riskReduction.toFixed(1)}% risk reduction) with ${distanceIncrease.toFixed(1)}% distance trade-off. Recommended for security-critical networks.`;
                    } else if (riskReduction > 0) {
                      return `⚖️ SAR offers moderate security improvement (${riskReduction.toFixed(1)}% risk reduction) with ${distanceIncrease.toFixed(1)}% distance cost. Consider based on security requirements.`;
                    } else {
                      return `⚠️ SAR shows minimal security benefit in this topology. Classic Bellman-Ford may be sufficient for performance-focused scenarios.`;
                    }
                  })()}
                </div>
              </div>
            </div>

            {/* Enhanced Full Network Routing Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800">📋 Detailed Route Comparison Analysis</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Destination</th>
                      <th className="px-4 py-2 text-center font-medium text-blue-700">Classic Distance</th>
                      <th className="px-4 py-2 text-center font-medium text-blue-700">Classic Risk</th>
                      <th className="px-4 py-2 text-left font-medium text-blue-700">Classic Path</th>
                      <th className="px-4 py-2 text-center font-medium text-green-700">SAR Distance</th>
                      <th className="px-4 py-2 text-center font-medium text-green-700">SAR Risk</th>
                      <th className="px-4 py-2 text-left font-medium text-green-700">SAR Path</th>
                      <th className="px-4 py-2 text-center font-medium text-purple-700">Security Impact</th>
                      <th className="px-4 py-2 text-center font-medium text-orange-700">Trade-off Analysis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.keys(comparisonData.classicResults)
                      .sort()
                      .map(nodeId => {
                        const classic = comparisonData.classicResults[nodeId];
                        const sar = comparisonData.sarResults[nodeId];
                        const pathChanged = classic && sar && classic.pathNodes.join('→') !== sar.pathNodes.join('→');
                        
                        // Calculate improvement metrics
                        const riskReduction = classic && sar ? 
                          ((classic.totalSecurityRisk - sar.totalSecurityRisk) / classic.totalSecurityRisk) * 100 : 0;
                        const distanceIncrease = classic && sar ? 
                          ((sar.totalDistance - classic.totalDistance) / classic.totalDistance) * 100 : 0;
                        
                        return (
                          <tr key={nodeId} className={`hover:bg-gray-50 ${pathChanged ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''}`}>
                            <td className="px-4 py-3">
                              <span className="font-medium text-gray-900">{nodeId}</span>
                              {pathChanged && (
                                <div className="text-xs text-yellow-600 mt-1">🔄 Route Changed</div>
                              )}
                            </td>
                            
                            {/* Classic Results */}
                            <td className="px-4 py-3 text-center">
                              {classic ? (
                                <span className="font-mono text-sm bg-blue-100 px-2 py-1 rounded">{classic.totalDistance.toFixed(1)}</span>
                              ) : (
                                <span className="text-gray-400">∞</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {classic ? (
                                <span className="font-mono text-sm bg-red-100 text-red-700 px-2 py-1 rounded">{classic.totalSecurityRisk.toFixed(2)}</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {classic ? (
                                <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded">{classic.pathNodes.join(' → ')}</span>
                              ) : (
                                <span className="text-gray-400">No path</span>
                              )}
                            </td>
                            
                            {/* SAR Results */}
                            <td className="px-4 py-3 text-center">
                              {sar ? (
                                <span className={`font-mono text-sm px-2 py-1 rounded ${
                                  classic && sar.totalDistance > classic.totalDistance 
                                    ? 'bg-orange-100 text-orange-700' 
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  {sar.totalDistance.toFixed(1)}
                                  {classic && (
                                    <span className="text-xs ml-1">
                                      ({distanceIncrease > 0 ? '+' : ''}{distanceIncrease.toFixed(1)}%)
                                    </span>
                                  )}
                                </span>
                              ) : (
                                <span className="text-gray-400">∞</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {sar ? (
                                <span className={`font-mono text-sm px-2 py-1 rounded ${
                                  classic && sar.totalSecurityRisk < classic.totalSecurityRisk 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {sar.totalSecurityRisk.toFixed(2)}
                                  {classic && (
                                    <span className="text-xs ml-1">
                                      ({riskReduction > 0 ? '-' : '+'}{Math.abs(riskReduction).toFixed(1)}%)
                                    </span>
                                  )}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {sar ? (
                                <span className="font-mono text-xs text-green-700 bg-green-50 px-2 py-1 rounded">{sar.pathNodes.join(' → ')}</span>
                              ) : (
                                <span className="text-gray-400">No path</span>
                              )}
                            </td>
                            
                            {/* Security Impact */}
                            <td className="px-4 py-3 text-center">
                              {classic && sar ? (
                                <div className="space-y-1">
                                  {riskReduction > 20 ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      🛡️ High Security Gain
                                    </span>
                                  ) : riskReduction > 5 ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      🔒 Moderate Security Gain
                                    </span>
                                  ) : riskReduction > 0 ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      ⚡ Minor Security Gain
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                      = No Security Change
                                    </span>
                                  )}
                                </div>
                              ) : classic && !sar ? (
                                <span className="text-red-600 text-xs">SAR: No path</span>
                              ) : !classic && sar ? (
                                <span className="text-green-600 text-xs">SAR: New path found</span>
                              ) : (
                                <span className="text-gray-400 text-xs">Both: No path</span>
                              )}
                            </td>

                            {/* Trade-off Analysis */}
                            <td className="px-4 py-3 text-center">
                              {classic && sar ? (
                                <div className="space-y-1">
                                  {riskReduction > 10 && distanceIncrease < 20 ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                      ✅ Excellent Trade-off
                                    </span>
                                  ) : riskReduction > 5 && distanceIncrease < 30 ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      👍 Good Trade-off
                                    </span>
                                  ) : riskReduction > 0 && distanceIncrease < 50 ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      ⚖️ Acceptable Trade-off
                                    </span>
                                  ) : distanceIncrease > 50 ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      ⚠️ High Distance Cost
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                      📊 Minimal Impact
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Edge Creation Modal */}
        {showEdgeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-md">
              <h3 className="text-lg font-semibold mb-4">Create New Edge</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Edge Weight</label>
                  <input
                    type="number"
                    min="1"
                    value={edgeWeight}
                    onChange={(e) => setEdgeWeight(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter weight (e.g., 1, 2, 3...)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Security Risk Level</label>
                  <select
                    value={edgeSecurityRisk}
                    onChange={(e) => setEdgeSecurityRisk(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {securityRiskOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 text-xs text-gray-600">
                    {securityRiskOptions.find(opt => opt.value === edgeSecurityRisk)?.description}
                    {algorithmMode === 'classic' && (
                      <span className="block mt-1 text-blue-600">
                        Note: Classic Bellman-Ford ignores security risk (β=0)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleCancelEdge}
                  className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEdge}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Edge
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}

export function BellmanFordSimulator() {
    return (
        <ReactFlowProvider>
            <BellmanFordSimulatorFlow />
        </ReactFlowProvider>
    );
} 