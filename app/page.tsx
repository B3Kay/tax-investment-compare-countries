"use client"

import { useState, useMemo } from "react";
import ComparisonForm from "../components/ComparisonForm";
import ComparisonGraph from "../components/ComparisonGraph";
import ComparisonSummary from "../components/ComparisonSummary";
import { calculateComparison } from "../utils/calculations";

import type { ComparisonFormData, ComparisonResult } from "../utils/calculations"; // Ensure this is correctly exported



export default function Home() {
  const [comparisonData, setComparisonData] = useState<ComparisonResult | null>(null);
  const [visibleCountries, setVisibleCountries] = useState<string[]>([]);
  const [visibleScenarios, setVisibleScenarios] = useState<string[]>([]);

  const handleComparisonSubmit = (formData: ComparisonFormData) => {
    const result = calculateComparison(formData);
    setComparisonData(result);
    setVisibleCountries(formData.countries.map((c) => c.name));
    setVisibleScenarios(formData.scenarios.map((s) => s.name));
  };

  const memoizedComparisonGraph = useMemo(() => {
    if (comparisonData) {
      return (
        <ComparisonGraph
          data={comparisonData}
          visibleCountries={visibleCountries}
          visibleScenarios={visibleScenarios}
        />
      )
    }
    return null
  }, [comparisonData, visibleCountries, visibleScenarios])

  const memoizedComparisonSummary = useMemo(() => {
    if (comparisonData) {
      return (
        <ComparisonSummary
          data={comparisonData}
          visibleCountries={visibleCountries}
        />
      )
    }
    return null
  }, [comparisonData, visibleCountries])

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Tax & Investment Comparison Tool</h1>
      <ComparisonForm onSubmit={handleComparisonSubmit} />
      {memoizedComparisonGraph}
      {memoizedComparisonSummary}
    </main>
  )
}

