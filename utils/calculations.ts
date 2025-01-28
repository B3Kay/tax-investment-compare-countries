export interface Country {
  name: string;
  taxRate: number; // in percentage
  socialSecurityRate: number; // in percentage or fixed
  socialSecurityFixed: number;
  dividendTaxRate: number; // in percentage
  isISK: boolean;
  iskRate?: number; // optional, as it applies only if `isISK` is true
}

export interface Scenario {
  name: string;
  rate: number; // annual rate of return in percentage
}

export interface ComparisonFormData {
  annualIncome: number; // annual income in the selected currency
  investmentPercentage: number; // in percentage of net income
  startingInvestment: number; // initial investment amount
  timeHorizon: number; // in years
  countries: Country[];
  includeExtraCosts: boolean; // flag to include extra costs or not
  extraCosts: { [countryName: string]: number }; // extra costs per country
  scenarios: Scenario[];
  selectedScenario: string; // name of the selected scenario
  currency: string; // currency used for calculations
  incomeType: "monthly" | "annual"; // type of income
  socialSecurityType: { [countryName: string]: "fixed" | "percentage" }; // contribution type per country
}

export interface GraphData {
  year: number; // Explicitly declare `year` as a property
  [key: string]: number | undefined; // Allow dynamic keys for country-scenario combinations
}
export type ComparisonResult = ReturnType<typeof calculateComparison>;

export function calculateComparison(formData: ComparisonFormData) {
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
  } = formData;

  const graphData: GraphData[] = [];
  const countryResults = countries.map((country) => {
    const { name, taxRate, socialSecurityRate, dividendTaxRate, isISK, iskRate } = country;
    let socialSecurityContributions: number;

    if (socialSecurityType[name] === "fixed") {
      socialSecurityContributions = socialSecurityRate * (incomeType === "monthly" ? 12 : 1);
    } else {
      socialSecurityContributions = annualIncome * (socialSecurityRate / 100);
    }

    const taxableIncome = annualIncome - socialSecurityContributions;
    const incomeTax = taxableIncome * (taxRate / 100);
    const netIncome = annualIncome - incomeTax - socialSecurityContributions;
    const yearlyInvestment = netIncome * (investmentPercentage / 100);
    const monthlyInvestment = yearlyInvestment / 12;

    const scenarioResults = scenarios.reduce<Record<string, { investmentGains: number; finalNetWorth: number }>>(
      (acc, scenario) => {
        let totalInvestment = startingInvestment;
        let totalGains = 0;

        for (let year = 1; year <= timeHorizon; year++) {
          const yearlyGain = totalInvestment * (scenario.rate / 100);
          let taxedGain: number;

          if (isISK && iskRate !== undefined) {
            const iskTax = totalInvestment * (iskRate / 100);
            taxedGain = yearlyGain - iskTax;
          } else {
            taxedGain = yearlyGain * (1 - dividendTaxRate / 100);
          }

          totalGains += taxedGain;
          totalInvestment += yearlyInvestment + taxedGain;

          if (includeExtraCosts && extraCosts[name]) {
            totalInvestment -= extraCosts[name];
          }

          if (!graphData[year - 1]) {
            graphData[year - 1] = { year };
          }
          graphData[year - 1][`${name}-${scenario.name}`] = totalInvestment;
        }

        acc[scenario.name] = {
          investmentGains: totalGains,
          finalNetWorth: totalInvestment,
        };

        return acc;
      },
      {}
    );

    return {
      name,
      netIncome,
      socialSecurityContributions,
      socialSecurityType: socialSecurityType[name] || "percentage",
      yearlyInvestment,
      monthlyInvestment,
      ...scenarioResults[selectedScenario],
    };
  });

  return {
    countries: countryResults,
    graphData,
    currency,
    incomeType,
  };
}
