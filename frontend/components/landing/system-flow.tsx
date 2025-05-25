import { motion } from "framer-motion"
import { Network, Settings2, ShieldAlert, Gauge, Route, Zap, BarChart3, Shuffle, ListChecks, Brain, Activity, GitFork, TerminalSquare, Eye } from "lucide-react"
import Image from "next/image"

const flowSteps = [
  {
    title: "Network Traffic Ingestion",
    description: "Real-time capture of network packets from designated interfaces or virtual switches (e.g., Open vSwitch) for analysis.",
    icon: Network, // Or Shuffle
    gradient: "from-sky-500 via-cyan-500 to-blue-500",
    shadowColor: "shadow-sky-500/25",
  },
  // {
  //   title: "Packet Feature Extraction",
  //   description: "Raw packet data is processed to extract key features (e.g., protocol, port numbers, packet length, flow duration) relevant for intrusion detection.",
  //   icon: Settings2, // Or ListChecks
  //   gradient: "from-blue-500 via-indigo-500 to-violet-500",
  //   shadowColor: "shadow-blue-500/25",
  // },
  {
    title: "Intrusion Detection (ML Analysis)",
    description: "Machine learning models (e.g., Decision Tree, Random Forest) classify network flows to identify anomalies and potential threats based on extracted features.",
    icon: ShieldAlert, // Or Brain
    gradient: "from-green-500 via-emerald-500 to-teal-500",
    shadowColor: "shadow-green-500/25",
  },
  {
    title: "Security Metric Calculation",
    description: "Aggregate security metrics are computed based on IDS alerts, traffic characteristics, and node-specific parameters to quantify network risk levels.",
    icon: Gauge, // Or Activity
    gradient: "from-purple-500 via-violet-500 to-indigo-500",
    shadowColor: "shadow-purple-500/25",
  },
  {
    title: "SAR-Dijkstra Path Computation",
    description: "The Security-Aware Routing algorithm (SAR-Dijkstra) calculates optimal forwarding paths considering the latest security metrics and network topology.",
    icon: Route, // Or GitFork
    gradient: "from-orange-500 via-amber-500 to-yellow-500",
    shadowColor: "shadow-orange-500/25",
  },
  {
    title: "Flow Rule Deployment (SDN)",
    description: "Calculated routes are translated into flow rules and deployed to network devices (e.g., switches) via an SDN controller interface.",
    icon: Zap, // Or TerminalSquare
    gradient: "from-red-500 via-rose-500 to-pink-500",
    shadowColor: "shadow-red-500/25",
  },
  {
    title: "Visualization & Monitoring",
    description: "The system's state, including traffic patterns, detected threats, and active routes, is presented on an interactive dashboard for monitoring and analysis.",
    icon: BarChart3, // Or Eye
    gradient: "from-pink-500 via-fuchsia-500 to-purple-500",
    shadowColor: "shadow-pink-500/25",
  },
]

export function SystemFlow() {
  return (
    <section className="py-20 sm:py-24 lg:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Framework Operational Flow
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          An overview of the sequential processing stages within the proposed network security framework, from data acquisition to responsive action and visualization.
        </p>
      </motion.div>

      <div className="mt-16 grid gap-8 lg:grid-cols-3 xl:grid-cols-3">
        {flowSteps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative group"
          >
            <div 
              className={`
                h-full rounded-2xl p-1 transition-all duration-300 
                bg-gradient-to-br ${step.gradient} opacity-75 hover:opacity-100
                hover:scale-[1.02] hover:-translate-y-1
              `}
            >
              <div className="h-full rounded-xl bg-background/90 p-6 backdrop-blur-xl">
                <div className={`
                  size-14 rounded-lg bg-gradient-to-br ${step.gradient}
                  flex items-center justify-center ${step.shadowColor}
                  shadow-lg transition-shadow duration-300 group-hover:shadow-xl
                `}>
                  <step.icon className="size-7 text-white" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed text-sm">{step.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="relative mx-auto mt-16 sm:mt-20 lg:mt-24"
      >
        <div className="relative rounded-2xl bg-gradient-to-b from-muted/50 to-muted p-2 ring-1 ring-foreground/10 backdrop-blur-3xl dark:from-muted/30 dark:to-background/80">
          <Image
            src="/nv-architecture.png" // Placeholder - REPLACE THIS IMAGE
            alt="Architectural Diagram of the Network Security Research Framework"
            width={1200}
            height={700} // Adjusted height for a typical architecture diagram aspect ratio
            quality={100}
            className="rounded-xl shadow-2xl ring-1 ring-foreground/10 transition-all duration-300"
          />
        </div>
      </motion.div>
    </section>
  )
}