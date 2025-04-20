'use client';

import { SimulationEvent } from '@/lib/supabase/queries/simulation';
import { 
    Play,
    Square,
    AlertTriangle,
    PlusCircle, 
    MinusCircle, 
    Link2, 
    Unlink2, 
    Network, 
    Server, 
    Terminal, 
    CheckCircle2, 
    XCircle, 
    Info,
    Loader2,
    Shield,
    Eye,
    Zap,
    Radio,
    Activity,
    AlertCircle,
} from 'lucide-react';

export function EventIcon({ type }: { type: string }) {
    if (type === 'SIMULATION_START' || type === 'SCRIPT_START') return <Play className="h-4 w-4 text-blue-500" />;
    if (type === 'SIMULATION_END' || type === 'SCRIPT_COMPLETE') return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (type === 'SIMULATION_WARNING') return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    if (type === 'SIMULATION_ERROR' || type === 'SCRIPT_ERROR') return <AlertTriangle className="h-4 w-4 text-red-600" />;
    if (type === 'SIMULATION_INFO') return <Info className="h-4 w-4 text-blue-500" />;
    if (type === 'SIMULATION_RUNNING') return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    if (type.includes('NODE_ADD')) return <PlusCircle className="h-4 w-4 text-green-600" />;
    if (type.includes('NODE_REMOVE')) return <MinusCircle className="h-4 w-4 text-red-600" />;
    if (type.includes('LINK_ADD')) return <Link2 className="h-4 w-4 text-blue-600" />;
    if (type.includes('LINK_DOWN') || type.includes('LINK_REMOVE')) return <Unlink2 className="h-4 w-4 text-orange-600" />;
    if (type.includes('SWITCH')) return <Network className="h-4 w-4 text-purple-600" />;
    if (type.includes('HOST') || type.includes('SERVER')) return <Server className="h-4 w-4 text-gray-600" />;
    if (type === 'PING_RESULT') return <CheckCircle2 className="h-4 w-4 text-teal-600" />;
    if (type === 'PORT_DETECTED') return <Radio className="h-4 w-4 text-yellow-600" />;
    if (type === 'SCAN_PROGRESS') return <Activity className="h-4 w-4 text-blue-600" />;
    if (type === 'SCAN_COMPLETE') return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    if (type === 'ATTACK_START') return <Shield className="h-4 w-4 text-red-600" />;
    if (type === 'ATTACK_PROGRESS') return <Activity className="h-4 w-4 text-orange-600" />;
    if (type === 'ATTACK_END' || type === 'ATTACK_RESULT') return <Shield className="h-4 w-4 text-green-600" />;
    if (type === 'SNIFF_START' || type === 'SNIFF_RESULT') return <Eye className="h-4 w-4 text-purple-600" />;
    if (type === 'PROTOCOL_DETECTED') return <Zap className="h-4 w-4 text-blue-600" />;
    if (type === 'PERFORMANCE_METRIC') return <Activity className="h-4 w-4 text-blue-500" />;
    if (type === 'PERFORMANCE_WARNING') return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    if (type.includes('ERROR') || type.includes('FAIL')) return <XCircle className="h-4 w-4 text-red-600" />;
    if (type.includes('CMD') || type.includes('CLI')) return <Terminal className="h-4 w-4 text-gray-700" />;
    return <Info className="h-4 w-4 text-gray-500" />;
}

function extractMessageContent(data: any): string {
    if (!data) return '';
    if (typeof data === 'string') return data;
    if (typeof data.message === 'string') return data.message;
    if (data.message && typeof data.message === 'object') {
        const msg = data.message;
        if (msg.id) return `Node ${msg.id} (${msg.type || 'unknown'})`;
        if (msg.params) return JSON.stringify(msg.params);
    }
    return JSON.stringify(data);
}

export function formatNodeAddEvent(event: SimulationEvent) {
    const { data } = event;
    if (!data) return null;

    const nodeInfo = data.message || data;
    const nodeId = typeof nodeInfo === 'object' ? nodeInfo.id : null;
    const nodeType = typeof nodeInfo === 'object' ? nodeInfo.type : null;
    const nodeParams = typeof nodeInfo === 'object' ? nodeInfo.params : null;
    
    return (
        <div className="flex items-center space-x-2">
            <EventIcon type={nodeType === 'host' ? 'HOST' : 'SWITCH'} />
            <span>Node <code className="font-mono text-xs bg-muted p-0.5 rounded">{nodeId}</code> added</span>
            {nodeType && <span className="text-muted-foreground text-xs">({nodeType})</span>}
            {nodeParams?.ip && <span className="text-blue-500 text-xs">IP: {nodeParams.ip}</span>}
        </div>
    );
}

export function formatLinkAddEvent(event: SimulationEvent) {
    const { data } = event;
    if (!data) return null;

    const linkInfo = typeof data === 'string' ? null : data.message;
    if (!linkInfo) return (
        <div className="flex items-center space-x-2">
            <EventIcon type={event.event_type} />
            <span>Link added</span>
        </div>
    );
    
    return (
        <div className="flex items-center space-x-2">
            <EventIcon type={event.event_type} />
            <span>Link <code className="font-mono text-xs bg-muted p-0.5 rounded">{linkInfo.source}</code> &lt;-&gt; <code className="font-mono text-xs bg-muted p-0.5 rounded">{linkInfo.target}</code> added</span>
            {(linkInfo.params?.bw || linkInfo.params?.delay || linkInfo.params?.loss != null) && (
                <span className="text-muted-foreground text-xs">
                    ({linkInfo.params.bw && `${linkInfo.params.bw}Mbps`} {linkInfo.params.delay && `${linkInfo.params.delay}`} {linkInfo.params.loss != null && `${linkInfo.params.loss}% loss`})
                </span>
            )}
        </div>
    );
}

export function formatPingResultEvent(event: SimulationEvent) {
    const { data } = event;
    if (!data) return null;

    const output = data.output || '';
    const success = output.includes('bytes from') && !output.includes('100% packet loss');
    
    return (
        <div className="flex items-center space-x-2">
            {success ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
            <span>Ping test</span>
            <span className={`text-xs font-semibold ${success ? 'text-green-700' : 'text-red-700'}`}>
                {success ? 'Success' : 'Failed'}
            </span>
            {output && (
                <details className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                    <summary>Details</summary>
                    <pre className="mt-1 p-1.5 bg-muted/50 text-muted-foreground text-[10px] rounded overflow-x-auto">
                        {output}
                    </pre>
                </details>
            )}
        </div>
    );
}

export function formatPortScanEvent(event: SimulationEvent) {
    const { event_type, data } = event;
    if (!data) return null;

    switch (event_type) {
        case 'PORT_DETECTED':
            return (
                <div className="flex items-center space-x-2">
                    <EventIcon type={event_type} />
                    <span>
                        Port <code className="font-mono text-xs bg-muted p-0.5 rounded">{data.port}</code>
                        {data.service && <span className="text-muted-foreground"> ({data.service})</span>}
                        {data.protocol && <span className="text-muted-foreground"> {data.protocol}</span>}
                    </span>
                </div>
            );
        case 'SCAN_COMPLETE':
            return (
                <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                        <EventIcon type={event_type} />
                        <span>Scan completed</span>
                        <span className="text-muted-foreground text-xs">
                            Found {data.open_ports?.length || 0} open ports
                        </span>
                    </div>
                    {data.open_ports && (
                        <div className="text-xs text-muted-foreground pl-6">
                            Open ports: {data.open_ports.join(', ')}
                        </div>
                    )}
                </div>
            );
        default:
            return formatDefaultEvent(event);
    }
}

export function formatMITMEvent(event: SimulationEvent) {
    const { event_type, data } = event;
    if (!data) return null;

    switch (event_type) {
        case 'NETWORK_STATE':
            return (
                <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                        <EventIcon type={event_type} />
                        <span>{data.message}</span>
                    </div>
                    <details className="text-xs pl-6">
                        <summary className="cursor-pointer hover:text-foreground">ARP Tables</summary>
                        <pre className="mt-1 p-1.5 bg-muted/50 text-muted-foreground rounded overflow-x-auto">
                            {Object.entries(data).filter(([key]) => key !== 'message').map(([host, table]) => 
                                `${host}:\n${table}`
                            ).join('\n')}
                        </pre>
                    </details>
                </div>
            );
        case 'ATTACK_RESULT':
            return (
                <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                        <EventIcon type={event_type} />
                        <span>Attack Results</span>
                        <span className="text-muted-foreground text-xs">
                            {data.intercepted_packets} packets intercepted
                        </span>
                    </div>
                    {data.capture_summary && (
                        <details className="text-xs pl-6">
                            <summary className="cursor-pointer hover:text-foreground">Capture Summary</summary>
                            <pre className="mt-1 p-1.5 bg-muted/50 text-muted-foreground rounded overflow-x-auto">
                                {data.capture_summary}
                            </pre>
                        </details>
                    )}
                </div>
            );
        default:
            return formatDefaultEvent(event);
    }
}

export function formatDDoSEvent(event: SimulationEvent) {
    const { event_type, data } = event;
    if (!data) return null;

    switch (event_type) {
        case 'PERFORMANCE_METRIC':
            return (
                <div className="flex items-center space-x-2">
                    <EventIcon type={event_type} />
                    <span>{data.message}</span>
                    {data.phase && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            {data.phase}
                        </span>
                    )}
                    {data.change_percent && (
                        <span className={`text-xs font-medium ${
                            data.change_percent > 100 ? 'text-red-600' : 
                            data.change_percent > 50 ? 'text-yellow-600' : 
                            'text-green-600'
                        }`}>
                            {data.change_percent > 0 ? '+' : ''}{data.change_percent.toFixed(1)}%
                        </span>
                    )}
                </div>
            );
        case 'ATTACK_IMPACT':
            return (
                <div className="flex items-center space-x-2">
                    <EventIcon type={event_type} />
                    <span className="text-red-600 font-medium">{data.message}</span>
                </div>
            );
        default:
            return formatDefaultEvent(event);
    }
}

export function formatPacketSniffingEvent(event: SimulationEvent) {
    const { event_type, data } = event;
    if (!data) return null;

    switch (event_type) {
        case 'SNIFF_RESULT':
            return (
                <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                        <EventIcon type={event_type} />
                        <span>Packet Analysis Complete</span>
                        <span className="text-muted-foreground text-xs">
                            {data.total_packets} packets captured
                        </span>
                    </div>
                    {data.protocol_stats && (
                        <div className="grid grid-cols-2 gap-2 pl-6 text-xs">
                            {Object.entries(data.protocol_stats as Record<string, number>).map(([protocol, count]) => (
                                <div key={protocol} className="flex items-center justify-between">
                                    <span className="text-muted-foreground">{protocol}:</span>
                                    <span className="font-medium">{count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        case 'PROTOCOL_DETECTED':
            return (
                <div className="flex items-center space-x-2">
                    <EventIcon type={event_type} />
                    <span>{data.message}</span>
                    {data.percentage && (
                        <span className="text-xs text-muted-foreground">
                            ({data.percentage.toFixed(1)}% of traffic)
                        </span>
                    )}
                </div>
            );
        default:
            return formatDefaultEvent(event);
    }
}

export function formatSimulationStatusEvent(event: SimulationEvent) {
    const { event_type, data } = event;
    if (!data) return null;

    // Handle nested message structure
    const messageObj = typeof data === 'string' ? { message: data } : data;
    const message = typeof messageObj.message === 'string' ? messageObj.message : 
                   typeof messageObj.message === 'object' && messageObj.message.message ? messageObj.message.message :
                   JSON.stringify(messageObj);
    
    return (
        <div className="flex items-center space-x-2">
            <EventIcon type={event_type} />
            <span className={`${event_type === 'SIMULATION_ERROR' ? 'text-red-600' : 'text-muted-foreground'}`}>
                {event_type === 'SIMULATION_START' && 'Starting simulation...'}
                {event_type === 'SCRIPT_START' && 'Running simulation script...'}
                {event_type === 'SIMULATION_END' && 'Simulation completed successfully'}
                {event_type === 'SCRIPT_COMPLETE' && 'Script execution completed'}
                {event_type === 'SIMULATION_ERROR' && 'Simulation failed'}
                {event_type === 'SCRIPT_ERROR' && 'Script execution failed'}
                {event_type === 'SIMULATION_INFO' && message}
                {!['SIMULATION_START', 'SIMULATION_END', 'SCRIPT_START', 'SCRIPT_COMPLETE', 'SIMULATION_ERROR', 'SCRIPT_ERROR', 'SIMULATION_INFO'].includes(event_type) && message}
            </span>
            {(event_type === 'SIMULATION_ERROR' || event_type === 'SCRIPT_ERROR') && data.error_details && (
                <details className="text-xs text-red-600">
                    <summary className="cursor-pointer hover:text-red-700">Error Details</summary>
                    <pre className="mt-1 p-1.5 bg-red-50 rounded overflow-x-auto">
                        {data.error_details}
                    </pre>
                </details>
            )}
        </div>
    );
}

export function formatDefaultEvent(event: SimulationEvent) {
    const { event_type, data } = event;
    if (!data) return null;

    const message = extractMessageContent(data);
    
    return (
        <div>
            <div className="flex items-center space-x-2 mb-1">
                <EventIcon type={event_type} />
                <span className="font-medium">{event_type}</span>
            </div>
            <div className="text-muted-foreground">
                {message}
            </div>
            {typeof data === 'object' && Object.keys(data).length > 1 && (
                <details className="text-xs mt-1">
                    <summary className="cursor-pointer hover:text-foreground">Additional Details</summary>
                    <pre className="mt-1 p-1.5 bg-muted/50 text-muted-foreground rounded overflow-x-auto">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </details>
            )}
        </div>
    );
}

type BadgeVariant = "default" | "destructive" | "outline" | "secondary";
export function getBadgeVariant(eventType: string): BadgeVariant {
    if (eventType === 'SIMULATION_ERROR' || eventType === 'SCRIPT_ERROR' || eventType.includes('FAIL')) return "destructive";
    if (eventType === 'SIMULATION_WARNING' || eventType.includes('DOWN')) return "destructive";
    if (eventType === 'ATTACK_START' || eventType === 'ATTACK_IMPACT') return "destructive";
    if (eventType === 'PORT_DETECTED' || eventType === 'PERFORMANCE_WARNING') return "destructive";
    if (eventType === 'NODE_ADD' || eventType === 'LINK_ADD') return "default"; 
    if (eventType === 'SIMULATION_START' || eventType === 'SCRIPT_START') return "default";
    if (eventType === 'SIMULATION_END' || eventType === 'SCRIPT_COMPLETE') return "secondary";
    if (eventType === 'ATTACK_END' || eventType === 'SCAN_COMPLETE') return "secondary";
    if (eventType === 'SIMULATION_INFO') return "outline";
    if (eventType === 'PING_RESULT') return "outline";
    if (eventType === 'PERFORMANCE_METRIC') return "outline";
    return "secondary";
} 