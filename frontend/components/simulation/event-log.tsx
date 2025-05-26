'use client';

import { useSimulation } from '@/lib/contexts/simulation-context';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, ListFilter } from 'lucide-react';
import { SimulationEvent } from '@/lib/supabase/queries/simulation';
import {
  formatNodeAddEvent,
  formatLinkAddEvent,
  formatPingResultEvent,
  formatSimulationStatusEvent,
  formatDefaultEvent,
  getBadgeVariant
} from './event-formatters';

function FormatEventData({ event }: { event: SimulationEvent }) {
    const { event_type } = event;
    
    // Handle null/undefined event data
    if (!event || !event.data) {
        return <div className="text-muted-foreground italic">No event data available</div>;
    }

    // Format based on event type
    switch (event_type) {
        case 'NODE_ADD': 
            return formatNodeAddEvent(event);
        case 'LINK_ADD': 
            return formatLinkAddEvent(event);
        case 'PING_RESULT': 
            return formatPingResultEvent(event);
        case 'SIMULATION_START':
        case 'SIMULATION_END':
        case 'SIMULATION_WARNING':
        case 'SIMULATION_ERROR':
        case 'SIMULATION_INFO':
        case 'SCRIPT_START':
        case 'SCRIPT_COMPLETE':
            return formatSimulationStatusEvent(event);
        default:
            return formatDefaultEvent(event);
    }
}

export function EventLog() { 
  const { events, selectedRunId, isLoading } = useSimulation();

  return (
    <Card className="h-full flex flex-col"> 
      <CardHeader className="flex-shrink-0 pb-3 pt-4 px-4">
        <CardTitle className="flex items-center text-lg">
          {selectedRunId ? <Code2 className="mr-2 h-5 w-5" /> : <ListFilter className="mr-2 h-5 w-5 text-muted-foreground" /> }
          {selectedRunId ? `Events for Run #${selectedRunId}` : "Simulation Events"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0"> 
        <ScrollArea className="h-[500px] px-4"> 
          <div className="text-sm divide-y divide-border">
            {!selectedRunId && 
                <div className="py-8 text-center text-muted-foreground italic">
                    Select a run from the history to view its events.
                </div>
            }
            {selectedRunId && isLoading && 
                <div className="py-8 text-center text-muted-foreground italic">
                    Loading events...
                </div>
            }
            {selectedRunId && !isLoading && events.length === 0 && 
                <div className="py-8 text-center text-muted-foreground italic">
                    No events found for this run.
                </div>
            }
            {selectedRunId && !isLoading && events.map((event, index) => (
              <div key={event.id || index} className="py-2.5">
                <div className="flex justify-between items-center mb-1.5">
                  <Badge variant={getBadgeVariant(event.event_type)} className="text-xs font-semibold tracking-wide px-2 py-0.5 h-5">
                      {event.event_type.replace(/_/g, ' ')} 
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    {new Date(event.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <div className="pl-1 text-[13px]"> 
                    <FormatEventData event={event} />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 