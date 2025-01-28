import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"

const defaultCountries = [
  { name: "Poland", taxRate: 19, socialSecurityRate: 9, dividendTaxRate: 19, isISK: false },
  { name: "Sweden", taxRate: 30, socialSecurityRate: 7, dividendTaxRate: 30, isISK: true, iskRate: 0.375 },
]

const additionalCountries = [
  { name: "Germany", taxRate: 45, socialSecurityRate: 20, dividendTaxRate: 25, isISK: false },
  { name: "USA", taxRate: 37, socialSecurityRate: 7.65, dividendTaxRate: 20, isISK: false },
  { name: "UK", taxRate: 45, socialSecurityRate: 12, dividendTaxRate: 38.1, isISK: false },
]

const defaultScenarios = [
  { name: "Bad", rate: 2 },
  { name: "Expected", rate: 5 },
  { name: "Good", rate: 8 },
]

const currencies = ["USD", "EUR", "GBP", "SEK", "PLN"]

const handleNumericInput = (setter: (value: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value
  if (value === "" || value === "0") {
    setter(0)
  } else {
    setter(Number(value))
  }
}

export default function ComparisonForm({ onSubmit }) {
  const [income, setIncome] = useState(100000)
  const [incomeType, setIncomeType] = useState<"annual" | "monthly">("annual")
  const [investmentPercentage, setInvestmentPercentage] = useState(80)
  const [startingInvestment, setStartingInvestment] = useState(0)
  const [timeHorizon, setTimeHorizon] = useState(20)
  const [countries, setCountries] = useState(defaultCountries)
  const [newCountry, setNewCountry] = useState({
    name: "",
    taxRate: 0,
    socialSecurityRate: 0,
    dividendTaxRate: 0,
    isISK: false,
    iskRate: 0,
  })
  const [includeExtraCosts, setIncludeExtraCosts] = useState(false)
  const [extraCosts, setExtraCosts] = useState({})
  const [scenarios, setScenarios] = useState(defaultScenarios)
  const [newScenario, setNewScenario] = useState({ name: "", rate: 0 })
  const [selectedScenario, setSelectedScenario] = useState("Expected")
  const [useFixedRates, setUseFixedRates] = useState({})
  const [visibleCountries, setVisibleCountries] = useState(defaultCountries.map((c) => c.name))
  const [visibleScenarios, setVisibleScenarios] = useState(defaultScenarios.map((s) => s.name))
  const [currency, setCurrency] = useState("EUR")
  const [errors, setErrors] = useState({})
  const [socialSecurityType, setSocialSecurityType] = useState({})

  const annualIncome = useMemo(() => {
    return incomeType === "monthly" ? income * 12 : income
  }, [income, incomeType])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit({
        annualIncome,
        investmentPercentage,
        startingInvestment,
        timeHorizon,
        countries: countries.filter((c) => visibleCountries.includes(c.name)),
        includeExtraCosts,
        extraCosts,
        scenarios: scenarios.filter((s) => visibleScenarios.includes(s.name)),
        selectedScenario,
        currency,
        incomeType,
        socialSecurityType,
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (income <= 0) newErrors.income = "Income must be greater than 0"
    if (investmentPercentage < 0 || investmentPercentage > 100)
      newErrors.investmentPercentage = "Investment percentage must be between 0 and 100"
    if (startingInvestment < 0) newErrors.startingInvestment = "Starting investment must be 0 or greater"
    if (timeHorizon <= 0) newErrors.timeHorizon = "Time horizon must be greater than 0"

    countries.forEach((country) => {
      if (country.taxRate < 0 || country.taxRate > 100)
        newErrors[`${country.name}-taxRate`] = "Tax rate must be between 0 and 100"

      if (socialSecurityType[country.name] === "percentage") {
        if (country.socialSecurityRate < 0 || country.socialSecurityRate > 100)
          newErrors[`${country.name}-socialSecurityRate`] = "Social security rate must be between 0 and 100%"
      } else if (socialSecurityType[country.name] === "fixed") {
        if (country.socialSecurityRate < 0)
          newErrors[`${country.name}-socialSecurityRate`] = "Social security amount must be 0 or greater"
      }

      if (country.dividendTaxRate < 0 || country.dividendTaxRate > 100)
        newErrors[`${country.name}-dividendTaxRate`] = "Dividend tax rate must be between 0 and 100"
      if (country.isISK && (country.iskRate < 0 || country.iskRate > 100))
        newErrors[`${country.name}-iskRate`] = "ISK rate must be between 0 and 100"
    })

    scenarios.forEach((scenario) => {
      if (scenario.rate < 0 || scenario.rate > 100)
        newErrors[`${scenario.name}-rate`] = "Scenario rate must be between 0 and 100"
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addCountry = () => {
    if (newCountry.name) {
      setCountries([...countries, newCountry])
      setVisibleCountries([...visibleCountries, newCountry.name])
      setNewCountry({ name: "", taxRate: 0, socialSecurityRate: 0, dividendTaxRate: 0, isISK: false, iskRate: 0 })
    }
  }

  const removeCountry = (index) => {
    const newCountries = [...countries]
    newCountries.splice(index, 1)
    setCountries(newCountries)
    setVisibleCountries(visibleCountries.filter((c) => c !== countries[index].name))
  }

  const addScenario = () => {
    if (newScenario.name && newScenario.rate) {
      setScenarios([...scenarios, newScenario])
      setVisibleScenarios([...visibleScenarios, newScenario.name])
      setNewScenario({ name: "", rate: 0 })
    }
  }

  const handleExtraCostsChange = (country, value) => {
    setExtraCosts({ ...extraCosts, [country]: value })
  }

  const toggleFixedRate = (country, type) => {
    setUseFixedRates({
      ...useFixedRates,
      [country]: { ...useFixedRates[country], [type]: !useFixedRates[country]?.[type] },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Income and Investment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="income">Income</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="income"
                type="number"
                value={income || ""}
                onChange={handleNumericInput(setIncome)}
                required
                min="0"
                step="1000"
                aria-invalid={errors.income ? "true" : "false"}
                aria-describedby={errors.income ? "income-error" : undefined}
              />
              <RadioGroup value={incomeType} onValueChange={setIncomeType} className="flex space-x-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="annual" id="annual" />
                  <Label htmlFor="annual">Annual</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly">Monthly</Label>
                </div>
              </RadioGroup>
            </div>
            {errors.income && (
              <p id="income-error" className="text-red-500 text-sm mt-1">
                {errors.income}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="investmentPercentage">Investment Percentage (%)</Label>
            <Slider
              id="investmentPercentage"
              min={0}
              max={100}
              step={1}
              value={[investmentPercentage]}
              onValueChange={(value) =>
                handleNumericInput(setInvestmentPercentage)({
                  target: { value: value[0].toString() },
                } as React.ChangeEvent<HTMLInputElement>)
              }
              aria-invalid={errors.investmentPercentage ? "true" : "false"}
              aria-describedby={errors.investmentPercentage ? "investmentPercentage-error" : undefined}
            />
            <span>{investmentPercentage}%</span>
            {errors.investmentPercentage && (
              <p id="investmentPercentage-error" className="text-red-500 text-sm mt-1">
                {errors.investmentPercentage}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="startingInvestment">Starting Investment</Label>
            <Input
              id="startingInvestment"
              type="number"
              value={startingInvestment || ""}
              onChange={handleNumericInput(setStartingInvestment)}
              min="0"
              step="1000"
              aria-invalid={errors.startingInvestment ? "true" : "false"}
              aria-describedby={errors.startingInvestment ? "startingInvestment-error" : undefined}
            />
            {errors.startingInvestment && (
              <p id="startingInvestment-error" className="text-red-500 text-sm mt-1">
                {errors.startingInvestment}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="timeHorizon">Time Horizon (years)</Label>
            <Slider
              id="timeHorizon"
              min={1}
              max={50}
              step={1}
              value={[timeHorizon]}
              onValueChange={(value) =>
                handleNumericInput(setTimeHorizon)({
                  target: { value: value[0].toString() },
                } as React.ChangeEvent<HTMLInputElement>)
              }
              aria-invalid={errors.timeHorizon ? "true" : "false"}
              aria-describedby={errors.timeHorizon ? "timeHorizon-error" : undefined}
            />
            <span>{timeHorizon} years</span>
            {errors.timeHorizon && (
              <p id="timeHorizon-error" className="text-red-500 text-sm mt-1">
                {errors.timeHorizon}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Countries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {countries.map((country, index) => (
            <div key={index} className="space-y-2 border-b pb-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`visible-${country.name}`}
                    checked={visibleCountries.includes(country.name)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setVisibleCountries([...visibleCountries, country.name])
                      } else {
                        setVisibleCountries(visibleCountries.filter((c) => c !== country.name))
                      }
                    }}
                  />
                  <Label htmlFor={`visible-${country.name}`}>{country.name}</Label>
                </div>
                <Button type="button" variant="destructive" onClick={() => removeCountry(index)}>
                  Remove
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor={`${country.name}-taxRate`}>
                    Income Tax {useFixedRates[country.name]?.tax ? "(€)" : "(%)"}
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id={`${country.name}-taxRate`}
                      type="number"
                      value={country.taxRate || ""}
                      onChange={handleNumericInput((e) => {
                        const newCountries = [...countries]
                        newCountries[index].taxRate = e
                        setCountries(newCountries)
                      })}
                      min="0"
                      max={useFixedRates[country.name]?.tax ? undefined : "100"}
                      step="0.1"
                      aria-invalid={errors[`${country.name}-taxRate`] ? "true" : "false"}
                      aria-describedby={errors[`${country.name}-taxRate`] ? `${country.name}-taxRate-error` : undefined}
                    />
                    <Switch
                      checked={useFixedRates[country.name]?.tax}
                      onCheckedChange={() => toggleFixedRate(country.name, "tax")}
                    />
                  </div>
                  {errors[`${country.name}-taxRate`] && (
                    <p id={`${country.name}-taxRate-error`} className="text-red-500 text-sm mt-1">
                      {errors[`${country.name}-taxRate`]}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor={`${country.name}-socialSecurityRate`}>Social Security</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id={`${country.name}-socialSecurityRate`}
                      type="number"
                      value={country.socialSecurityRate || ""}
                      onChange={handleNumericInput((e) => {
                        const newCountries = [...countries]
                        newCountries[index].socialSecurityRate = e
                        setCountries(newCountries)
                      })}
                      min={socialSecurityType[country.name] === "percentage" ? "0" : undefined}
                      max={socialSecurityType[country.name] === "percentage" ? "100" : undefined}
                      step="0.01"
                      aria-invalid={errors[`${country.name}-socialSecurityRate`] ? "true" : "false"}
                      aria-describedby={
                        errors[`${country.name}-socialSecurityRate`]
                          ? `${country.name}-socialSecurityRate-error`
                          : undefined
                      }
                    />
                    <Select
                      value={socialSecurityType[country.name] || "percentage"}
                      onValueChange={(value) => setSocialSecurityType((prev) => ({ ...prev, [country.name]: value }))}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {errors[`${country.name}-socialSecurityRate`] && (
                    <p id={`${country.name}-socialSecurityRate-error`} className="text-red-500 text-sm mt-1">
                      {errors[`${country.name}-socialSecurityRate`]}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor={`${country.name}-dividendTaxRate`}>Dividend Tax Rate (%)</Label>
                  <Input
                    id={`${country.name}-dividendTaxRate`}
                    type="number"
                    value={country.dividendTaxRate || ""}
                    onChange={handleNumericInput((e) => {
                      const newCountries = [...countries]
                      newCountries[index].dividendTaxRate = e
                      setCountries(newCountries)
                    })}
                    min="0"
                    max="100"
                    step="0.1"
                    aria-invalid={errors[`${country.name}-dividendTaxRate`] ? "true" : "false"}
                    aria-describedby={
                      errors[`${country.name}-dividendTaxRate`] ? `${country.name}-dividendTaxRate-error` : undefined
                    }
                  />
                  {errors[`${country.name}-dividendTaxRate`] && (
                    <p id={`${country.name}-dividendTaxRate-error`} className="text-red-500 text-sm mt-1">
                      {errors[`${country.name}-dividendTaxRate`]}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor={`${country.name}-isISK`}>ISK Account</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`${country.name}-isISK`}
                      checked={country.isISK}
                      onCheckedChange={(checked) => {
                        const newCountries = [...countries]
                        newCountries[index].isISK = checked
                        setCountries(newCountries)
                      }}
                    />
                    <span>{country.isISK ? "Enabled" : "Disabled"}</span>
                  </div>
                </div>
              </div>
              {country.isISK && (
                <div>
                  <Label htmlFor={`${country.name}-iskRate`}>ISK Rate (%)</Label>
                  <Input
                    id={`${country.name}-iskRate`}
                    type="number"
                    value={country.iskRate || ""}
                    onChange={handleNumericInput((e) => {
                      const newCountries = [...countries]
                      newCountries[index].iskRate = e
                      setCountries(newCountries)
                    })}
                    min="0"
                    max="100"
                    step="0.001"
                    aria-invalid={errors[`${country.name}-iskRate`] ? "true" : "false"}
                    aria-describedby={errors[`${country.name}-iskRate`] ? `${country.name}-iskRate-error` : undefined}
                  />
                  {errors[`${country.name}-iskRate`] && (
                    <p id={`${country.name}-iskRate-error`} className="text-red-500 text-sm mt-1">
                      {errors[`${country.name}-iskRate`]}
                    </p>
                  )}
                </div>
              )}
              {includeExtraCosts && (
                <div>
                  <Label htmlFor={`${country.name}-extraCosts`}>Extra Costs ({currency}/year)</Label>
                  <Input
                    id={`${country.name}-extraCosts`}
                    type="number"
                    value={extraCosts[country.name] || 0}
                    onChange={handleNumericInput((e) => handleExtraCostsChange(country.name, e))}
                    min="0"
                    step="100"
                  />
                </div>
              )}
            </div>
          ))}
          <div className="space-y-2">
            <h3 className="font-semibold">Add New Country</h3>
            <Select
              onValueChange={(value) =>
                setNewCountry(
                  additionalCountries.find((c) => c.name === value) || {
                    name: "",
                    taxRate: 0,
                    socialSecurityRate: 0,
                    dividendTaxRate: 0,
                    isISK: false,
                    iskRate: 0,
                  },
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {additionalCountries.map((country) => (
                  <SelectItem key={country.name} value={country.name}>
                    {country.name}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom Country</SelectItem>
              </SelectContent>
            </Select>
            {newCountry.name === "custom" && (
              <Input
                value={newCountry.name}
                onChange={(e) => setNewCountry({ ...newCountry, name: e.target.value })}
                placeholder="Country Name"
              />
            )}
            <Button type="button" onClick={addCountry}>
              Add Country
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Investment Scenarios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {scenarios.map((scenario, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Checkbox
                id={`visible-${scenario.name}`}
                checked={visibleScenarios.includes(scenario.name)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setVisibleScenarios([...visibleScenarios, scenario.name])
                  } else {
                    setVisibleScenarios(visibleScenarios.filter((s) => s !== scenario.name))
                  }
                }}
              />
              <Label htmlFor={`visible-${scenario.name}`}>{scenario.name}</Label>
              <Input
                type="number"
                value={scenario.rate || ""}
                onChange={handleNumericInput((e) => {
                  const newScenarios = [...scenarios]
                  newScenarios[index].rate = e
                  setScenarios(newScenarios)
                })}
                min="0"
                max="100"
                step="0.1"
                aria-invalid={errors[`${scenario.name}-rate`] ? "true" : "false"}
                aria-describedby={errors[`${scenario.name}-rate`] ? `${scenario.name}-rate-error` : undefined}
              />
              {errors[`${scenario.name}-rate`] && (
                <p id={`${scenario.name}-rate-error`} className="text-red-500 text-sm">
                  {errors[`${scenario.name}-rate`]}
                </p>
              )}
            </div>
          ))}
          <div className="space-y-2">
            <h3 className="font-semibold">Add New Scenario</h3>
            <div className="flex items-center space-x-2">
              <Input
                value={newScenario.name}
                onChange={(e) => setNewScenario({ ...newScenario, name: e.target.value })}
                placeholder="Scenario Name"
              />
              <Input
                type="number"
                value={newScenario.rate || ""}
                onChange={handleNumericInput((e) => setNewScenario({ ...newScenario, rate: e }))}
                placeholder="Annual Return Rate (%)"
                min="0"
                max="100"
                step="0.1"
              />
              <Button type="button" onClick={addScenario}>
                Add Scenario
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center space-x-2">
        <Switch id="includeExtraCosts" checked={includeExtraCosts} onCheckedChange={setIncludeExtraCosts} />
        <Label htmlFor="includeExtraCosts">Include Extra Costs of Living</Label>
      </div>

      <Button type="submit">Calculate Comparison</Button>
    </form>
  )
}

