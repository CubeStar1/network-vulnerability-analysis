// Types for topology submission
interface BackendNode {
  id: string;
  type: 'host' | 'switch'; 
  params?: Record<string, any>;
  position: { x: number; y: number };
}

interface BackendLink {
  source: string;
  target: string;
  params?: Record<string, any>;
}

export interface TopologyPayload {
  nodes: BackendNode[];
  links: BackendLink[];
}

interface SimulationRunResponse {
  status: string;
  message: string;
  run_id: number | null;
}

// Enum types matching database schema
export type EventCategory = 'NETWORK' | 'SECURITY' | 'ROUTING' | 'SYSTEM';
export type EventSeverity = 'info' | 'warning' | 'error' | 'critical';

interface SimulationEvent {
  id: number;
  simulation_run_id: number;
  created_at: string;
  event_type: string;
  category: EventCategory;
  data: Record<string, any>;
  severity: EventSeverity;
  source_node?: string;
  target_node?: string;
  metadata?: Record<string, any>;
}

interface SimulationEventList {
  events: SimulationEvent[];
  total: number;
}

interface Metric {
  id: number;
  simulation_run_id: number;
  created_at: string;
  metric_type: string;
  node_id: string;
  value: number;
  unit?: string;
  labels?: Record<string, any>;
}

interface MetricList {
  metrics: Metric[];
  total: number;
}

interface MetricSummary {
  node_id: string;
  metric_type: string;
  min_value: number;
  max_value: number;
  avg_value: number;
  count: number;
}

// Add SimulationRun interface to match schema
export interface SimulationRun {
  id: number;
  started_at: string;
  status: string;
  topology_used?: TopologyPayload;
  description?: string;
  script_type: string;
  performance_summary?: Record<string, any>;
}

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
const API_PREFIX = '/api/v1/simulation';

/**
 * Submits a new topology and starts a simulation run.
 */
export async function submitTopology(
    topology: TopologyPayload,
    scriptName: string
): Promise<SimulationRunResponse> {
  console.log('Submitting topology:', { topology, scriptName });
  
  const response = await fetch(`${API_BASE}${API_PREFIX}/runs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topology: topology,
      script_name: scriptName
    }),
  });

  if (!response.ok) {
    let errorDetail = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || errorDetail;
    } catch (jsonError) {
      // If response is not JSON, stick with the HTTP status error
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

/**
 * Fetches events for a specific simulation run.
 */
export async function fetchSimulationEvents(runId: number): Promise<SimulationEventList> {
  const response = await fetch(`${API_BASE}${API_PREFIX}/runs/${runId}/events`);
  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetches metrics for a specific simulation run.
 */
export async function fetchSimulationMetrics(runId: number): Promise<MetricList> {
  const response = await fetch(`${API_BASE}${API_PREFIX}/runs/${runId}/metrics`);
  if (!response.ok) {
    throw new Error(`Failed to fetch metrics: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetches metric summaries for a specific simulation run.
 */
export async function fetchMetricsSummary(runId: number): Promise<MetricSummary[]> {
  const response = await fetch(`${API_BASE}${API_PREFIX}/runs/${runId}/metrics/summary`);
  if (!response.ok) {
    throw new Error(`Failed to fetch metrics summary: ${response.statusText}`);
  }
  return response.json();
} 