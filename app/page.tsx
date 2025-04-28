"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { BarChart3, BrainCircuit, TrendingUp, Sparkles, ArrowRight, MonitorSmartphone } from "lucide-react"
import { FeatureCard } from "@/components/ui/feature-card"
import { TestimonialCard } from "@/components/ui/testimonial-card"
import { RandomTagline } from "@/components/ui/random-tagline"

export default function LandingPage() {
  const router = useRouter()

  const handleAuthNavigation = (path: string) => {
    router.push(path)
  }

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  // Feature data
  const features = [
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Performance Tracking",
      description:
        "Track your trades, analyze win rates, and visualize your equity curve to identify strengths and weaknesses.",
      iconBgColor: "bg-blue-500/10 dark:bg-blue-950/50",
      iconColor: "text-blue-500 dark:text-blue-400",
    },
    {
      icon: <BrainCircuit className="h-6 w-6" />,
      title: "Psychological Analysis",
      description: "Understand your emotional patterns and cognitive biases to make more rational trading decisions.",
      iconBgColor: "bg-purple-500/10 dark:bg-purple-950/50",
      iconColor: "text-purple-500 dark:text-purple-400",
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Strategy Optimization",
      description: "Refine your trading strategies based on historical performance data and market conditions.",
      iconBgColor: "bg-green-500/10 dark:bg-green-950/50",
      iconColor: "text-green-500 dark:text-green-400",
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI Insights",
      description: "Leverage AI-powered analysis to uncover hidden patterns and receive personalized recommendations.",
      iconBgColor: "bg-amber-500/10 dark:bg-amber-950/50",
      iconColor: "text-amber-500 dark:text-amber-400",
    },
  ]

  // Testimonial data
  const testimonials = [
    {
      initials: "SD",
      name: "Sofia Davis",
      role: "Professional Trader",
      quote:
        "This trading journal has transformed how I track and analyze my trades. The insights have been invaluable for my growth as a trader.",
      bgColor: "bg-blue-500/10 dark:bg-blue-900/20",
      textColor: "text-blue-500 dark:text-blue-400",
    },
    {
      initials: "JM",
      name: "James Miller",
      role: "Swing Trader",
      quote:
        "The psychological analysis feature helped me identify emotional patterns that were sabotaging my trades. My win rate has improved by 15% since using this platform.",
      bgColor: "bg-green-500/10 dark:bg-green-900/20",
      textColor: "text-green-500 dark:text-green-400",
    },
    {
      initials: "AK",
      name: "Alex Kim",
      role: "Day Trader",
      quote:
        "The AI insights have been game-changing for my strategy development. I've discovered patterns I never would have noticed on my own.",
      bgColor: "bg-purple-500/10 dark:bg-purple-900/20",
      textColor: "text-purple-500 dark:text-purple-400",
    },
  ]

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 w-full">
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-primary"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          <span className="text-xl font-bold">Trading Journal</span>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <MonitorSmartphone className="h-5 w-5 text-muted-foreground" />
          <Button
            variant="outline"
            onClick={() => handleAuthNavigation("/auth/login")}
            className="transition-all duration-300"
          >
            Sign In
          </Button>
          <Button
            onClick={() => handleAuthNavigation("/auth/register")}
            className="transition-all duration-300 bg-blue-600 hover:bg-blue-700"
          >
            Create Account
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section
        className="relative z-10 py-16 md:py-24 px-6 w-full"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="max-w-3xl mx-auto text-center space-y-6">
          <RandomTagline className="mx-auto" />
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your trading decisions with data-driven insights. Track, analyze, and optimize your performance to
            become a more consistent and profitable trader.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button
              size="lg"
              onClick={() => handleAuthNavigation("/auth/register")}
              className="transition-all duration-300 bg-blue-600 hover:bg-blue-700"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => handleAuthNavigation("/auth/login")}
              className="transition-all duration-300"
            >
              Sign In
            </Button>
          </div>
        </motion.div>
      </motion.section>

      {/* Feature Highlights */}
      <section className="relative z-10 py-16 md:py-24 px-6 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features for Serious Traders</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive toolset helps you identify patterns, overcome psychological barriers, and refine your
              trading strategies.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  iconBgColor={feature.iconBgColor}
                  iconColor={feature.iconColor}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 py-16 md:py-24 px-6 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Traders Worldwide</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See how our platform has helped traders improve their performance and achieve their goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <TestimonialCard
                  initials={testimonial.initials}
                  name={testimonial.name}
                  role={testimonial.role}
                  quote={testimonial.quote}
                  bgColor={testimonial.bgColor}
                  textColor={testimonial.textColor}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-16 md:py-24 px-6 w-full">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Trading?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of traders who have improved their performance with our comprehensive trading journal.
          </p>
          <Button
            size="lg"
            onClick={() => handleAuthNavigation("/auth/register")}
            className="transition-all duration-300 text-lg px-8 py-6 h-auto bg-blue-600 hover:bg-blue-700"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-border w-full">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-primary"
              >
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
              </svg>
              <span className="font-bold">Trading Journal</span>
            </div>
            <div className="flex space-x-6">
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                Terms of Service
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                href="/contact"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                Contact Us
              </Link>
            </div>
          </div>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Trading Journal. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
