'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DijkstraSimulator } from "./dijkstra/dijkstra-simulator";
import { BellmanFordSimulator } from "./bellman-ford/bellman-ford-simulator";

export function RoutingAlgorithmSimulator() {
  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="dijkstra" className="flex-grow flex flex-col">
        <TabsList className="grid grid-cols-2 gap-2 mx-4 mt-1">
          <TabsTrigger value="dijkstra">Dijkstra's Algorithm</TabsTrigger>
          <TabsTrigger value="bellman-ford">Bellman-Ford Algorithm</TabsTrigger>
        </TabsList>
        <TabsContent value="dijkstra" className="flex-grow mt-1">
          <DijkstraSimulator />
        </TabsContent>
        <TabsContent value="bellman-ford" className="flex-grow mt-1">
          <BellmanFordSimulator />
        </TabsContent>
      </Tabs>
    </div>
  );
} 