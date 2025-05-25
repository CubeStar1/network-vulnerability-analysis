"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import SectionBadge from "@/components/ui/section-badge"
import { cn } from "@/lib/utils"

const featureDetails = [
  {
    title: "Machine Learning-Based Intrusion Detection System (IDS)",
    description:
      "The proposed IDS employs machine learning models to identify and classify various network threats in real-time, including DDoS, Man-in-the-Middle, and ransomware attacks. The system is designed for continuous learning and adaptation to novel threat vectors, aiming for high detection accuracy and minimal false positives to maintain network integrity.",
    imageSrc: "/nv-dash.png", 
    imageAlt: "Diagram or dashboard representation of the Intrusion Detection System's architecture and alert mechanisms",
  },
  {
    title: "Dynamic Security-Aware Routing (SAR-Dijkstra)",
    description:
      "The SAR-Dijkstra protocol is implemented to dynamically select optimal data transmission paths. It evaluates routes based on a combination of real-time security metrics, network latency, available bandwidth, and node trustworthiness. This approach aims to ensure data integrity, enhance resilience against path-based attacks, and maintain Quality of Service under diverse network conditions.",
    imageSrc: "/nv-topology.png", 
    imageAlt: "Visualization of the SAR-Dijkstra algorithm selecting secure network paths based on defined metrics",
  },
  {
    title: "Interactive Network Traffic Visualization Module",
    description:
      "A key component of this research is an interactive visualization dashboard designed to provide comprehensive insights into network operations. It allows for real-time monitoring of traffic flows, graphical analysis of detected threats (e.g., on topological maps), and clear representation of routing decisions. This module facilitates enhanced situational awareness, aids in rapid incident response, and supports network policy refinement and forensic investigations.",
    imageSrc: "/nv-routing-alg.png", 
    imageAlt: "Interface of the interactive network traffic visualization dashboard showing data flows and security events",
  },
]

export function FeatureDetails() {
  return (
    <section className="py-20 sm:py-24 lg:py-32">
      <div className="text-center">
        <SectionBadge title="Framework Components" />
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-8 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
        >
          Core Components of the Research Framework
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
        >
          This section details the primary modules developed as part of this research, outlining their functionalities and contributions to the overall network security framework.
        </motion.p>
      </div>

      <div className="mt-16 space-y-16 sm:mt-20 lg:mt-24 lg:space-y-24">
        {featureDetails.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className={cn(
              "group grid grid-cols-1 items-center gap-8 rounded-2xl bg-gradient-to-b from-muted/50 to-muted p-8 ring-1 ring-foreground/10 backdrop-blur-xl lg:grid-cols-2 lg:gap-16",
              "dark:from-muted/30 dark:to-background/80"
            )}
          >
            <div className={cn("lg:order-last", { "lg:order-first": index % 2 === 1 })}>
              <div className="relative overflow-hidden rounded-xl shadow-2xl ring-1 ring-foreground/10 transition-all duration-300 group-hover:ring-foreground/20">
                <Image
                  src={feature.imageSrc}
                  alt={feature.imageAlt}
                  width={600}
                  height={400}
                  quality={100}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-foreground sm:text-3xl">
                {feature.title}
              </h3>
              <p className="text-muted-foreground lg:text-lg">
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}