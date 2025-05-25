"use client"

import { motion } from "framer-motion"
import { ShieldAlert, Route, BarChart3, Brain, Zap, Database, Network, Activity } from "lucide-react"
import SectionBadge from "@/components/ui/section-badge"
import { cn } from "@/lib/utils"

const features = [
  {
    title: "Machine Learning-Based Intrusion Detection",
    info: "Utilizes machine learning models for real-time detection of diverse network threats, including DDoS, MitM, and ransomware attacks.",
    icon: ShieldAlert,
    gradient: "from-red-500 to-orange-500",
  },
  {
    title: "Security-Aware Routing (SAR-Dijkstra)",
    info: "Dynamically optimizes network paths based on real-time security metrics, aiming to ensure data integrity and Quality of Service.",
    icon: Route,
    gradient: "from-blue-500 to-sky-500",
  },
  {
    title: "Interactive Visualization Dashboard",
    info: "Provides insights into network traffic, detected threats, and routing decisions through a comprehensive, user-friendly interface for analysis.",
    icon: BarChart3,
    gradient: "from-green-500 to-teal-500",
  },
  {
    title: "Comprehensive Threat Pattern Analysis",
    info: "Analysis of network traffic patterns to identify and classify malicious flows, leveraging detailed feature engineering techniques.",
    icon: Brain, 
    gradient: "from-purple-500 to-violet-500",
  },
  {
    title: "Automated Mitigation via SDN Integration",
    info: "Integration with Software-Defined Networking (SDN) controllers for the automated deployment of flow rules to mitigate identified threats.",
    icon: Zap,
    gradient: "from-yellow-500 to-amber-500",
  },
  {
    title: "Scalable and Modular Design Considerations",
    info: "The framework is designed with considerations for scalability and modularity, potentially employing a microservices-based approach for efficient resource utilization.",
    icon: Database, 
    gradient: "from-pink-500 to-rose-500",
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-24 lg:py-32"> 
      <div className="text-center">
        <SectionBadge title="Key Framework Features" />
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-8 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
        >
          Overview of Implemented Features
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
        >
          This framework integrates several key components to address challenges in network security, focusing on machine learning for detection, adaptive routing, and comprehensive visualization.
        </motion.p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="mt-16 grid grid-cols-1 gap-6 sm:mt-20 sm:grid-cols-2 lg:mt-24 lg:grid-cols-3"
      >
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              variants={item}
              className={cn(
                "group relative overflow-hidden rounded-2xl bg-gradient-to-b from-muted/50 to-muted p-8",
                "ring-1 ring-foreground/10 backdrop-blur-xl transition-all duration-300 hover:ring-foreground/20",
                "dark:from-muted/30 dark:to-background/80"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br",
                  feature.gradient,
                  "ring-1 ring-foreground/10"
                )}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
              </div>
              <p className="mt-4 text-muted-foreground">
                {feature.info}
              </p>
              <div className={cn(
                "absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r",
                feature.gradient,
                "opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              )} />
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  )
} 