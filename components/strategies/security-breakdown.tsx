import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, Shield, TrendingUp, Clock, DollarSign, Activity, Coins } from "lucide-react"
import type { SecurityMetrics } from "@/lib/calc-security-score"

type SecurityBreakdownProps = {
  metrics: SecurityMetrics
}

export function SecurityBreakdown({ metrics }: SecurityBreakdownProps) {
  const getScoreColor = (score: number) => {
    if (score >= 15) return "text-green-500"
    if (score >= 10) return "text-yellow-500"
    return "text-red-500"
  }

  const getRatingColor = (rating: string) => {
    if (rating.includes("High") || rating === "Established" || rating === "Stable" || rating === "Audited")
      return "bg-green-500/10 text-green-500 border-green-500/20"
    if (rating.includes("Medium") || rating === "Moderate")
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
    return "bg-red-500/10 text-red-500 border-red-500/20"
  }

  const metrics_list = [
    {
      icon: Shield,
      title: "Audit Status",
      score: metrics.auditScore,
      rating: metrics.hasAudits ? "Audited" : "Not Audited",
      description: metrics.hasAudits ? "Protocol has been audited by security firms" : "No audits found",
    },
    {
      icon: DollarSign,
      title: "Total Value Locked",
      score: metrics.tvlScore,
      rating: metrics.tvlRating,
      value: `$${(metrics.tvl / 1e6).toFixed(1)}M`,
      description: "Higher TVL indicates more trust from users",
    },
    {
      icon: Clock,
      title: "Protocol Age",
      score: metrics.ageScore,
      rating: metrics.ageRating,
      value: `${Math.floor(metrics.protocolAgeDays / 30)} months`,
      description: "Longer history reduces smart contract risk",
    },
    {
      icon: Activity,
      title: "24h Volume",
      score: metrics.volumeScore,
      rating: metrics.volumeRating,
      value: `$${(metrics.volume24h / 1e6).toFixed(1)}M`,
      description: "Active trading indicates healthy liquidity",
    },
    {
      icon: TrendingUp,
      title: "APY Stability",
      score: metrics.volatilityScore,
      rating: metrics.volatilityRating,
      value: `${(metrics.apyVolatility * 100).toFixed(0)}% volatility`,
      description: "Lower volatility means more predictable returns",
    },
  ]

  const getOverallMessage = () => {
    if (metrics.totalScore >= 70) return "High safety score - Low risk"
    if (metrics.totalScore >= 50) return "Medium safety score - Moderate risk"
    return "Low safety score - Higher risk"
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <CardTitle>Safety Score</CardTitle>
            <Badge variant="outline" className={`text-xl font-bold ${getScoreColor(metrics.totalScore)}`}>
              {(metrics.totalScore / 10).toFixed(1)}/10
            </Badge>
          </div>
          <div className="space-y-2">
            <Progress value={metrics.totalScore} className="h-2" />
            <p className="text-sm text-muted-foreground">{getOverallMessage()}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {metrics_list.map((metric, index) => {
          const IconComponent = metric.icon

          return (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <IconComponent className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium text-sm">{metric.title}</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-xs ${getRatingColor(metric.rating)}`}>
                      {metric.rating}
                    </Badge>
                    {metric.title === "Audit Status" &&
                      (metrics.hasAudits ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ))}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">{metric.description}</div>
                {metric.value && <div className="text-xs font-medium">{metric.value}</div>}
              </div>
            </div>
          )
        })}

        {metrics.tokenScores.length > 0 && (
          <div className="space-y-2 pt-3 border-t">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium text-sm">Tokens</h4>
            </div>
            {metrics.tokenScores.map((token, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded border bg-card text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium">{token.symbol}</span>
                  {token.isStablecoin && (
                    <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500">
                      Stable
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{token.marketCapRating}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
