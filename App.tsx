import React, { useState } from 'react';
import Header from './components/Header';
import WorkshopCard from './components/WorkshopCard';
import ResultsDisplay from './components/ResultsDisplay';
import Spinner from './components/Spinner';
import type { Department, Product, AnalysisResults, ProductAnalysis, DepartmentUtilization } from './types';
import { INITIAL_DEPARTMENTS, INITIAL_PRODUCTS, HISTORICAL_REVENUE } from './constants';
import { getSuggestionsFromGemini } from './services/geminiService';

const App: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string>('');

  const handleCalculate = () => {
    setIsLoading(true);
    setSuggestions('');
    setResults(null);

    setTimeout(() => {
      // 1. Calculate department utilization based on the current production plan
      const requiredHours: { [key in Department['id']]: number } = { impresion: 0, maquinaria: 0, estructuras: 0, instalacion: 0 };
      products.forEach(p => {
        requiredHours.impresion += p.currentMonthlyUnits * p.hoursArtes;
        requiredHours.maquinaria += p.currentMonthlyUnits * p.hoursImpresion;
        requiredHours.estructuras += p.currentMonthlyUnits * p.hoursEstructuras;
        requiredHours.instalacion += p.currentMonthlyUnits * p.hoursInstalacion;
      });

      const departmentUtilization: DepartmentUtilization[] = departments.map(d => ({
        departmentId: d.id,
        name: d.name,
        availableHours: d.availableHours,
        requiredHours: requiredHours[d.id],
        utilizationPercentage: d.availableHours > 0 ? (requiredHours[d.id] / d.availableHours) * 100 : 0,
      }));

      // 2. Find the bottleneck department (highest utilization)
      const bottleneckDepartment = departmentUtilization.reduce((max, current) =>
        max.utilizationPercentage > current.utilizationPercentage ? max : current
      );
      const bottleneckOverloadRatio = bottleneckDepartment.utilizationPercentage > 100 ? bottleneckDepartment.utilizationPercentage / 100 : 1;

      // 3. Analyze each product's potential and sustainable units
      const productAnalysis: ProductAnalysis[] = products.map(p => {
        // Max units if 100% of capacity was dedicated to this product
        const maxFromImpresion = p.hoursArtes > 0 ? departments.find(d => d.id === 'impresion')!.availableHours / p.hoursArtes : Infinity;
        const maxFromMaquinaria = p.hoursImpresion > 0 ? departments.find(d => d.id === 'maquinaria')!.availableHours / p.hoursImpresion : Infinity;
        const maxFromEstructuras = p.hoursEstructuras > 0 ? departments.find(d => d.id === 'estructuras')!.availableHours / p.hoursEstructuras : Infinity;
        const maxFromInstalacion = p.hoursInstalacion > 0 ? departments.find(d => d.id === 'instalacion')!.availableHours / p.hoursInstalacion : Infinity;
        
        const maxUnits = Math.min(maxFromImpresion, maxFromMaquinaria, maxFromEstructuras, maxFromInstalacion);
        
        let bottleneck: string = 'N/A';
        if (maxUnits !== Infinity) {
          const bottlenecks = [];
          if (maxUnits.toFixed(2) === maxFromImpresion.toFixed(2)) bottlenecks.push('Impresión (Mano Obra)');
          if (maxUnits.toFixed(2) === maxFromMaquinaria.toFixed(2)) bottlenecks.push('Maquinaria');
          if (maxUnits.toFixed(2) === maxFromEstructuras.toFixed(2)) bottlenecks.push('Estructuras');
          if (maxUnits.toFixed(2) === maxFromInstalacion.toFixed(2)) bottlenecks.push('Instalación');
          bottleneck = bottlenecks.join(' / ');
        }
        
        const finalMaxUnits = maxUnits === Infinity ? 0 : maxUnits;
        const unitProfit = p.price - p.cost;

        return {
          productId: p.id,
          name: p.name,
          price: p.price,
          cost: p.cost,
          currentMonthlyUnits: p.currentMonthlyUnits,
          // Sustainable units are the planned units scaled down by the bottleneck overload
          sustainableUnits: p.currentMonthlyUnits / bottleneckOverloadRatio,
          currentRevenue: p.currentMonthlyUnits * p.price,
          currentProfit: p.currentMonthlyUnits * unitProfit,
          maxUnits: finalMaxUnits,
          potentialRevenue: finalMaxUnits * p.price,
          potentialProfit: finalMaxUnits * unitProfit,
          bottleneck,
          hoursImpresionAtMax: finalMaxUnits * p.hoursArtes,
          hoursMaquinariaAtMax: finalMaxUnits * p.hoursImpresion,
          hoursEstructurasAtMax: finalMaxUnits * p.hoursEstructuras,
          hoursInstalacionAtMax: finalMaxUnits * p.hoursInstalacion,
        };
      });
      
      // 4. Calculate Planned vs. Sustainable financials
      const plannedRevenue = productAnalysis.reduce((sum, p) => sum + p.currentRevenue, 0);
      const plannedProfit = productAnalysis.reduce((sum, p) => sum + p.currentProfit, 0);
      const actualSustainableRevenue = productAnalysis.reduce((sum, p) => sum + (p.sustainableUnits * p.price), 0);
      const sustainableProfit = productAnalysis.reduce((sum, p) => sum + (p.sustainableUnits * (p.price - p.cost)), 0);

      // 5. Calculate capacity and opportunity gaps based on the PLAN vs REALITY
      // The capacity is what percentage of your plan you can actually fulfill.
      const actualCapacityPercentage = plannedRevenue > 0 ? (actualSustainableRevenue / plannedRevenue) * 100 : 0;
      const opportunityGapRevenue = plannedRevenue - actualSustainableRevenue;
      const opportunityGapProfit = plannedProfit - sustainableProfit;

      setResults({
        departmentUtilization,
        productAnalysis,
        plannedRevenue,
        plannedProfit,
        actualSustainableRevenue,
        sustainableProfit,
        bottleneckDepartmentName: bottleneckDepartment.name,
        bottleneckOverloadPercentage: bottleneckDepartment.utilizationPercentage,
        actualCapacityPercentage,
        opportunityGapRevenue,
        opportunityGapProfit,
      });

      setIsLoading(false);
    }, 500);
  };
  
  const handleGetSuggestions = async () => {
    if (!results) return;
    setIsLoadingSuggestions(true);
    const aiSuggestions = await getSuggestionsFromGemini(departments, products, results);
    setSuggestions(aiSuggestions);
    setIsLoadingSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        
        <WorkshopCard
          departments={departments}
          setDepartments={setDepartments}
          products={products}
          setProducts={setProducts}
        />
        
        <div className="mt-8 text-center">
          <button
            onClick={handleCalculate}
            disabled={isLoading}
            className="w-full md:w-1/2 lg:w-1/3 py-3 px-6 bg-teal-600 text-white font-bold text-lg rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 transition-all disabled:opacity-50 disabled:cursor-wait flex items-center justify-center mx-auto"
          >
            {isLoading ? 'Analizando...' : 'Analizar Capacidad y Rentabilidad'}
            {isLoading && <Spinner />}
          </button>
        </div>
        
        <ResultsDisplay 
          results={results} 
          onGetSuggestions={handleGetSuggestions} 
          isLoadingSuggestions={isLoadingSuggestions} 
          suggestions={suggestions} 
        />
      </main>
      <footer className="text-center py-4 text-gray-600 text-sm">
        <p>Desarrollado con React, Tailwind CSS y Gemini AI.</p>
      </footer>
    </div>
  );
};

export default App;