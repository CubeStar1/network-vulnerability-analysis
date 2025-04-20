import { createSupabaseBrowser } from "../client"; // Use client for browser
import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { TopologyPayload, SimulationRun as BaseSimulationRun, EventCategory, EventSeverity } from '@/lib/api/simulation';

// Define the event type here as well for consistency
export interface SimulationEvent {
  id: number;
  created_at: string;
  event_type: string;
  category: EventCategory;
  data: Record<string, any>;
  severity: EventSeverity;
  simulation_run_id: number | null;
  source_node?: string;
  target_node?: string;
  metadata?: Record<string, any>;
}

// Extend the base SimulationRun interface
export interface SimulationRun extends BaseSimulationRun {
  // Add any Supabase-specific fields if needed
}

// --- Event Fetching & Subscription --- 

/**
 * Fetches a batch of simulation events for a specific run.
 * @param supabase - The Supabase client instance.
 * @param runId - The ID of the simulation run.
 * @param limit - The maximum number of events to fetch.
 * @returns Promise<{ data: SimulationEvent[] | null, error: any }>
 */
export async function fetchSimulationEvents(
    supabase: SupabaseClient,
    runId: number,
    limit: number
): Promise<{ data: SimulationEvent[] | null, error: any }> {
    console.log(`Fetching initial events for run ${runId} (desc, limit ${limit})`);
    return supabase
        .from('simulation_events')
        .select('*')
        .eq('simulation_run_id', runId)
        .order('created_at', { ascending: false }) // Fetch newest first
        .limit(limit);
}

// --- Realtime --- 

/**
 * Subscribes to new simulation events for a specific run.
 * @param supabase - The Supabase client instance.
 * @param runId - The ID of the simulation run.
 * @param callback - Function to call when a new event is received.
 * @returns The RealtimeChannel instance.
 */
export function subscribeToSimulationEvents(
    supabase: SupabaseClient,
    runId: number,
    callback: (payload: SimulationEvent) => void
): RealtimeChannel {
    const channelName = `simulation_events_run_${runId}`;
    const channel = supabase.channel(channelName);

    channel.on<SimulationEvent>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'simulation_events',
          filter: `simulation_run_id=eq.${runId}`
        },
        (payload) => {
          console.log(`RT Event (${channelName}):`, payload.new);
          callback(payload.new as SimulationEvent);
        }
      )
      .subscribe((status, err) => {
         if (err) {
             console.error(`Error subscribing to ${channelName}:`, err);
         } else {
             console.log(`Subscribed to ${channelName} with status: ${status}`);
         }
      });

    return channel;
}

/**
 * Unsubscribes from a Supabase Realtime channel.
 * @param supabase - The Supabase client instance.
 * @param channel - The channel to unsubscribe from.
 */
export function unsubscribeFromChannel(
    supabase: SupabaseClient, 
    channel: RealtimeChannel | null
) {
    if (channel) {
        console.log(`Unsubscribing from channel: ${channel.topic}`);
        supabase.removeChannel(channel).catch(err => {
            console.error(`Error removing channel ${channel.topic}:`, err);
        });
    }
}

// --- Run Fetching & Subscription --- 

export async function fetchSimulationRuns(
    supabase: SupabaseClient,
    limit: number
): Promise<{ data: SimulationRun[] | null, error: any }> {
    console.log(`Fetching initial runs (desc, limit ${limit})`);
    return supabase
        .from('simulation_runs')
        .select('id, started_at, status, description, script_type, performance_summary')
        .order('started_at', { ascending: false })
        .limit(limit);
}

/**
 * Fetches a single simulation run by ID.
 * @param supabase - The Supabase client instance.
 * @param runId - The ID of the simulation run to fetch.
 * @returns Promise<{ data: SimulationRun | null, error: any }>
 */
export async function fetchSimulationRun(
    supabase: SupabaseClient,
    runId: number
): Promise<{ data: SimulationRun | null, error: any }> {
    console.log(`Fetching run ${runId}`);
    return supabase
        .from('simulation_runs')
        .select('id, started_at, status, description, topology_used, script_type, performance_summary')
        .eq('id', runId)
        .single();
}

// Define callback types for run changes
type InsertCallback = (payload: SimulationRun) => void;
type UpdateCallback = (payload: SimulationRun) => void;
type DeleteCallback = (payload: { id?: number }) => void;

export function subscribeToRunChanges(
    supabase: SupabaseClient,
    onInsert: InsertCallback,
    onUpdate: UpdateCallback,
    onDelete: DeleteCallback
): RealtimeChannel {
    const channelName = `simulation_runs_changes`;
    const channel = supabase.channel(channelName);

    channel.on<SimulationRun>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'simulation_runs' }, 
        (payload) => {
          console.log('RT Run Insert:', payload.new);
          onInsert(payload.new as SimulationRun);
        }
      )
      .on<SimulationRun>(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'simulation_runs' },
        (payload) => {
            console.log('RT Run Update:', payload.new);
            onUpdate(payload.new as SimulationRun);
        }
      )
       .on<SimulationRun>(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'simulation_runs' },
        (payload) => {
            console.log('RT Run Delete:', payload.old);
            // Pass the old record's ID if available
            if (payload.old && 'id' in payload.old) {
                onDelete({ id: payload.old.id as number });
            } else {
                console.warn('Received DELETE event without old record ID');
            }
        }
       )
      .subscribe((status, err) => {
        if(err) {
            console.error(`Error subscribing to ${channelName}:`, err);
        }
      });

    return channel;
} 