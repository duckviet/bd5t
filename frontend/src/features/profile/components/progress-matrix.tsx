import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Circle } from "lucide-react"
import { CRITERIA, REVIEW_LEVELS, type CriterionType, type ReviewLevel } from "@/lib/constants"
import type { ProgressItem } from "../types"

interface ProgressMatrixProps {
  data: ProgressItem[]
}

const criteriaKeys = Object.keys(CRITERIA) as CriterionType[]
const reviewLevelKeys = Object.keys(REVIEW_LEVELS) as ReviewLevel[]

export function ProgressMatrix({ data }: ProgressMatrixProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Ma trận tiến độ</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-2 min-w-[100px]"></th>
                {reviewLevelKeys.map((level) => (
                  <th key={level} className="text-center p-2 text-sm font-medium text-muted-foreground">
                    {REVIEW_LEVELS[level]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {criteriaKeys.map((criterion) => (
                <tr key={criterion}>
                  <td className="p-2 font-medium text-sm">{CRITERIA[criterion]}</td>
                  {reviewLevelKeys.map((level) => {
                    const isCompleted = data.find(
                      (p) => p.criterion === criterion && p.reviewLevel === level
                    )?.isCompleted
                    return (
                      <td key={level} className="text-center p-2">
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-success mx-auto" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
