import { Info, Shield, AlertTriangle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SafetyScoreDisplayProps {
  score: number
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  showTooltip?: boolean
  showScore?: boolean
  showIcon?: boolean
}

export function SafetyScoreDisplay({
  score,
  size = "md",
  showLabel = false,
  showTooltip = false,
  showScore = true,
  showIcon = true,
}: SafetyScoreDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    if (score >= 40) return "text-orange-500"
    return "text-red-500"
  }

  const getScoreLevel = (score: number) => {
    if (score >= 80) return "High"
    if (score >= 60) return "Medium"
    if (score >= 40) return "Low"
    return "Very Low"
  }

  const getIcon = (score: number) => {
    if (score >= 80) return <CheckCircle2 className="h-4 w-4" />
    if (score >= 60) return <Shield className="h-4 w-4" />
    return <AlertTriangle className="h-4 w-4" />
  }

  const barSizes = {
    sm: { height: ["h-1.5", "h-2", "h-2.5"], width: "w-0.5" },
    md: { height: ["h-2", "h-3", "h-4"], width: "w-1" },
    lg: { height: ["h-3", "h-4", "h-5"], width: "w-1.5" },
  }

  const currentSize = barSizes[size]

  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <div className="flex items-center gap-1">
          {showIcon && <span className={cn("text-sm font-medium", getScoreColor(score))}>{getIcon(score)}</span>}
          <span className="text-sm text-muted-foreground">{getScoreLevel(score)}</span>
        </div>
      )}

      {showScore && (
        <span className={cn("text-sm font-semibold tabular-nums", getScoreColor(score))}>
          {(score / 10).toFixed(1)}/10
        </span>
      )}

      {showIcon && (
        <div className={cn("flex gap-0.5", getScoreColor(score))}>
          {[1, 2, 3].map((bar) => (
            <div
              key={bar}
              className={cn(
                currentSize.width,
                "rounded-full transition-all",
                bar === 1 && currentSize.height[0],
                bar === 2 && currentSize.height[1],
                bar === 3 && currentSize.height[2],
                score >= bar * 30 ? "bg-current" : "bg-muted",
              )}
            />
          ))}
        </div>
      )}

      {showTooltip && <Info className="h-3 w-3 text-muted-foreground cursor-help" />}
    </div>
  )
}
