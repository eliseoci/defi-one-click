import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Shield,
  TrendingUp,
  Clock,
  DollarSign,
  Activity,
  Coins,
} from "lucide-react"
import type { SecurityMetrics } from "@/lib/calc-security-score"

type SecurityBreakdownProps = {
  metrics: SecurityMetrics
}

export function SecurityBreakdown({ metrics }: SecurityBreakdownProps) {
  const getScoreColor = (score: number) => {
    if (score >= 10) return "text-green-500"
    if (score >= 0) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreIcon = (score: number) => {
    if (score >= 10) return CheckCircle2
    if (score >= 0) return AlertTriangle
    return XCircle
  }

  const getRatingColor = (rating: string) => {
    if (rating.includes("High") || rating === "Established" || rating === "Stable")
      return "bg-green-500/10 text-green-500"
    if (rating.includes("Medium") || rating === "Moderate") return "bg-yellow-500/10 text-yellow-500"
    return "bg-red-500/10 text-red-500"
  }

  const metrics_list = [
    {
      icon: Shield,
      title: "Audit Status",
      score: metrics.auditScore,
      details: metrics.auditDetails,
      rating: metrics.hasAudits ? "Audited" : "Not Audited",
      description: "Security audits by trusted firms",
    },
    {
      icon: DollarSign,
      title: "Total Value Locked",
      score: metrics.tvlScore,
      details: `$${(metrics.tvl / 1e6).toFixed(2)}M`,
      rating: metrics.tvlRating,
      description: "Capital locked in the protocol",
    },
    {
      icon: Clock,
      title: "Protocol Age",
      score: metrics.ageScore,
      details: `${metrics.protocolAgeDays} days`,
      rating: metrics.ageRating,
      description: "Time since protocol launch",
    },
    {
      icon: Activity,
      title: "24h Volume",
      score: metrics.volumeScore,
      details: `$${(metrics.volume24h / 1e6).toFixed(2)}M`,
      rating: metrics.volumeRating,
      description: "Daily trading activity",
    },
    {
      icon: TrendingUp,
      title: "APY Stability",
      score: metrics.volatilityScore,
      details: `${(metrics.apyVolatility * 100).toFixed(1)}% volatility`,
      rating: metrics.volatilityRating,
      description: "Consistency of returns",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Security Score Breakdown
            <Badge variant="outline" className="text-lg font-bold">
              {metrics.totalScore}/100
            </Badge>
          </CardTitle>
          <Badge className={getRatingColor(metrics.rating)}>{metrics.rating} Risk</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Safety Score</span>
            <span className="font-bold">{metrics.totalScore}%</span>
          </div>
          <Progress value={metrics.totalScore} className="h-2" />
        </div>

        <div className="space-y-4">
          {metrics_list.map((metric, index) => {
            const IconComponent = metric.icon
            const ScoreIcon = getScoreIcon(metric.score)

            return (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <IconComponent className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{metric.title}</div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getRatingColor(metric.rating)}>
                        {metric.rating}
                      </Badge>
                      <ScoreIcon className={`h-4 w-4 ${getScoreColor(metric.score)}`} />
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">{metric.description}</div>
                  <div className="text-sm font-medium">{metric.details}</div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Score Impact:</span>
                    <span className={getScoreColor(metric.score)}>
                      {metric.score > 0 ? "+" : ""}
                      {metric.score} points
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Token Assessment */}
        {metrics.tokenScores.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-muted-foreground" />
              <h4 className="font-medium">Token Assessment</h4>
            </div>
            <div className="space-y-2">
              {metrics.tokenScores.map((token, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/30">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium">{token.symbol}</span>
                    {token.isStablecoin && (
                      <Badge variant="outline" className="text-xs">
                        Stablecoin
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{token.marketCapRating}</span>
                    <span className={`text-sm font-medium ${getScoreColor(token.score)}`}>
                      {token.score > 0 ? "+" : ""}
                      {token.score}
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between text-sm font-medium pt-2 border-t">
                <span>Average Token Score</span>
                <span className={getScoreColor(metrics.avgTokenScore)}>
                  {metrics.avgTokenScore > 0 ? "+" : ""}
                  {metrics.avgTokenScore.toFixed(1)} points
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
