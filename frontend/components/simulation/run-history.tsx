'use client';

import { useEffect, useState, useCallback } from 'react';
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { 
    SimulationRun, 
    fetchSimulationRuns,
    subscribeToRunChanges,
    unsubscribeFromChannel
} from "@/lib/supabase/queries/simulation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, PlayCircle, CheckCircle, AlertCircle, RotateCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns'; 
import { cn } from "@/lib/utils"; 
import { useSimulation } from '@/lib/contexts/simulation-context';

interface RunHistoryProps {
  limit?: number;
}

const supabase = createSupabaseBrowser();

function RunStatusIcon({ status }: { status: string }) {
    if (status === 'completed') return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (status === 'failed') return <AlertCircle className="h-4 w-4 text-red-600" />;
    if (status === 'running') return <RotateCw className="h-4 w-4 text-blue-600 animate-spin" />;
    if (status === 'initiated') return <PlayCircle className="h-4 w-4 text-yellow-600" />;
    return <PlayCircle className="h-4 w-4 text-gray-500" />;
}

function getStatusBadgeVariant(status: string): "default" | "destructive" | "outline" | "secondary" {
    if (status === 'completed') return "default"; // Greenish in shadcn default theme
    if (status === 'failed') return "destructive";
    if (status === 'running') return "outline";
    return "secondary";
}

export function RunHistory({ limit = 10 }: RunHistoryProps) {
  const [runs, setRuns] = useState<SimulationRun[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { selectedRunId, setSelectedRunId } = useSimulation();

  const initialFetchRuns = useCallback(async () => {
    const { data, error: fetchError } = await fetchSimulationRuns(supabase, limit);
    if (fetchError) {
      console.error('Error fetching simulation runs:', fetchError);
      setError('Failed to load run history.');
      setRuns([]); 
    } else {
      setRuns(data || []);
      setError(null);
    }
  }, [limit]);

  useEffect(() => {
    initialFetchRuns(); 

    const handleInsert = (payload: SimulationRun) => {
        setRuns(currentRuns => [
            payload,
            ...currentRuns
        ].slice(0, limit));
    };

    const handleUpdate = (payload: SimulationRun) => {
        setRuns(currentRuns => 
            currentRuns.map(run => 
                run.id === payload.id 
                ? { ...run, ...payload } 
                : run
            )
        );
    };

    const handleDelete = (payload: { id?: number }) => {
        if (payload.id) {
            setRuns(currentRuns => currentRuns.filter(run => run.id !== payload.id));
        }
    };

    const channel = subscribeToRunChanges(supabase, handleInsert, handleUpdate, handleDelete);

    return () => {
      unsubscribeFromChannel(supabase, channel);
    };
  }, [limit, initialFetchRuns]); 

  return (
    <Card className="h-full flex flex-col"> 
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center">
          <History className="mr-2 h-5 w-5" />
          Simulation Run History
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-[500px] px-4">
          {error && <p className="text-red-600 text-sm p-2">{error}</p>}
          {runs.length === 0 && !error && (
            <p className="text-muted-foreground italic p-2">No simulation runs found.</p>
          )}
          <ul className="space-y-1">
            {runs.map((run) => (
              <li 
                key={run.id}
                onClick={() => setSelectedRunId(run.id)}
                className={cn(
                  "flex items-center justify-between p-2 rounded cursor-pointer transition-colors",
                  run.id === selectedRunId
                    ? "bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 shadow-sm" 
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50" 
                )}
              >
                <div className="flex items-center space-x-3">
                  <RunStatusIcon status={run.status} />
                  <div>
                    <p className="font-medium text-sm">Run #{run.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(run.started_at), { addSuffix: true })}
                    </p>
                    {run.description && (
                        <p className="text-xs text-red-700 mt-1 truncate" title={run.description}>{run.description}</p>
                    )}
                  </div>
                </div>
                <Badge variant={getStatusBadgeVariant(run.status)} className="capitalize text-xs">
                  {run.status}
                </Badge>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 