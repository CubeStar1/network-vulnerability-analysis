"use client"

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Network } from "lucide-react";
import { Paragraph } from "./about-shared-elements";

export const IntroductionSar = () => {
  return (
    <Card className="mb-12 bg-card/80 backdrop-blur-lg shadow-xl border-border/30">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center"><Network className="mr-3 h-7 w-7 text-sky-500" />Introduction to Security-Aware Routing (SAR)</CardTitle>
        <CardDescription className="text-md">
          Why traditional routing isn't enough in today's threat landscape.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Paragraph>
          Traditional routing protocols, such as OSPF and RIP, primarily focus on finding the shortest path based on metrics like hop count or link bandwidth. While efficient for general data delivery, they often overlook crucial security aspects. In an era of sophisticated cyber-attacks, a compromised network path can lead to data breaches, service disruptions, and significant financial losses.
        </Paragraph>
        <Paragraph>
          Security-Aware Routing (SAR) addresses this gap by incorporating security metrics into the path selection process. The goal is to identify routes that not only meet performance requirements but also offer enhanced resilience against various threats. This involves evaluating factors like node trustworthiness, link vulnerability, and historical attack data.
        </Paragraph>
      </CardContent>
    </Card>
  );
};
