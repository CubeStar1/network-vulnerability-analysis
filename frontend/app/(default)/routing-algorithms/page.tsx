import { RoutingAlgorithmSimulator } from "@/components/routing-algorithms/routing-algorithm-simulator";

export default function RoutingAlgorithmsPage() {
    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 flex flex-col h-[calc(100vh-var(--header-height,60px))] -mt-10">
            <h1 className="text-3xl font-bold tracking-tight mb-3 flex-shrink-0">Routing Algorithm Simulator</h1>
            <div className="flex-grow min-h-0">
                 <RoutingAlgorithmSimulator />
            </div>
        </div>
    );
}
