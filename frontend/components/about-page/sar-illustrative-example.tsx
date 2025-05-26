"use client"

import React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { SectionTitle, Subtitle, Paragraph, ListItem } from "./about-shared-elements";

export const SarIllustrativeExample = () => {
  return (
    <>
      <SectionTitle>Illustrative Example</SectionTitle>

      <Card className="mb-12 bg-card/80 backdrop-blur-lg shadow-xl border-border/30">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><BarChart3 className="mr-3 h-7 w-7 text-sky-500" />Scenario Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Paragraph>
            Consider a simple network with nodes A, B, C, D, and E. We want to find the most secure and efficient path from A to E. Let's assume &alpha; = 0.4 (performance weight) and &beta; = 0.6 (security weight).
          </Paragraph>
          <div className="my-8 flex justify-center">
            <Image src="/sample-topo.png" alt="Sample Network Diagram for SAR-Dijkstra" width={600} height={400} className="rounded-lg shadow-md border border-border/20" />
          </div>
          
          <Subtitle>Link Costs:</Subtitle>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max text-left text-muted-foreground my-6">
              <thead className="border-b border-border/30">
                <tr>
                  <th className="p-3 font-semibold text-foreground">Link</th>
                  <th className="p-3 font-semibold text-foreground">Perf_Cost (P)</th>
                  <th className="p-3 font-semibold text-foreground">Sec_Cost (S)</th>
                  <th className="p-3 font-semibold text-foreground">Calculated Cost (0.4P + 0.6S)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                  <td className="p-3">A-B</td><td className="p-3">2</td><td className="p-3">7</td><td className="p-3">0.4*2 + 0.6*7 = 0.8 + 4.2 = <strong>5.0</strong></td>
                </tr>
                <tr className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                  <td className="p-3">A-C</td><td className="p-3">5</td><td className="p-3">3</td><td className="p-3">0.4*5 + 0.6*3 = 2.0 + 1.8 = <strong>3.8</strong></td>
                </tr>
                <tr className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                  <td className="p-3">B-D</td><td className="p-3">3</td><td className="p-3">8</td><td className="p-3">0.4*3 + 0.6*8 = 1.2 + 4.8 = <strong>6.0</strong></td>
                </tr>
                <tr className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                  <td className="p-3">C-D</td><td className="p-3">4</td><td className="p-3">4</td><td className="p-3">0.4*4 + 0.6*4 = 1.6 + 2.4 = <strong>4.0</strong></td>
                </tr>
                <tr className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                  <td className="p-3">D-E</td><td className="p-3">2</td><td className="p-3">3</td><td className="p-3">0.4*2 + 0.6*3 = 0.8 + 1.8 = <strong>2.6</strong></td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-3">C-E</td><td className="p-3">7</td><td className="p-3">1</td><td className="p-3">0.4*7 + 0.6*1 = 2.8 + 0.6 = <strong>3.4</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <Subtitle>Path Analysis:</Subtitle>
          <ul className="list-none pl-0 mb-6">
            <ListItem>
              <strong>Path 1: A &rarr; B &rarr; D &rarr; E</strong><br />
              Total Cost = Cost(A-B) + Cost(B-D) + Cost(D-E) = 5.0 + 6.0 + 2.6 = <strong>13.6</strong>
            </ListItem>
            <ListItem>
              <strong>Path 2: A &rarr; C &rarr; D &rarr; E</strong><br />
              Total Cost = Cost(A-C) + Cost(C-D) + Cost(D-E) = 3.8 + 4.0 + 2.6 = <strong>10.4</strong>
            </ListItem>
            <ListItem>
              <strong>Path 3: A &rarr; C &rarr; E</strong><br />
              Total Cost = Cost(A-C) + Cost(C-E) = 3.8 + 3.4 = <strong>7.2</strong>
            </ListItem>
          </ul>

          <Paragraph>
            <strong>Conclusion of Example:</strong> Using SAR-Dijkstra with the given weights, Path 3 (A &rarr; C &rarr; E) is selected as the optimal path with a total cost of 7.2. A traditional shortest path algorithm focusing only on performance might have chosen A &rarr; B &rarr; D &rarr; E if its performance-only cost (2+3+2=7) was lower than A &rarr; C &rarr; E (5+7=12, if only Perf_Cost was considered) or A &rarr; C &rarr; D &rarr; E (5+4+2=11). This example demonstrates how SAR-Dijkstra balances security and performance to find a more holistically optimal route.
          </Paragraph>
        </CardContent>
      </Card>
    </>
  );
};
