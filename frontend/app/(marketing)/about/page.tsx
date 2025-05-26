"use client"

import { motion } from "framer-motion"
import { ArrowRight, CheckCircle, Network, Brain, ShieldCheck, BarChart3, Calculator, Lightbulb } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GridPattern } from "@/components/magicui/grid-pattern"

import { AboutPageHeader } from "@/components/about-page/about-page-header";
import { IntroductionSar } from "@/components/about-page/introduction-sar";
import { SarDijkstraDetails } from "@/components/about-page/sar-dijkstra-details";
import { SarIllustrativeExample } from "@/components/about-page/sar-illustrative-example";
import { RealTimePipeline } from "@/components/about-page/real-time-pipeline";
import { SarBenefits } from "@/components/about-page/sar-benefits";
import { AboutPageConclusion } from "@/components/about-page/about-page-conclusion";

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <motion.h2 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: 0.1 }}
    className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl mb-8 text-center bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-500 bg-clip-text text-transparent"
  >
    {children}
  </motion.h2>
);

const Subtitle = ({ children }: { children: React.ReactNode }) => (
  <motion.h3 
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: 0.2 }}
    className="text-2xl font-semibold text-foreground mt-10 mb-6"
  >
    {children}
  </motion.h3>
);

const Paragraph = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <motion.p 
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: 0.3 }}
    className={cn("text-lg text-muted-foreground leading-relaxed mb-6", className)}
  >
    {children}
  </motion.p>
);

const FormulaBox = ({ children, title }: { children: React.ReactNode, title: string }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: 0.2 }}
    className="my-8 p-6 bg-muted/50 rounded-xl shadow-lg border border-border/20"
  >
    <h4 className="text-xl font-semibold text-foreground mb-4 flex items-center">
      <Calculator className="mr-3 h-6 w-6 text-sky-500" /> {title}
    </h4>
    <div className="text-lg text-foreground overflow-x-auto">
      {children}
    </div>
  </motion.div>
);

const ListItem = ({ children }: { children: React.ReactNode }) => (
  <motion.li 
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: 0.1 }}
    className="flex items-start mb-3 text-muted-foreground text-lg"
  >
    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
    <span>{children}</span>
  </motion.li>
);

export default function AboutSARPage() {
  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 bg-background text-foreground">
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <AboutPageHeader />
      <IntroductionSar />
      <SarDijkstraDetails />
      <SarIllustrativeExample />
      <RealTimePipeline />
      <SarBenefits />
      <AboutPageConclusion />
      </div>
    </div>
  );
}
