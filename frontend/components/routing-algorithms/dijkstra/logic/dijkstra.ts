import { Node, Edge } from 'reactflow';
import { SimulationNode, SimulationEdgeData } from '../../common/types'; // Use refined types

// Enhanced Dijkstra Step Definition
export interface DijkstraStep {
  currentNodeId: string | null; // Node currently being processed
  distances: Record<string, number>; // Current shortest distances from startNode
  visited: Set<string>; // Set of visited node IDs
  path: Record<string, string | null>; // Predecessor path map
  highlightedEdgeId: string | null; // Edge being considered
  message: string; // Log message for this step
}

// Options for Dijkstra algorithm
export interface DijkstraOptions {
  mode?: 'classic' | 'sar';
  beta?: number;  // Weight factor for security risk (alpha will be calculated as 1-beta)
  riskThreshold?: number; // Maximum acceptable risk level
}

// Helper to safely parse edge weight
function getEdgeWeight(edge: Edge<SimulationEdgeData>): number {
  const weight = edge.data?.weight ?? edge.label ?? '1';
  const parsedWeight = parseInt(String(weight), 10);
  return isNaN(parsedWeight) ? 1 : parsedWeight;
}

// Helper to get security risk
function getEdgeSecurityRisk(edge: Edge<SimulationEdgeData>): number {
  return edge.data?.securityRisk ?? Math.random() * 0.5; // Random risk if not specified
}

// Calculate SAR cost function with normalized weights
function getEdgeSARCost(edge: Edge<SimulationEdgeData>, beta: number): number {
  const alpha = 1 - beta; // Normalized: α + β = 1
  const weight = getEdgeWeight(edge);
  const risk = getEdgeSecurityRisk(edge);
  return alpha * weight + beta * risk;
}

export function runDijkstra(
  nodes: SimulationNode[], 
  edges: Edge<SimulationEdgeData>[], 
  startNodeId: string,
  options: DijkstraOptions = {}
): DijkstraStep[] {
  const {
    mode = 'classic',
    beta = 0.5,
    riskThreshold = 0.8,
  } = options;

  const steps: DijkstraStep[] = [];
  const distances: Record<string, number> = {};
  const visited = new Set<string>();
  const path: Record<string, string | null> = {};
  // Priority Queue: Store { nodeId, distance } pairs
  const pq: { nodeId: string; distance: number }[] = [];

  // Initialization
  nodes.forEach(node => {
    distances[node.id] = Infinity;
    path[node.id] = null;
  });
  distances[startNodeId] = 0;
  pq.push({ nodeId: startNodeId, distance: 0 });

  const modeText = mode === 'sar' ? 'SAR' : 'Classic';
  steps.push({
    currentNodeId: null,
    distances: { ...distances },
    visited: new Set(visited),
    path: { ...path },
    highlightedEdgeId: null,
    message: `${modeText} Dijkstra initialized. Start node: ${startNodeId}, distances set to ∞.`,
  });

  while (pq.length > 0) {
    // Sort acts as a simple priority queue (inefficient for large graphs)
    pq.sort((a, b) => a.distance - b.distance);
    const { nodeId: currentNodeId, distance: currentDistance } = pq.shift()!;

    // Skip if already visited (due to potentially outdated entries in PQ)
    if (visited.has(currentNodeId)) {
      continue;
    }
    if (currentDistance === Infinity) {
      // Stop if the smallest distance is Infinity (unreachable nodes)
      break;
    }

    visited.add(currentNodeId);

    steps.push({
      currentNodeId,
      distances: { ...distances },
      visited: new Set(visited),
      path: { ...path },
      highlightedEdgeId: null,
      message: `Visiting node ${currentNodeId}. Current shortest distance: ${currentDistance.toFixed(2)}. Mark as visited.`,
    });

    // Explore neighbors
    const outgoingEdges = edges.filter(edge => edge.source === currentNodeId);
    const incomingEdges = edges.filter(edge => edge.target === currentNodeId); // Consider undirected edges too

    // Combine and filter unique neighbors
    const neighborEdges = [...outgoingEdges, ...incomingEdges];

    for (const edge of neighborEdges) {
      const neighborNodeId = edge.source === currentNodeId ? edge.target : edge.source;

      // Skip if neighbor already visited
      if (!visited.has(neighborNodeId)) {
        // SAR mode: check security risk
        if (mode === 'sar') {
          const risk = getEdgeSecurityRisk(edge);
          if (risk > riskThreshold) {
            steps.push({
              currentNodeId,
              distances: { ...distances },
              visited: new Set(visited),
              path: { ...path },
              highlightedEdgeId: edge.id,
              message: `SAR: Skipping edge ${edge.id} to ${neighborNodeId} - security risk ${risk.toFixed(2)} exceeds threshold ${riskThreshold}.`,
            });
            continue;
          }
        }

        const weight = getEdgeSARCost(edge, beta);
        const newDist = currentDistance + weight;

        // Log checking neighbor with mode-specific details
        const alpha = (1 - beta).toFixed(1);
        const betaStr = beta.toFixed(1);
        const edgeWeight = getEdgeWeight(edge);
        const riskValue = getEdgeSecurityRisk(edge).toFixed(2);
        const costDetails = `Cost: ${alpha}×${edgeWeight} + ${betaStr}×${riskValue} = ${weight.toFixed(2)}`;
        
        steps.push({
          currentNodeId,
          distances: { ...distances },
          visited: new Set(visited),
          path: { ...path },
          highlightedEdgeId: edge.id,
          message: `Checking neighbor ${neighborNodeId} via edge ${edge.id} (${costDetails}). Current: ${distances[neighborNodeId] === Infinity ? '∞' : distances[neighborNodeId].toFixed(2)}, calculated: ${newDist.toFixed(2)}.`,
        });

        if (newDist < distances[neighborNodeId]) {
          distances[neighborNodeId] = newDist;
          path[neighborNodeId] = currentNodeId;
          // Add to PQ even if already present, new shorter path found
          pq.push({ nodeId: neighborNodeId, distance: newDist });

          // Log distance update
          steps.push({
            currentNodeId,
            distances: { ...distances },
            visited: new Set(visited),
            path: { ...path },
            highlightedEdgeId: edge.id,
            message: `✓ Updated distance for ${neighborNodeId} to ${newDist.toFixed(2)}. Set predecessor to ${currentNodeId}.`,
          });
        } else {
            // Log no update needed
             steps.push({
                currentNodeId,
                distances: { ...distances },
                visited: new Set(visited),
                path: { ...path },
                highlightedEdgeId: edge.id,
                message: `No update needed for ${neighborNodeId} (new: ${newDist.toFixed(2)} ≥ current: ${distances[neighborNodeId] === Infinity ? '∞' : distances[neighborNodeId].toFixed(2)}).`,
            });
        }
      }
    }
  }

  steps.push({
    currentNodeId: null,
    distances: { ...distances },
    visited: new Set(visited),
    path: { ...path },
    highlightedEdgeId: null,
    message: `${modeText} Dijkstra finished. All reachable nodes visited.`,
  });

  return steps;
} 