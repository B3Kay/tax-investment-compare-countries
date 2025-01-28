import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { ComparisonResult, GraphData } from "@/utils/calculations"




export default function ComparisonSummary({
  data,
  visibleCountries,
}: {
  data: ComparisonResult
  visibleCountries: string[]
}) {
  const [safeWithdrawalRate, setSafeWithdrawalRate] = useState(4) // Default 4% SWR
  const [desiredIncome, setDesiredIncome] = useState(50000) // Default desired income ($50,000)
  const [firePortfolios, setFirePortfolios] = useState<{ [key: string]: number }>({}) // Initial empty object for FIRE portfolios

  const [yearsUntilOutperform, setYearsUntilOutperform] = useState<number | null>(null)

  // Find the most beneficial country (with the highest net worth)
  const mostBeneficial = data.countries
    .map((country) => ({ ...country, finalNetWorth: country.finalNetWorth || 0 }))
    .filter((country) => visibleCountries.includes(country.name))
    .reduce((prev, current) => (prev.finalNetWorth > current.finalNetWorth ? prev : current))

  // Calculate the FIRE portfolio required for each country
  const calculateFirePortfolio = () => {
    const portfolios: { [key: string]: number } = {}
    // biome-ignore lint/complexity/noForEach: <explanation>
    data.countries
      .filter((country) => visibleCountries.includes(country.name))
      .forEach((country) => {
        portfolios[country.name] = desiredIncome / (safeWithdrawalRate / 100)
      })
    setFirePortfolios(portfolios) // Update the state with calculated portfolios
  }

  // Calculate when one country overtakes another based on the graphData
  const findBreakpoint = (graphData) => {
    let breakpoint = null;
    let initialCountry = null;
    let countryChangeYear = null;
    let winnerCountry = null;
    let bestInitialNetWorth = 0;

    // Compare Poland and Sweden for each year
    for (let i = 0; i < graphData.length; i++) {
      const currentYearData = graphData[i];
      const polandNetWorth = currentYearData["Poland-Expected"];
      const swedenNetWorth = currentYearData["Sweden-Expected"];

      // Step 1: Compare the starting point to decide the best initial country
      if (i === 0) {
        // Determine which country has the better start
        initialCountry = polandNetWorth > swedenNetWorth ? "Poland" : "Sweden";
        bestInitialNetWorth = Math.max(polandNetWorth, swedenNetWorth);
      }

      // Step 2: Track when one country surpasses the other
      if (polandNetWorth > swedenNetWorth && !countryChangeYear) {
        countryChangeYear = currentYearData.year;
        winnerCountry = "Poland";
        breakpoint = {
          year: countryChangeYear,
          winnerCountry: "Poland",
          message: `After ${currentYearData.year} years, moving to Poland is better. At year ${currentYearData.year}, Poland outperforms Sweden with a net worth of ${polandNetWorth.toFixed(2)}. The initial choice was Sweden, but now Poland offers a better financial return.`,
          networth: polandNetWorth,
          income: (polandNetWorth / 12).toFixed(2),
          monthlyInvestment: ((polandNetWorth / 12) * 0.2).toFixed(2),
        };
      }

      // Fallback: If no country change happens, check for the best performer at the end
      if (i === graphData.length - 1 && !countryChangeYear) {
        winnerCountry = polandNetWorth > swedenNetWorth ? "Poland" : "Sweden";
        breakpoint = {
          year: currentYearData.year,
          winnerCountry,
          message: `By the end of the analysis period (year ${currentYearData.year}), ${winnerCountry} is the best country for building wealth. ${winnerCountry} has the highest net worth.`,
          networth: Math.max(polandNetWorth, swedenNetWorth),
          income: (Math.max(polandNetWorth, swedenNetWorth) / 12).toFixed(2),
          monthlyInvestment: (((Math.max(polandNetWorth, swedenNetWorth) / 12) * 0.2)).toFixed(2),
        };
      }
    }

    // If no breakpoint found (no country surpasses another), simply show which country is better in the end
    if (!breakpoint) {
      breakpoint = {
        year: graphData[graphData.length - 1].year,
        winnerCountry,
        message: `By the end of the analysis period (year ${graphData[graphData.length - 1].year}), ${winnerCountry} is the most beneficial country to live in based on net worth accumulation.`,
      };
    }

    return breakpoint;
  };


  const calculateComparison = () => {
    // const visibleCountryData = data.countries.filter((country) => visibleCountries.includes(country.name))

    // if (visibleCountryData.length < 2) {
    //   return
    // }

    // const [country1, country2] = visibleCountryData

    const result = findBreakpoint(data.graphData)
    console.log(result)


    // setYearsUntilOutperform(years)
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
              {/* <TableHead>Required FIRE Portfolio</TableHead> */}
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
                  {/* <TableCell>
                    {firePortfolios[country.name] ? `${data.currency}${firePortfolios[country.name].toFixed(2)}` : "-"}
                  </TableCell> */}
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
        {/* <div className="mt-8">
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
        </div> */}
        {/* <div className="mt-4">
          <Button onClick={calculateComparison} className="mt-4">
            Calculate Outperform Year
          </Button>
          {yearsUntilOutperform !== null && (
            <p className="mt-4">Country 2 will outperform Country 1 in {yearsUntilOutperform} years.</p>
          )}
        </div> */}
      </CardContent>
    </Card>
  )
}
