"use client"

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThumbsUp, ShieldAlert, TrendingUp, Zap } from "lucide-react";
import { SectionTitle, Paragraph, ListItem } from "./about-shared-elements";

export const SarBenefits = () => {
  return (
    <>
      <SectionTitle>Benefits and Implications</SectionTitle>

      <Card className="mb-12 bg-card/80 backdrop-blur-lg shadow-xl border-border/30">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><ThumbsUp className="mr-3 h-7 w-7 text-sky-500" />Advantages of SAR-Dijkstra</CardTitle>
        </CardHeader>
        <CardContent>
          <Paragraph>
            Implementing Security-Aware Routing, particularly with an adaptive algorithm like SAR-Dijkstra, offers several significant advantages for network security and management:
          </Paragraph>
          <ul className="list-none pl-0 space-y-4">
            <ListItem>
              <div className="flex items-start">
                <ShieldAlert className="mr-3 h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground text-lg mb-1">Enhanced Threat Mitigation</h4>
                  <span className="text-muted-foreground">
                    By actively considering security metrics, SAR helps in proactively avoiding paths that are vulnerable or currently under threat, reducing the likelihood of successful attacks.
                  </span>
                </div>
              </div>
            </ListItem>
            <ListItem>
              <div className="flex items-start">
                <TrendingUp className="mr-3 h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground text-lg mb-1">Improved Network Resilience</h4>
                  <span className="text-muted-foreground">
                    The ability to dynamically re-route traffic based on real-time security assessments makes the network more resilient to failures and attacks, ensuring service continuity.
                  </span>
                </div>
              </div>
            </ListItem>
            <ListItem>
              <div className="flex items-start">
                <Zap className="mr-3 h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground text-lg mb-1">Dynamic Adaptation</h4>
                  <span className="text-muted-foreground">
                    Integration with real-time threat intelligence and ML-based scoring allows the network to adapt its routing policies swiftly in response to evolving threat landscapes.
                  </span>
                </div>
              </div>
            </ListItem>
            <ListItem>
              <div className="flex items-start">
                <ThumbsUp className="mr-3 h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground text-lg mb-1">Granular Policy Control</h4>
                  <span className="text-muted-foreground">
                    Administrators can fine-tune the balance between security and performance using weighting factors (&alpha; and &beta;), aligning network behavior with organizational priorities.
                  </span>
                </div>
              </div>
            </ListItem>
          </ul>
        </CardContent>
      </Card>
    </>
  );
};
