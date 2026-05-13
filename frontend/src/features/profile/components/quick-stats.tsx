import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface QuickStatsProps {
  completed: number
  total: number
  percent: number
}

export function QuickStats({ completed, total, percent }: QuickStatsProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Tiến độ tổng quan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <div className="text-4xl font-bold text-primary">{percent}%</div>
          <div className="text-sm text-muted-foreground">
            {completed} / {total} tiêu chí
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
