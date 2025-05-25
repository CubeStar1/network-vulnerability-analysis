import { SimulationNode, SimulationEdge, SimulationEdgeData } from '../../common/types';

export interface BellmanFordStep {
  iteration: number;
  distances: Record<string, number>;
  path: Record<string, string>;
  relaxedEdge?: string;
  message: string;
  isNegativeCycleDetected?: boolean;
  currentEdgeId?: string;
  highlightedEdgeId?: string;
}

interface AlgorithmConfig {
  mode: 'classic' | 'sar';
  beta: number; // Security weight factor (0-1)
}

export function runBellmanFord(
  nodes: SimulationNode[],
  edges: SimulationEdge[],
  startNodeId: string,
  config: AlgorithmConfig
): BellmanFordStep[] {
  const steps: BellmanFordStep[] = [];
  const distances: Record<string, number> = {};
  const path: Record<string, string> = {};
  
  // Initialize distances
  nodes.forEach(node => {
    distances[node.id] = node.id === startNodeId ? 0 : Infinity;
    path[node.id] = '';
  });

  // Initial step
  steps.push({
    iteration: 0,
    distances: { ...distances },
    path: { ...path },
    message: `Bellman-Ford initialized. Source: ${startNodeId}. All distances set to ∞ except source (0).`,
  });

  const alpha = 1 - config.beta; // Distance weight factor

  // Calculate edge cost based on algorithm mode
  const getEdgeCost = (edge: SimulationEdge): number => {
    const edgeData = edge.data as SimulationEdgeData;
    const distance = edgeData.weight || 0;
    const securityRisk = edgeData.securityRisk || 0;
    
    if (config.mode === 'classic') {
      return distance; // Classic Bellman-Ford: only distance matters
    } else {
      return alpha * distance + config.beta * securityRisk; // SAR: weighted combination
    }
  };

  // Main Bellman-Ford algorithm: Relax edges |V|-1 times
  const nodeCount = nodes.length;
  
  for (let iteration = 1; iteration < nodeCount; iteration++) {
    let hasUpdate = false;
    
    // Try to relax each edge
    for (const edge of edges) {
      const edgeData = edge.data as SimulationEdgeData;
      const cost = getEdgeCost(edge);
      
      // Try relaxing edge in both directions (undirected graph)
      const directions = [
        { from: edge.source, to: edge.target },
        { from: edge.target, to: edge.source }
      ];
      
      for (const direction of directions) {
        const { from, to } = direction;
        
        if (distances[from] !== Infinity && distances[from] + cost < distances[to]) {
          const oldDistance = distances[to];
          distances[to] = distances[from] + cost;
          path[to] = from;
          hasUpdate = true;
          
          steps.push({
            iteration,
            distances: { ...distances },
            path: { ...path },
            relaxedEdge: `${from} → ${to}`,
            currentEdgeId: edge.id,
            highlightedEdgeId: edge.id,
            message: `Iteration ${iteration}: Relaxed edge ${from} → ${to}. Distance to ${to}: ${oldDistance === Infinity ? '∞' : oldDistance.toFixed(2)} → ${distances[to].toFixed(2)} (cost: ${cost.toFixed(2)})`,
          });
        }
      }
    }
    
    // If no updates in this iteration, we can terminate early
    if (!hasUpdate) {
      steps.push({
        iteration,
        distances: { ...distances },
        path: { ...path },
        message: `Iteration ${iteration}: No edges relaxed. Algorithm converged early.`,
      });
      break;
    } else {
      steps.push({
        iteration,
        distances: { ...distances },
        path: { ...path },
        message: `Iteration ${iteration}: Completed edge relaxation phase.`,
      });
    }
  }

  // Check for negative cycles (one more iteration)
  let negativeCycleDetected = false;
  for (const edge of edges) {
    const cost = getEdgeCost(edge);
    
    const directions = [
      { from: edge.source, to: edge.target },
      { from: edge.target, to: edge.source }
    ];
    
    for (const direction of directions) {
      const { from, to } = direction;
      
      if (distances[from] !== Infinity && distances[from] + cost < distances[to]) {
        negativeCycleDetected = true;
        steps.push({
          iteration: nodeCount - 1, // This is the negative cycle detection phase
          distances: { ...distances },
          path: { ...path },
          isNegativeCycleDetected: true,
          currentEdgeId: edge.id,
          highlightedEdgeId: edge.id,
          message: `⚠️ Negative cycle detected! Edge ${from} → ${to} can still be relaxed in cycle detection phase.`,
        });
        break;
      }
    }
    if (negativeCycleDetected) break;
  }

  if (!negativeCycleDetected) {
    steps.push({
      iteration: nodeCount - 1, // This is the negative cycle detection phase
      distances: { ...distances },
      path: { ...path },
      isNegativeCycleDetected: false,
      message: `✅ Negative cycle detection phase: No negative cycles found. Algorithm completed successfully.`,
    });
  }

  // Final summary step
  const reachableNodes = Object.entries(distances)
    .filter(([nodeId, dist]) => nodeId !== startNodeId && dist !== Infinity)
    .map(([nodeId]) => nodeId);

  steps.push({
    iteration: nodeCount - 1, // Keep this as the final phase
    distances: { ...distances },
    path: { ...path },
    message: `Algorithm completed. Reachable nodes from ${startNodeId}: [${reachableNodes.join(', ')}]. Mode: ${config.mode.toUpperCase()}${config.mode === 'sar' ? ` (β=${config.beta})` : ''}. Total iterations: ${nodeCount - 1}.`,
  });

  return steps;
}

// Helper function to build shortest path
export function buildShortestPath(
  steps: BellmanFordStep[],
  startNodeId: string,
  targetNodeId: string
): string[] {
  if (steps.length === 0) return [];
  
  const finalStep = steps[steps.length - 1];
  if (finalStep.distances[targetNodeId] === Infinity) return [];
  
  const path: string[] = [];
  let current = targetNodeId;
  
  while (current && current !== startNodeId) {
    path.unshift(current);
    current = finalStep.path[current];
  }
  
  if (current === startNodeId) {
    path.unshift(startNodeId);
  }
  
  return path;
}

// Helper function to get algorithm complexity info
export function getBellmanFordComplexity(nodeCount: number, edgeCount: number): string {
  return `Time: O(V×E) = O(${nodeCount}×${edgeCount}) = O(${nodeCount * edgeCount}), Space: O(V) = O(${nodeCount})`;
} 