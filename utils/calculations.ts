interface Country {
  name: string
  taxRate: number
  socialSecurityRate: number
  dividendTaxRate: number
  isISK: boolean
  iskRate?: number
}

interface Scenario {
  name: string
  rate: number
}

interface FormData {
  annualIncome: number
  investmentPercentage: number
  startingInvestment: number
  timeHorizon: number
  countries: Country[]
  includeExtraCosts: boolean
  extraCosts: { [key: string]: number }
  scenarios: Scenario[]
  selectedScenario: string
  currency: string
  incomeType: string
  socialSecurityType: { [key: string]: string }
}

export function calculateComparison(formData: FormData) {
  const {
    annualIncome,
    investmentPercentage,
    startingInvestment,
    timeHorizon,
    countries,
    includeExtraCosts,
    extraCosts,
    scenarios,
    selectedScenario,
    currency,
    incomeType,
    socialSecurityType,
  } = formData

  const graphData = []
  const countryResults = countries.map((country) => {
    const { name, taxRate, socialSecurityRate, dividendTaxRate, isISK, iskRate } = country
    let socialSecurityContributions

    if (socialSecurityType[name] === "fixed") {
      socialSecurityContributions = socialSecurityRate * (incomeType === "monthly" ? 12 : 1)
    } else {
      socialSecurityContributions = annualIncome * (socialSecurityRate / 100)
    }

    const taxableIncome = annualIncome - socialSecurityContributions
    const incomeTax = taxableIncome * (taxRate / 100)
    const netIncome = annualIncome - incomeTax - socialSecurityContributions
    const yearlyInvestment = netIncome * (investmentPercentage / 100)
    const monthlyInvestment = yearlyInvestment / 12

    const scenarioResults = scenarios.reduce((acc, scenario) => {
      let totalInvestment = startingInvestment
      let totalGains = 0

      for (let year = 1; year <= timeHorizon; year++) {
        const yearlyGain = totalInvestment * (scenario.rate / 100)
        let taxedGain

        if (isISK) {
          const iskTax = totalInvestment * (iskRate / 100)
          taxedGain = yearlyGain - iskTax
        } else {
          taxedGain = yearlyGain * (1 - dividendTaxRate / 100)
        }

        totalGains += taxedGain
        totalInvestment += yearlyInvestment + taxedGain

        if (includeExtraCosts && extraCosts[name]) {
          totalInvestment -= extraCosts[name]
        }

        if (!graphData[year - 1]) {
          graphData[year - 1] = { year }
        }
        graphData[year - 1][`${name}-${scenario.name}`] = totalInvestment
      }

      acc[scenario.name] = {
        investmentGains: totalGains,
        finalNetWorth: totalInvestment,
      }

      return acc
    }, {})

    return {
      name,
      netIncome,
      socialSecurityContributions,
      socialSecurityType: socialSecurityType[name] || "percentage",
      yearlyInvestment,
      monthlyInvestment,
      ...scenarioResults[selectedScenario],
    }
  })

  return {
    countries: countryResults,
    graphData,
    currency,
    incomeType,
  }
}

