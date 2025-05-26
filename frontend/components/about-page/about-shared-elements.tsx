"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Calculator, CheckCircle } from "lucide-react"

export const SectionTitle = ({ children }: { children: React.ReactNode }) => (
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

export const Subtitle = ({ children }: { children: React.ReactNode }) => (
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

export const Paragraph = ({ children, className }: { children: React.ReactNode, className?: string }) => (
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

export const FormulaBox = ({ children, title }: { children: React.ReactNode, title: string }) => (
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

export const ListItem = ({ children }: { children: React.ReactNode }) => (
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
