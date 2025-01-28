import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const colors = ["#3b82f6", "#10b981", "#ef4444", "#f59e0b", "#6366f1", "#ec4899", "#8b5cf6"]

export default function ComparisonGraph({ data, visibleCountries, visibleScenarios }) {
  const [zoomDomain, setZoomDomain] = useState(null)

  const handleZoom = (domain) => {
    setZoomDomain(domain)
  }

  const resetZoom = () => {
    setZoomDomain(null)
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded shadow">
          <p className="font-bold">Year {label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {data.currency}
              {entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const getScenarioStyle = (scenario) => {
    switch (scenario) {
      case "Bad":
        return "3 3"
      case "Expected":
        return undefined
      case "Good":
        return "5 5"
      default:
        return undefined
    }
  }

  return (
    <Card className="w-full mb-8">
      <CardHeader>
        <CardTitle>Net Worth Comparison Over Time</CardTitle>
        <CardDescription>Comparison of net worth growth for different countries and scenarios</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data.graphData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              onMouseDown={(startEvent) => {}}
              onMouseMove={(moveEvent) => {}}
              onMouseUp={(endEvent) => {}}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="year"
                label={{ value: "Years", position: "insideBottomRight", offset: -10 }}
                domain={zoomDomain ? [zoomDomain.x[0], zoomDomain.x[1]] : ["auto", "auto"]}
              />
              <YAxis
                label={{ value: `Net Worth (${data.currency})`, angle: -90, position: "insideLeft" }}
                domain={zoomDomain ? [zoomDomain.y[0], zoomDomain.y[1]] : ["auto", "auto"]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {visibleCountries.map((country, countryIndex) =>
                visibleScenarios.map((scenario, scenarioIndex) => (
                  <Line
                    key={`${country}-${scenario}`}
                    type="monotone"
                    dataKey={`${country}-${scenario}`}
                    stroke={colors[countryIndex % colors.length]}
                    strokeDasharray={getScenarioStyle(scenario)}
                    name={`${country} (${scenario})`}
                    activeDot={{ r: 8 }}
                  />
                )),
              )}
              {visibleCountries.map((country, countryIndex) => (
                <Area
                  key={`${country}-range`}
                  type="monotone"
                  dataKey={`${country}-Bad`}
                  fill={colors[countryIndex % colors.length]}
                  stroke="none"
                  fillOpacity={0.1}
                />
              ))}
              {visibleCountries.map((country, countryIndex) => (
                <Area
                  key={`${country}-range`}
                  type="monotone"
                  dataKey={`${country}-Good`}
                  fill={colors[countryIndex % colors.length]}
                  stroke="none"
                  fillOpacity={0.1}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <Button onClick={resetZoom} className="mt-4">
          Reset Zoom
        </Button>
      </CardContent>
    </Card>
  )
}

