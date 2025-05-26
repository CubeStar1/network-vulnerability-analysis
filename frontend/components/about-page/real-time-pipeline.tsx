"use client"

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, RefreshCw, Database, Cpu } from "lucide-react";
import { SectionTitle, Subtitle, Paragraph, ListItem } from "./about-shared-elements";

export const RealTimePipeline = () => {
  return (
    <>
      <SectionTitle>Real-time Security Risk Score Pipeline</SectionTitle>

      <Card className="mb-12 bg-card/80 backdrop-blur-lg shadow-xl border-border/30">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><Zap className="mr-3 h-7 w-7 text-sky-500" />Dynamic Risk Assessment</CardTitle>
          <CardDescription className="text-md">
            How SAR-Dijkstra adapts to evolving network conditions through a real-time pipeline.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Paragraph>
            A critical aspect of modern network security is the ability to adapt to dynamically changing conditions and threats. The SAR-Dijkstra algorithm, particularly when integrated with Machine Learning-based security cost (s(e)) generation, relies on a real-time pipeline to ensure that routing decisions are based on the most current risk assessments. This pipeline forms a continuous loop, enabling proactive and adaptive network defense.
          </Paragraph>
          
          <Subtitle>Key Stages of the Real-time Pipeline:</Subtitle>
          <ol className="list-none pl-0 mb-6 space-y-6">
            <ListItem>
              <div className="flex items-start">
                <Cpu className="mr-4 h-8 w-8 text-sky-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground text-xl mb-1">1. Live Traffic Capture & Feature Extraction</h4>
                  <Paragraph className="!mb-0 !text-base">
                    Network traffic is continuously monitored at strategic points (e.g., routers, switches). Relevant flow features (e.g., source/destination IPs and ports, protocols, packet/byte counts, TCP flags, flow duration) are extracted in real-time. This data forms the input for the security risk model.
                  </Paragraph>
                </div>
              </div>
            </ListItem>
            <ListItem>
              <div className="flex items-start">
                <Database className="mr-4 h-8 w-8 text-sky-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground text-xl mb-1">2. ML Model Processing & Score Generation</h4>
                  <Paragraph className="!mb-0 !text-base">
                    The extracted features are fed into the pre-trained Machine Learning model. This model processes the input and generates a security risk score (s(e)) for each relevant network edge or flow. This score quantifies the current security posture or threat level associated with that specific path segment.
                  </Paragraph>
                </div>
              </div>
            </ListItem>
            <ListItem>
              <div className="flex items-start">
                <RefreshCw className="mr-4 h-8 w-8 text-sky-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground text-xl mb-1">3. Continuous Score Updates & Availability</h4>
                  <Paragraph className="!mb-0 !text-base">
                    The generated s(e) scores are continuously updated and made available to the SAR-Dijkstra algorithm. This could be through a shared database, a messaging queue, or direct API calls. The frequency of updates depends on the network's dynamism and the desired responsiveness.
                  </Paragraph>
                </div>
              </div>
            </ListItem>
            <ListItem>
              <div className="flex items-start">
                <Zap className="mr-4 h-8 w-8 text-sky-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground text-xl mb-1">4. SDN Controller Triggered Re-computation</h4>
                  <Paragraph className="!mb-0 !text-base">
                    An SDN (Software-Defined Networking) controller, which manages the network's forwarding plane, monitors these s(e) scores. When significant changes in security scores are detected, or periodically, the SDN controller triggers the SAR-Dijkstra algorithm to re-compute optimal paths. The updated routing policies are then pushed down to the network devices.
                  </Paragraph>
                </div>
              </div>
            </ListItem>
          </ol>
          <Paragraph>
            This closed-loop system ensures that the network's routing strategy remains aligned with the current security landscape, providing a robust and adaptive defense mechanism against evolving cyber threats.
          </Paragraph>
        </CardContent>
      </Card>
    </>
  );
};
