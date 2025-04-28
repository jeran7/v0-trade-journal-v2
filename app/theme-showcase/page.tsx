"use client"

import { useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { ThemeSettings } from "@/components/ui/theme-settings"
import { SemanticProgress } from "@/components/ui/semantic-progress"
import { SemanticBadge } from "@/components/ui/semantic-badge"
import { SemanticCard } from "@/components/ui/semantic-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Lightbulb,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  BarChart,
  PieChart,
  Brain,
} from "lucide-react"

export default function ThemeShowcasePage() {
  const [activeTab, setActiveTab] = useState("colors")

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Theme Showcase</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <ThemeSettings />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="colors">Semantic Colors</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Semantic Color System</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard>
                <h3 className="text-lg font-medium mb-4">Success / Positive</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-success" />
                    <span>success</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-success-muted" />
                    <span>success-muted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-success-emphasis" />
                    <span>success-emphasis</span>
                  </div>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-success-muted/20 border border-success/20">
                  <p className="text-success">
                    Used for strengths, positive metrics, confidence, and successful attributes
                  </p>
                </div>
              </GlassCard>

              <GlassCard>
                <h3 className="text-lg font-medium mb-4">Warning / Caution</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-warning" />
                    <span>warning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-warning-muted" />
                    <span>warning-muted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-warning-emphasis" />
                    <span>warning-emphasis</span>
                  </div>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-warning-muted/20 border border-warning/20">
                  <p className="text-warning">
                    Used for areas needing improvement, caution, and learning opportunities
                  </p>
                </div>
              </GlassCard>

              <GlassCard>
                <h3 className="text-lg font-medium mb-4">Insight / Growth</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-insight" />
                    <span>insight</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-insight-muted" />
                    <span>insight-muted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-insight-emphasis" />
                    <span>insight-emphasis</span>
                  </div>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-insight-muted/20 border border-insight/20">
                  <p className="text-insight">
                    Used for pattern recognition, insights, growth, and implemented lessons
                  </p>
                </div>
              </GlassCard>

              <GlassCard>
                <h3 className="text-lg font-medium mb-4">Danger / Critical</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-danger" />
                    <span>danger</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-danger-muted" />
                    <span>danger-muted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-danger-emphasis" />
                    <span>danger-emphasis</span>
                  </div>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-danger-muted/20 border border-danger/20">
                  <p className="text-danger">Used for critical errors, significant losses, and important warnings</p>
                </div>
              </GlassCard>

              <GlassCard>
                <h3 className="text-lg font-medium mb-4">Advanced / Premium</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-advanced" />
                    <span>advanced</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-advanced-muted" />
                    <span>advanced-muted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-advanced-emphasis" />
                    <span>advanced-emphasis</span>
                  </div>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-advanced-muted/20 border border-advanced/20">
                  <p className="text-advanced">
                    Used for advanced features, AI-powered components, and premium functionality
                  </p>
                </div>
              </GlassCard>
            </div>
          </TabsContent>

          <TabsContent value="components" className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Semantic Components</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard>
                <h3 className="text-lg font-medium mb-4">Buttons with Semantic Colors</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button className="bg-success hover:bg-success-emphasis">Success</Button>
                  <Button className="bg-warning hover:bg-warning-emphasis">Warning</Button>
                  <Button className="bg-insight hover:bg-insight-emphasis">Insight</Button>
                  <Button className="bg-danger hover:bg-danger-emphasis">Danger</Button>
                  <Button className="bg-advanced hover:bg-advanced-emphasis">Advanced</Button>
                  <Button variant="outline" className="border-success text-success hover:bg-success/10">
                    Outline
                  </Button>
                </div>
              </GlassCard>

              <GlassCard>
                <h3 className="text-lg font-medium mb-4">Glass Cards with Semantic Colors</h3>
                <div className="space-y-2">
                  <GlassCard semanticColor="success" className="p-2">
                    <p className="text-sm">Success card</p>
                  </GlassCard>
                  <GlassCard semanticColor="warning" className="p-2">
                    <p className="text-sm">Warning card</p>
                  </GlassCard>
                  <GlassCard semanticColor="danger" className="p-2">
                    <p className="text-sm">Danger card</p>
                  </GlassCard>
                  <GlassCard semanticColor="advanced" className="p-2">
                    <p className="text-sm">Advanced card</p>
                  </GlassCard>
                </div>
              </GlassCard>

              <GlassCard>
                <h3 className="text-lg font-medium mb-4">Semantic Text</h3>
                <div className="space-y-2">
                  <p className="text-success">Success text for positive outcomes</p>
                  <p className="text-warning">Warning text for caution areas</p>
                  <p className="text-insight">Insight text for growth patterns</p>
                  <p className="text-danger">Danger text for critical issues</p>
                  <p className="text-advanced">Advanced text for premium features</p>
                </div>
              </GlassCard>

              <GlassCard>
                <h3 className="text-lg font-medium mb-4">Semantic Icons</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <div className="p-2 rounded-full bg-success-muted/30">
                      <CheckCircle className="h-5 w-5 text-success" />
                    </div>
                    <span className="text-xs">Success</span>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <div className="p-2 rounded-full bg-warning-muted/30">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                    </div>
                    <span className="text-xs">Warning</span>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <div className="p-2 rounded-full bg-insight-muted/30">
                      <Lightbulb className="h-5 w-5 text-insight" />
                    </div>
                    <span className="text-xs">Insight</span>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <div className="p-2 rounded-full bg-danger-muted/30">
                      <XCircle className="h-5 w-5 text-danger" />
                    </div>
                    <span className="text-xs">Danger</span>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <div className="p-2 rounded-full bg-advanced-muted/30">
                      <Sparkles className="h-5 w-5 text-advanced" />
                    </div>
                    <span className="text-xs">Advanced</span>
                  </div>
                </div>
              </GlassCard>
            </div>
          </TabsContent>

          <TabsContent value="cards" className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Semantic Cards</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Border Variant</h3>
                <SemanticCard
                  type="success"
                  variant="border"
                  icon={<CheckCircle className="h-5 w-5" />}
                  title="Successful Trade"
                  description="This trade followed your strategy perfectly"
                >
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="h-4 w-4 text-success" />
                      <span className="font-medium">+$1,250.00</span>
                    </div>
                    <SemanticBadge type="success" size="sm">
                      +2.5%
                    </SemanticBadge>
                  </div>
                </SemanticCard>

                <SemanticCard
                  type="warning"
                  variant="border"
                  icon={<AlertTriangle className="h-5 w-5" />}
                  title="Partial Strategy Adherence"
                  description="Some aspects of your strategy were not followed"
                >
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="h-4 w-4 text-warning" />
                      <span className="font-medium">+$320.00</span>
                    </div>
                    <SemanticBadge type="warning" size="sm">
                      +0.8%
                    </SemanticBadge>
                  </div>
                </SemanticCard>

                <SemanticCard
                  type="danger"
                  variant="border"
                  icon={<XCircle className="h-5 w-5" />}
                  title="Failed Trade"
                  description="This trade deviated from your strategy"
                >
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ArrowDownRight className="h-4 w-4 text-danger" />
                      <span className="font-medium">-$850.00</span>
                    </div>
                    <SemanticBadge type="danger" size="sm">
                      -1.7%
                    </SemanticBadge>
                  </div>
                </SemanticCard>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Accent Variant</h3>
                <SemanticCard
                  type="insight"
                  variant="accent"
                  icon={<TrendingUp className="h-5 w-5" />}
                  title="Pattern Detected"
                  description="A recurring pattern has been identified in your trades"
                >
                  <div className="mt-2 p-3 rounded-lg bg-insight-muted/10">
                    <p className="text-sm">Your most profitable trades occur between 10:30-11:30 AM EST.</p>
                  </div>
                </SemanticCard>

                <SemanticCard
                  type="advanced"
                  variant="accent"
                  icon={<Brain className="h-5 w-5" />}
                  title="AI Analysis"
                  description="Advanced insights from our AI trading assistant"
                >
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <BarChart className="h-4 w-4 text-advanced" />
                      <span className="text-sm">Win rate increased by 12% this month</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PieChart className="h-4 w-4 text-advanced" />
                      <span className="text-sm">Risk management improved by 8%</span>
                    </div>
                  </div>
                </SemanticCard>

                <SemanticCard
                  type="success"
                  variant="filled"
                  icon={<Lightbulb className="h-5 w-5" />}
                  title="Strategy Insight"
                  description="Your strategy is showing consistent results"
                >
                  <div className="mt-2">
                    <SemanticProgress value={78} type="success" showValue />
                    <p className="mt-2 text-sm">Your strategy adherence score is above average.</p>
                  </div>
                </SemanticCard>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Semantic Progress Indicators</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard>
                <h3 className="text-lg font-medium mb-4">Standard Progress</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Success (85%)</span>
                      <span className="text-xs text-muted-foreground">Strategy Adherence</span>
                    </div>
                    <SemanticProgress value={85} type="success" showValue />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Warning (45%)</span>
                      <span className="text-xs text-muted-foreground">Risk Management</span>
                    </div>
                    <SemanticProgress value={45} type="warning" showValue />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Danger (15%)</span>
                      <span className="text-xs text-muted-foreground">Overtrading</span>
                    </div>
                    <SemanticProgress value={15} type="danger" showValue />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Insight (65%)</span>
                      <span className="text-xs text-muted-foreground">Pattern Recognition</span>
                    </div>
                    <SemanticProgress value={65} type="insight" showValue />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Advanced (92%)</span>
                      <span className="text-xs text-muted-foreground">AI Analysis Confidence</span>
                    </div>
                    <SemanticProgress value={92} type="advanced" showValue />
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <h3 className="text-lg font-medium mb-4">Gradient Progress</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Poor (25%)</span>
                      <span className="text-xs text-muted-foreground">Performance Rating</span>
                    </div>
                    <SemanticProgress value={25} type="gradient" showValue />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Average (50%)</span>
                      <span className="text-xs text-muted-foreground">Performance Rating</span>
                    </div>
                    <SemanticProgress value={50} type="gradient" showValue />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Good (75%)</span>
                      <span className="text-xs text-muted-foreground">Performance Rating</span>
                    </div>
                    <SemanticProgress value={75} type="gradient" showValue />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Excellent (95%)</span>
                      <span className="text-xs text-muted-foreground">Performance Rating</span>
                    </div>
                    <SemanticProgress value={95} type="gradient" showValue />
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <h4 className="text-sm font-medium">Size Variations</h4>
                  <SemanticProgress value={65} type="success" size="sm" />
                  <SemanticProgress value={65} type="success" size="md" />
                  <SemanticProgress value={65} type="success" size="lg" />
                </div>

                <div className="mt-6 space-y-2">
                  <h4 className="text-sm font-medium">Animated Progress</h4>
                  <SemanticProgress value={65} type="advanced" animated showValue />
                </div>
              </GlassCard>
            </div>
          </TabsContent>

          <TabsContent value="badges" className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Semantic Badges</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard>
                <h3 className="text-lg font-medium mb-4">Badge Variants</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Solid Badges</h4>
                    <div className="flex flex-wrap gap-2">
                      <SemanticBadge type="success" variant="solid">
                        Success
                      </SemanticBadge>
                      <SemanticBadge type="warning" variant="solid">
                        Warning
                      </SemanticBadge>
                      <SemanticBadge type="danger" variant="solid">
                        Danger
                      </SemanticBadge>
                      <SemanticBadge type="insight" variant="solid">
                        Insight
                      </SemanticBadge>
                      <SemanticBadge type="advanced" variant="solid">
                        Advanced
                      </SemanticBadge>
                      <SemanticBadge type="neutral" variant="solid">
                        Neutral
                      </SemanticBadge>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Outline Badges</h4>
                    <div className="flex flex-wrap gap-2">
                      <SemanticBadge type="success" variant="outline">
                        Success
                      </SemanticBadge>
                      <SemanticBadge type="warning" variant="outline">
                        Warning
                      </SemanticBadge>
                      <SemanticBadge type="danger" variant="outline">
                        Danger
                      </SemanticBadge>
                      <SemanticBadge type="insight" variant="outline">
                        Insight
                      </SemanticBadge>
                      <SemanticBadge type="advanced" variant="outline">
                        Advanced
                      </SemanticBadge>
                      <SemanticBadge type="neutral" variant="outline">
                        Neutral
                      </SemanticBadge>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Soft Badges</h4>
                    <div className="flex flex-wrap gap-2">
                      <SemanticBadge type="success" variant="soft">
                        Success
                      </SemanticBadge>
                      <SemanticBadge type="warning" variant="soft">
                        Warning
                      </SemanticBadge>
                      <SemanticBadge type="danger" variant="soft">
                        Danger
                      </SemanticBadge>
                      <SemanticBadge type="insight" variant="soft">
                        Insight
                      </SemanticBadge>
                      <SemanticBadge type="advanced" variant="soft">
                        Advanced
                      </SemanticBadge>
                      <SemanticBadge type="neutral" variant="soft">
                        Neutral
                      </SemanticBadge>
                    </div>
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <h3 className="text-lg font-medium mb-4">Badge Sizes & Icons</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Small Badges</h4>
                    <div className="flex flex-wrap gap-2">
                      <SemanticBadge type="success" size="sm" icon={<CheckCircle className="h-3 w-3" />}>
                        Success
                      </SemanticBadge>
                      <SemanticBadge type="warning" size="sm" icon={<AlertTriangle className="h-3 w-3" />}>
                        Warning
                      </SemanticBadge>
                      <SemanticBadge type="danger" size="sm" icon={<XCircle className="h-3 w-3" />}>
                        Danger
                      </SemanticBadge>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Medium Badges</h4>
                    <div className="flex flex-wrap gap-2">
                      <SemanticBadge type="success" size="md" icon={<CheckCircle className="h-3.5 w-3.5" />}>
                        Success
                      </SemanticBadge>
                      <SemanticBadge type="warning" size="md" icon={<AlertTriangle className="h-3.5 w-3.5" />}>
                        Warning
                      </SemanticBadge>
                      <SemanticBadge type="danger" size="md" icon={<XCircle className="h-3.5 w-3.5" />}>
                        Danger
                      </SemanticBadge>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Large Badges</h4>
                    <div className="flex flex-wrap gap-2">
                      <SemanticBadge type="success" size="lg" icon={<CheckCircle className="h-4 w-4" />}>
                        Success
                      </SemanticBadge>
                      <SemanticBadge type="warning" size="lg" icon={<AlertTriangle className="h-4 w-4" />}>
                        Warning
                      </SemanticBadge>
                      <SemanticBadge type="danger" size="lg" icon={<XCircle className="h-4 w-4" />}>
                        Danger
                      </SemanticBadge>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Trading Context</h4>
                    <div className="flex flex-wrap gap-2">
                      <SemanticBadge type="success" variant="soft" icon={<ArrowUpRight className="h-3.5 w-3.5" />}>
                        +2.5%
                      </SemanticBadge>
                      <SemanticBadge type="danger" variant="soft" icon={<ArrowDownRight className="h-3.5 w-3.5" />}>
                        -1.8%
                      </SemanticBadge>
                      <SemanticBadge type="insight" variant="soft" icon={<TrendingUp className="h-3.5 w-3.5" />}>
                        Breakout
                      </SemanticBadge>
                      <SemanticBadge type="advanced" variant="soft" icon={<Brain className="h-3.5 w-3.5" />}>
                        AI Detected
                      </SemanticBadge>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
