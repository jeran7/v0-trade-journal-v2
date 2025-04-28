import AnimatedTextCycle from "@/components/ui/animated-text-cycle"

export function AnimatedTextCycleDemo() {
  return (
    <div className="p-4 max-w-[600px]">
      <h1 className="text-4xl font-light text-left text-white">
        Transform your{" "}
        <AnimatedTextCycle
          words={[
            "trades",
            "strategies",
            "performance",
            "psychology",
            "insights",
            "discipline",
            "consistency",
            "analysis",
            "decisions",
            "patterns",
          ]}
          interval={3000}
          className={"text-white font-semibold"}
        />{" "}
        into lasting success
      </h1>
    </div>
  )
}
