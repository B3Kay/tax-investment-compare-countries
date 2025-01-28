import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function ComparisonSummary({ data, visibleCountries, visibleScenarios }) {
  const [desiredIncome, setDesiredIncome] = useState(40000)
  const [safeWithdrawalRate, setSafeWithdrawalRate] = useState(4)
  const [firePortfolios, setFirePortfolios] = useState({})

  const mostBeneficial = data.countries
    .filter((country) => visibleCountries.includes(country.name))
    .reduce((prev, current) => (prev.finalNetWorth > current.finalNetWorth ? prev : current))

  const calculateFirePortfolio = () => {
    const portfolios = {}
    data.countries
      .filter((country) => visibleCountries.includes(country.name))
      .forEach((country) => {
        portfolios[country.name] = desiredIncome / (safeWithdrawalRate / 100)
      })
    setFirePortfolios(portfolios)
  }

  return (
    <Card className="w-full mb-8">
      <CardHeader>
        <CardTitle>Comparison Summary</CardTitle>
        <CardDescription>Summary of financial outcomes for each country</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Country</TableHead>
              <TableHead>Net Income After Taxes</TableHead>
              <TableHead>Social Security Contributions</TableHead>
              <TableHead>Social Security Type</TableHead>
              <TableHead>Yearly Investment</TableHead>
              <TableHead>Monthly Investment</TableHead>
              <TableHead>Investment Gains</TableHead>
              <TableHead>Final Net Worth</TableHead>
              <TableHead>Required FIRE Portfolio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.countries
              .filter((country) => visibleCountries.includes(country.name))
              .map((country) => (
                <TableRow key={country.name}>
                  <TableCell>{country.name}</TableCell>
                  <TableCell>
                    {data.currency}
                    {country.netIncome.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {data.currency}
                    {country.socialSecurityContributions.toFixed(2)}
                  </TableCell>
                  <TableCell>{country.socialSecurityType === "fixed" ? "Fixed Amount" : "Percentage"}</TableCell>
                  <TableCell>
                    {data.currency}
                    {country.yearlyInvestment.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {data.currency}
                    {country.monthlyInvestment.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {data.currency}
                    {country.investmentGains.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {data.currency}
                    {country.finalNetWorth.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {firePortfolios[country.name] ? `${data.currency}${firePortfolios[country.name].toFixed(2)}` : "-"}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <div className="mt-4 p-4 bg-green-100 rounded-md">
          <h3 className="text-lg font-semibold">Most Beneficial Country: {mostBeneficial.name} ✅</h3>
          <p>
            Final Net Worth: {data.currency}
            {mostBeneficial.finalNetWorth.toFixed(2)}
          </p>
        </div>
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">FIRE Calculator</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="desiredIncome">Desired Annual Retirement Income ({data.currency})</Label>
              <Input
                id="desiredIncome"
                type="number"
                value={desiredIncome}
                onChange={(e) => setDesiredIncome(Number(e.target.value))}
                min="0"
                step="1000"
              />
            </div>
            <div>
              <Label htmlFor="safeWithdrawalRate">Safe Withdrawal Rate (%)</Label>
              <Input
                id="safeWithdrawalRate"
                type="number"
                value={safeWithdrawalRate}
                onChange={(e) => setSafeWithdrawalRate(Number(e.target.value))}
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          </div>
          <Button onClick={calculateFirePortfolio} className="mt-4">
            Calculate FIRE Portfolio
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

