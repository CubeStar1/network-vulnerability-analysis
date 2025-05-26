'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { toast } from "sonner";
import { 
    fetchSimulationEvents, 
    subscribeToSimulationEvents, 
    unsubscribeFromChannel,
    SimulationEvent,
    fetchSimulationRun
} from "@/lib/supabase/queries/simulation";
import { TopologyPayload } from '@/lib/api/simulation';
import { SimulationRun } from '@/lib/api/simulation'; // Added import for SimulationRun type

// Helper function to extract nodes and edges for animation based on event type
const extractAnimationTargets = (event: SimulationEvent): { nodes: string[]; edges: string[] } => {
  const targets: { nodes: Set<string>; edges: Set<string> } = {
    nodes: new Set(),
    edges: new Set(),
  };
  const data = event.data; // data can be an object or a string

  try {
    let eventNodeId: string | undefined;
    let eventSourceNode: string | undefined;
    let eventTargetNode: string | undefined;
    let eventAttackers: string[] | undefined;

    // Attempt to generically extract common node/link identifiers
    if (data && typeof data === 'object') {
      const d = data as any; // Use 'any' for easier dynamic access, ensure checks
      eventNodeId = d.nodeId || d.hostId || d.node_id || d.id;
      eventSourceNode = d.source || d.src;
      eventTargetNode = d.target || d.dst || d.victim;
      
      if (d.message && typeof d.message === 'object') {
        const m = d.message as any;
        eventNodeId = eventNodeId || m.nodeId || m.hostId || m.id || m.node_id;
        eventSourceNode = eventSourceNode || m.source || m.src;
        eventTargetNode = eventTargetNode || m.target || m.dst || m.victim;
        if (m.attacker && m.victim) { // Specific for some attack results
            eventSourceNode = eventSourceNode || m.attacker;
            eventTargetNode = eventTargetNode || m.victim;
        }
      }
      
      if (d.attackers && Array.isArray(d.attackers)) {
        eventAttackers = d.attackers.filter((id: any) => typeof id === 'string');
      }
      if (d.message && typeof d.message === 'object' && (d.message as any).attackers && Array.isArray((d.message as any).attackers)) {
        eventAttackers = (d.message as any).attackers.filter((id: any) => typeof id === 'string');
      }

    } // String data is harder to parse generically for node IDs without specific regex per event type

    switch (event.event_type) {
      case 'PING_RESULT':
        if (data && typeof data === 'object' && data.message && typeof data.message === 'string') {
          const messageMatch = data.message.match(/Ping (\w+) -> (\w+):/);
          if (messageMatch) {
            const [, source, target] = messageMatch;
            targets.nodes.add(source);
            targets.nodes.add(target);
            targets.edges.add(`${source}-${target}`);
          }
        }
        break;

      case 'LINK_ADD':
      case 'LINK_DOWN':
      case 'LINK_REMOVE':
        if (eventSourceNode && eventTargetNode) {
          targets.nodes.add(eventSourceNode);
          targets.nodes.add(eventTargetNode);
          targets.edges.add(`${eventSourceNode}-${eventTargetNode}`);
        }
        break;

      case 'NODE_ADD':
      case 'NODE_REMOVE':
      case 'NODE_UP':
      case 'NODE_DOWN':
        if (eventNodeId) {
          targets.nodes.add(eventNodeId);
        }
        break;
      
      case 'ATTACK_START':
      case 'ATTACK_PROGRESS':
      case 'ATTACK_END':
      case 'ATTACK_RESULT': 
        if (eventTargetNode) { 
          targets.nodes.add(eventTargetNode);
        }
        if (eventSourceNode && eventTargetNode) { 
          targets.nodes.add(eventSourceNode);
          targets.edges.add(`${eventSourceNode}-${eventTargetNode}`);
        }
        if (eventAttackers && eventTargetNode) { 
          eventAttackers.forEach(attackerId => {
            targets.nodes.add(attackerId);
            targets.edges.add(`${attackerId}-${eventTargetNode}`);
          });
        }
        if (!eventSourceNode && !eventAttackers && eventTargetNode) {
            // Node already added if it's the primary target
        } else if (eventNodeId && !eventTargetNode && !eventSourceNode && !eventAttackers) { 
            targets.nodes.add(eventNodeId);
        }
        break;

      case 'PORT_DETECTED':
      case 'SCAN_PROGRESS':
      case 'SCAN_COMPLETE':
      case 'SNIFF_START':
      case 'SNIFF_RESULT':
        if (eventNodeId) {
          targets.nodes.add(eventNodeId);
        } else if (eventTargetNode) { 
          targets.nodes.add(eventTargetNode);
        }
        if (eventSourceNode && eventTargetNode) {
            targets.nodes.add(eventSourceNode);
            targets.nodes.add(eventTargetNode);
            targets.edges.add(`${eventSourceNode}-${eventTargetNode}`);
        }
        break;

      case 'PERFORMANCE_METRIC':
      case 'TRAFFIC_STATS':
      case 'CMD_OUTPUT': 
      case 'SCRIPT_OUTPUT':
      case 'SERVICE_START':
      case 'SERVICE_STOP':
        if (eventNodeId) {
          targets.nodes.add(eventNodeId);
        }
        if (eventSourceNode && eventTargetNode && event.event_type === 'TRAFFIC_STATS') { 
            targets.nodes.add(eventSourceNode);
            targets.nodes.add(eventTargetNode);
            targets.edges.add(`${eventSourceNode}-${eventTargetNode}`);
        }
        break;
      
      default:
        if (targets.nodes.size === 0 && targets.edges.size === 0) { // Only apply if no specific case handled it
            if (eventNodeId) {
                targets.nodes.add(eventNodeId);
            }
            if (eventSourceNode && eventTargetNode) {
                targets.nodes.add(eventSourceNode);
                targets.nodes.add(eventTargetNode);
                targets.edges.add(`${eventSourceNode}-${eventTargetNode}`);
            }
        }
        break;
    }
  } catch (error) {
    console.warn(`Error extracting animation targets for ${event.event_type}:`, error, event.data);
  }
  
  return { nodes: Array.from(targets.nodes), edges: Array.from(targets.edges) };
};

interface SimulationContextType {
  events: SimulationEvent[];
  activeEffects: {
    nodes: Set<string>;
    edges: Set<string>;
  };
  selectedRunId: number | null;
  setSelectedRunId: (id: number | null) => void;
  isLoading: boolean;
  topology: TopologyPayload | null;
  designatedAttackerId: string | null; // e.g., 'h1'
  isAttackerActive: boolean;
  currentAttackerEventData: SimulationEvent['data'] | null; // Data for the current active attack by designated attacker
  identifiedAttackerInfo: { // Information about the attacker identified post-simulation
    id: string;
    eventData?: SimulationEvent['data'] | null; // Make eventData optional or allow null
    ip?: string;
    metadata?: Record<string, string>;
  } | null;
  setAttackerStatus: (isActive: boolean, eventData?: SimulationEvent['data']) => void;
  clearIdentifiedAttacker: () => void;
  latestRun: SimulationRun | null; // Added for direct access to latest run details
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<SimulationEvent[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [topology, setTopology] = useState<TopologyPayload | null>(null);
  const [activeEffects, setActiveEffects] = useState<{ nodes: Set<string>; edges: Set<string> }>({
    nodes: new Set(),
    edges: new Set(),
  });
  const channelRef = useRef<RealtimeChannel | null>(null); // For simulation_events
  const runStatusChannelRef = useRef<RealtimeChannel | null>(null); // For simulation_runs status updates
  const eventsRef = useRef<SimulationEvent[]>([]);
  const supabase = createSupabaseBrowser();

  // Attacker state
  const designatedAttackerId = 'h1'; // Hardcoded for now
  const [isAttackerActive, setIsAttackerActive] = useState(false);
  const [currentAttackerEventData, setCurrentAttackerEventData] = useState<SimulationEvent['data'] | null>(null);
  const [identifiedAttackerInfo, setIdentifiedAttackerInfo] = useState<SimulationContextType['identifiedAttackerInfo']>(null);
  const [latestRun, setLatestRun] = useState<SimulationRun | null>(null); // Added state for latest run
  const [wasH1ActiveDuringRun, setWasH1ActiveDuringRun] = useState(false); // New state to track if h1 was ever active

  const clearIdentifiedAttacker = useCallback(() => {
    setIdentifiedAttackerInfo(null);
  }, []);

  const setAttackerStatus = useCallback((isActive: boolean, eventData?: SimulationEvent['data']) => {
    setIsAttackerActive(isActive);
    if (isActive) {
      setCurrentAttackerEventData(eventData || null);
      if (designatedAttackerId === 'h1') {
        setWasH1ActiveDuringRun(true); // Mark that h1 was active in this run
      }
    } else {
      // Optionally clear currentAttackerEventData when attacker becomes inactive, 
      // or keep it to show last known attack details until sim end.
      // For now, let's keep it for potential use in identifiedAttackerInfo.
    }
  }, [designatedAttackerId]);

  // Reset wasH1ActiveDuringRun when a new simulation is selected
  useEffect(() => {
    if (selectedRunId) {
      setWasH1ActiveDuringRun(false);
      // other resets...
    }
  }, [selectedRunId]);

  // Update eventsRef whenever events change
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    if (!selectedRunId) {
      setEvents([]);
      setTopology(null);
      setLatestRun(null); // Clear latest run when no run is selected
      clearIdentifiedAttacker();
      setIsLoading(false);
      unsubscribeFromChannel(supabase, channelRef.current);
      channelRef.current = null;
      unsubscribeFromChannel(supabase, runStatusChannelRef.current); // Unsubscribe from run status channel
      runStatusChannelRef.current = null;
      return;
    }

    setIsLoading(true);
    setEvents([]);

    // Fetch run details including topology
    const fetchRunDetails = async () => {
      try {
        const { data: runData, error: runError } = await fetchSimulationRun(supabase, selectedRunId);
        if (runError) {
          console.error(`Error fetching run details:`, runError);
          toast.error('Failed to load run details');
          setLatestRun(null);
        } else if (runData) {
          setTopology(runData.topology_used || null);
          setLatestRun(runData as SimulationRun); // Set latestRun state
          clearIdentifiedAttacker(); 
        }
      } catch (error) {
        console.error('Error in fetchRunDetails:', error);
      }
    };

    const initializeEventsAndSubscription = async () => {
      try {
        const { data, error } = await fetchSimulationEvents(supabase, selectedRunId, 100);
        if (error) {
          console.error(`Error fetching initial events:`, error);
          toast.error('Failed to load simulation events');
        } else if (data) {
          console.log('Initial events loaded:', data);
          setEvents(data);
        }
      } catch (error) {
        console.error('Error in initializeEventsAndSubscription:', error);
      } finally {
        setIsLoading(false);
      }
      
      // Set up real-time subscription for events
      channelRef.current = subscribeToSimulationEvents(supabase, selectedRunId, handleNewEvent);

      // Set up real-time subscription for run status updates
      if (runStatusChannelRef.current) { // Clean up previous subscription if any
        unsubscribeFromChannel(supabase, runStatusChannelRef.current);
      }
      runStatusChannelRef.current = supabase
        .channel(`simulation-run-status-${selectedRunId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'simulation_runs', filter: `id=eq.${selectedRunId}` },
          (payload: RealtimePostgresChangesPayload<SimulationRun>) => { // Typed payload
            console.log('Change received in simulation_runs for context:', payload);
            if (payload.eventType === 'UPDATE' && payload.new && 'id' in payload.new) {
              setLatestRun(payload.new as SimulationRun); 
            } else if (payload.eventType === 'DELETE') {
              setLatestRun(null); // If the run is deleted
            }
          }
        )
        .subscribe((status, err) => {
          if (err) {
            console.error(`Error subscribing to run status for ${selectedRunId}:`, err);
          }
        });
    };

    fetchRunDetails();
    initializeEventsAndSubscription();

    return () => {
      unsubscribeFromChannel(supabase, channelRef.current);
      channelRef.current = null;
      unsubscribeFromChannel(supabase, runStatusChannelRef.current); // Unsubscribe from run status channel
      runStatusChannelRef.current = null;
    };
  }, [selectedRunId, supabase]);

  const handleNewEvent = useCallback((newEvent: SimulationEvent) => {
    setEvents(currentEvents => [newEvent, ...currentEvents]);

    // Attacker status logic
    if (newEvent.event_type === 'ATTACK_START') {
      const attackData = newEvent.data;
      let attackerNodeId = null;
      if (attackData && typeof attackData === 'object') {
        const ad = attackData as any;
        attackerNodeId = ad.attacker || ad.source || ad.nodeId || (ad.message as any)?.attacker || (ad.message as any)?.source;
      }
      if (attackerNodeId && attackerNodeId === designatedAttackerId) {
        setAttackerStatus(true, attackData);
        // Do not set identifiedAttackerInfo here, only on simulation end
      }
    } else if (newEvent.event_type === 'ATTACK_END') {
      // If an attack by designated attacker ends, we keep isAttackerActive true until SIMULATION_END
      // to correctly attribute it. Or, if we want to show "mitigation" during attack, this logic is fine.
      // For now, let's assume ATTACK_END for designated attacker means they are no longer "actively" attacking for banner purposes.
      const eventData = newEvent.data;
      let attackerNodeId = null;
      if (eventData && typeof eventData === 'object') {
        const ed = eventData as any;
        attackerNodeId = ed.attacker || ed.source || ed.nodeId || (ed.message as any)?.attacker || (ed.message as any)?.source;
      }
      if (attackerNodeId && attackerNodeId === designatedAttackerId && isAttackerActive) {
         // We could set isAttackerActive to false here if we want the "Malicious User Detected" banner to disappear
         // when the specific ATTACK_END event for h1 comes, rather than waiting for SIMULATION_END.
         // For now, let's keep isAttackerActive true, identification happens at SIMULATION_END.
      }
    } else if (newEvent.event_type === 'SIMULATION_END' || newEvent.event_type === 'SIMULATION_ERROR') {
      if (wasH1ActiveDuringRun && designatedAttackerId === 'h1') { // Check if h1 was ever active during this run
        const H1_ATTACKER_METADATA = {
          id: 'h1',
          ip: "192.168.1.100",
          deviceType: "Compromised Host",
          os: "Linux (Kernel 5.15)",
          threatLevel: "Critical",
        };
        setIdentifiedAttackerInfo({
          id: 'h1',
          eventData: currentAttackerEventData, // Now compatible as currentAttackerEventData can be null
          ip: H1_ATTACKER_METADATA.ip,
          metadata: {
            deviceType: H1_ATTACKER_METADATA.deviceType,
            os: H1_ATTACKER_METADATA.os,
            threatLevel: H1_ATTACKER_METADATA.threatLevel,
            // You could add a timestamp here if needed
            // identifiedAt: new Date().toISOString(),
          }
        });
      }
      // Reset active attack states after simulation ends
      setIsAttackerActive(false);
      setCurrentAttackerEventData(null);
      // setWasH1ActiveDuringRun(false); // Reset for the next run, handled by selectedRunId change effect
    }

    const { nodes: primaryNodes, edges: primaryEdges } = extractAnimationTargets(newEvent);

    const nodesToAnimate = new Set<string>(primaryNodes);
    const edgesToAnimate = new Set<string>();

    primaryEdges.forEach(edge => {
      const parts = edge.split('-');
      if (parts.length === 2) {
        edgesToAnimate.add(`${parts[0]}-${parts[1]}`);
        edgesToAnimate.add(`${parts[1]}-${parts[0]}`); // Add reverse for visual effect consistency
      }
    });

    // If the event identified two primary nodes and a direct edge (like PING_RESULT or LINK_ADD),
    // also highlight other links connected to these nodes, similar to original PING_RESULT behavior.
    if (primaryNodes.length === 2 && primaryEdges.length === 1) {
        const [sourceNode, targetNode] = primaryNodes; // Assuming order from extractAnimationTargets

        eventsRef.current.forEach(evt => {
            if (evt.event_type === 'LINK_ADD') {
                const linkEventData = evt.data;
                if (linkEventData && typeof linkEventData === 'object' && linkEventData.message && typeof linkEventData.message === 'object') {
                    const linkData = linkEventData.message as { source?: string; target?: string };
                    if (linkData.source && linkData.target) {
                        if (linkData.source === sourceNode || linkData.target === sourceNode ||
                            linkData.source === targetNode || linkData.target === targetNode) {
                            edgesToAnimate.add(`${linkData.source}-${linkData.target}`);
                            edgesToAnimate.add(`${linkData.target}-${linkData.source}`);
                        }
                    }
                }
            }
        });
    }

    if (nodesToAnimate.size > 0 || edgesToAnimate.size > 0) {
      setActiveEffects(prev => ({
        nodes: new Set([...prev.nodes, ...nodesToAnimate]),
        edges: new Set([...prev.edges, ...edgesToAnimate])
      }));

      setTimeout(() => {
        setActiveEffects(prev => {
          const nextNodes = new Set(prev.nodes);
          nodesToAnimate.forEach(n => nextNodes.delete(n));
          
          const nextEdges = new Set(prev.edges);
          edgesToAnimate.forEach(e => nextEdges.delete(e));
          
          return { nodes: nextNodes, edges: nextEdges };
        });
      }, 1500); // Animation duration
    }
  }, [isAttackerActive, setAttackerStatus, designatedAttackerId, wasH1ActiveDuringRun]); // Added dependencies for attacker logic

  return (
    <SimulationContext.Provider value={{ 
      events, 
      activeEffects, 
      selectedRunId, 
      setSelectedRunId,
      isLoading,
      topology,
      designatedAttackerId,
      isAttackerActive, // Is an attack currently perceived as active
      currentAttackerEventData, // Data for that active attack
      identifiedAttackerInfo, // Attacker info confirmed post-simulation
      setAttackerStatus,
      clearIdentifiedAttacker,
      latestRun // Added latestRun to context value
    }}>
      {children}
    </SimulationContext.Provider>
  );
}