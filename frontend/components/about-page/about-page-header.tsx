"use client"

import React from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

export const AboutPageHeader = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="text-center mb-16"
    >
      <Link href="/" className="inline-block mb-6">
        <Image src="/nv-icon.jpg" alt="Framework Logo" width={80} height={80} className="rounded-2xl shadow-md" />
      </Link>
      <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
        Understanding <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">Security-Aware Routing</span>
      </h1>
    </motion.div>
  );
};
