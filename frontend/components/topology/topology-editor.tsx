'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  NodeChange,
  EdgeChange,
  Connection,
  ReactFlowProvider,
  XYPosition,
  EdgeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { toast } from "sonner"
import { submitTopology, TopologyPayload } from "@/lib/api/simulation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { NetworkNode } from './custom-nodes';
import { NetworkEdge } from './custom-edges';
import { useSimulation } from '@/lib/contexts/simulation-context';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const HOST_IMG_URL = '/host.jpg';
const SWITCH_IMG_URL = '/switch.png';

const initialNodes: Node[] = [
  { id: 'h1', type: 'networkNode', data: { label: 'Host h1', imageUrl: HOST_IMG_URL }, position: { x: 100, y: 100 } },
  { id: 's1', type: 'networkNode', data: { label: 'Switch s1', imageUrl: SWITCH_IMG_URL }, position: { x: 300, y: 100 } },
  { id: 'h2', type: 'networkNode', data: { label: 'Host h2', imageUrl: HOST_IMG_URL }, position: { x: 500, y: 100 } },
];

const initialEdges: Edge[] = [
  { id: 'h1-s1', source: 'h1', target: 's1', type: 'networkEdge', animated: true },
  { id: 's1-h2', source: 's1', target: 'h2', type: 'networkEdge', animated: true },
];

const availableScripts = [
  { value: "basic_ping", label: "Basic Ping Test" },
  { value: "port_scan", label: "Port Scanning Simulation" },
  { value: "ddos_attack", label: "DDoS Attack Simulation" },
  { value: "mitm_attack", label: "Man-in-the-Middle Attack" },
  { value: "traffic_analysis", label: "Network Traffic Analysis" },
  { value: "packet_sniffing", label: "Packet Sniffing Detection" },
  { value: "bandwidth_test", label: "Bandwidth & Latency Test" },
  { value: "spoofing", label: "ARP Spoofing Attack" },
  { value: "security_monitor", label: "Security Monitor" },
];

function formatTopologyForBackend(nodes: Node[], edges: Edge[]): TopologyPayload {
  const backendNodes = nodes.map(node => ({
    id: node.id,
    type: node.id.startsWith('h') ? 'host' : 'switch' as 'host' | 'switch',
    params: {},
    position: node.position as XYPosition,
  }));

  const backendLinks = edges.map(edge => ({
    source: edge.source,
    target: edge.target,
    params: {}
  }));

  return { nodes: backendNodes, links: backendLinks };
}

function TopologyEditorFlow() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedScript, setSelectedScript] = useState<string>(availableScripts[0].value);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { setSelectedRunId, topology } = useSimulation();
  const [isInteractive, setIsInteractive] = useState(true);

  const nodeTypes = useMemo(() => ({ networkNode: NetworkNode }), []);
  const handleRemoveEdge = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((e) => e.id !== edgeId));
  }, []);

  const edgeTypes = useMemo(() => ({
    networkEdge: (props: EdgeProps) => (
      <NetworkEdge
        {...props}
        animated={true}
      />
    ),
  }), []);

  // Convert topology from context to ReactFlow format when available
  useEffect(() => {
    if (topology) {
      const newNodes = topology.nodes.map(node => ({
        id: node.id,
        type: 'networkNode',
        data: {
          label: `${node.type.charAt(0).toUpperCase() + node.type.slice(1)} ${node.id}`,
          imageUrl: node.type === 'host' ? HOST_IMG_URL : SWITCH_IMG_URL
        },
        position: node.position,
      }));

      const newEdges = topology.links.map(link => ({
        id: `${link.source}-${link.target}`,
        source: link.source,
        target: link.target,
        type: 'networkEdge',
        animated: true
      }));

      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [topology]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      const edgeId = `${connection.source}-${connection.target}`;
      setEdges((eds) => addEdge({
        ...connection,
        id: edgeId,
        type: 'networkEdge',
        animated: true
      }, eds));
    },
    []
  );

  const handleAddNode = (type: 'host' | 'switch') => {
    const typePrefix = type.charAt(0);
    let i = 1;
    while (nodes.some(n => n.id === `${typePrefix}${i}`)) {
      i++;
    }
    const newNodeId = `${typePrefix}${i}`;
    
    const position = {
      x: Math.random() * 500 + 100,
      y: Math.random() * 300 + 100,
    };

    const newNode: Node = {
      id: newNodeId,
      type: 'networkNode',
      data: {
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${newNodeId}`,
        imageUrl: type === 'host' ? HOST_IMG_URL : SWITCH_IMG_URL
      },
      position,
    };
    setNodes((nds) => nds.concat(newNode));
  };

  // Clear all nodes and edges
  const handleClearCanvas = () => {
    setNodes([]);
    setEdges([]);
  };

  const handleSubmit = async () => {
    const topologyPayload = formatTopologyForBackend(nodes, edges);
    try {
      const result = await submitTopology(topologyPayload, selectedScript);
      setSelectedRunId(result.run_id);
      toast.success(`Topology submitted (Run ID: ${result.run_id})`);
    } catch (error) {
      console.error('Error submitting topology:', error);
      toast.error(`Error submitting topology: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const isFrozen = !isInteractive;

  return (
    <div className="w-full h-full border rounded-lg relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={isFrozen ? undefined : onNodesChange}
        onEdgesChange={isFrozen ? undefined : onEdgesChange}
        onConnect={isFrozen ? undefined : onConnect}
        fitView
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
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
      >
        <Controls onInteractiveChange={setIsInteractive} />
        <Background />
      </ReactFlow>
      <TooltipProvider delayDuration={0}>
        <div className="absolute top-2 left-2 z-10 flex items-center space-x-2 pl-2 bg-background/80 backdrop-blur-sm rounded-lg border">
          <Button size="sm" onClick={() => handleAddNode('host')}>Add Host</Button>
          <Button size="sm" onClick={() => handleAddNode('switch')}>Add Switch</Button>
          <Button size="sm" variant="secondary" onClick={handleClearCanvas}>Clear Canvas</Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="ml-1 p-1 rounded-full hover:bg-muted transition-colors">
                <Info size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
            Use Delete or Backspace to remove selected nodes/edges
            </TooltipContent>
          </Tooltip>
          {/* Main script selection and submit area */}
          <div className="flex items-center space-x-3 px-4 bg-primary/10 rounded-lg border-2 border-primary shadow-md ml-4">
            <Label htmlFor="sim-script" className="text-base font-semibold text-primary">Script:</Label>
            <Select value={selectedScript} onValueChange={setSelectedScript}>
              <SelectTrigger id="sim-script" className="h-8 w-[170px] text-base font-semibold border-primary focus:ring-2 focus:ring-primary">
                <SelectValue placeholder="Select script" />
              </SelectTrigger>
              <SelectContent>
                {availableScripts.map(script => (
                  <SelectItem key={script.value} value={script.value} className="text-base">
                    {script.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="default"
              className="m-2 text-base font-semibold bg-primary text-white hover:bg-primary/90 border-2 border-primary shadow"
              variant="default"
              onClick={handleSubmit}
            >
              Submit Topology
            </Button>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}

export function TopologyEditor() {
  return (
    <ReactFlowProvider>
      <TopologyEditorFlow />
    </ReactFlowProvider>
  );
} 