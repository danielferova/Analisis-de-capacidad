
import React, { useState } from 'react';
import Header from './components/Header';
import WorkshopCard from './components/WorkshopCard';
import ResultsDisplay from './components/ResultsDisplay';
import Spinner from './components/Spinner';
import type { Department, Product, AnalysisResults, ProductAnalysis, DepartmentUtilization, MaxMixAnalysis } from './types';
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
      const requiredHours: { [key in Department['id']]: number } = { impresion: 0, maquinaria: 0, estructuras: 0, instalacion: 0, artes: 0 };
      products.forEach(p => {
        const machineHours = p.hoursImpresion + p.hoursCorteUV;
        // Printing & Cutting workload is applied to both Machine time ('maquinaria') and Labor ('impresion')
        requiredHours.impresion += p.currentMonthlyUnits * machineHours;
        requiredHours.maquinaria += p.currentMonthlyUnits * machineHours;
        requiredHours.estructuras += p.currentMonthlyUnits * p.hoursEstructuras;
        requiredHours.instalacion += p.currentMonthlyUnits * p.hoursInstalacion;
        requiredHours.artes += p.currentMonthlyUnits * p.hoursArtes;
        // NOTE: hoursSecado is captured in the data but not added to a specific department's load.
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
      
      const bottleneckScalingFactor = bottleneckDepartment.requiredHours > 0 ? bottleneckDepartment.availableHours / bottleneckDepartment.requiredHours : 1;

      // 3. Analyze each product's potential and sustainable units
      const productAnalysis: ProductAnalysis[] = products.map(p => {
        const totalMachineHoursPerUnit = p.hoursImpresion + p.hoursCorteUV;

        // Max units if 100% of capacity was dedicated to this product
        const maxFromImpresion = totalMachineHoursPerUnit > 0 ? departments.find(d => d.id === 'impresion')!.availableHours / totalMachineHoursPerUnit : Infinity;
        const maxFromMaquinaria = totalMachineHoursPerUnit > 0 ? departments.find(d => d.id === 'maquinaria')!.availableHours / totalMachineHoursPerUnit : Infinity;
        const maxFromEstructuras = p.hoursEstructuras > 0 ? departments.find(d => d.id === 'estructuras')!.availableHours / p.hoursEstructuras : Infinity;
        const maxFromInstalacion = p.hoursInstalacion > 0 ? departments.find(d => d.id === 'instalacion')!.availableHours / p.hoursInstalacion : Infinity;
        const maxFromArtes = p.hoursArtes > 0 ? departments.find(d => d.id === 'artes')!.availableHours / p.hoursArtes : Infinity;
        
        const maxUnits = Math.min(maxFromImpresion, maxFromMaquinaria, maxFromEstructuras, maxFromInstalacion, maxFromArtes);
        
        let bottleneck: string = 'N/A';
        if (maxUnits !== Infinity) {
          const bottlenecks = [];
          if (maxUnits.toFixed(2) === maxFromImpresion.toFixed(2)) bottlenecks.push('Impresión (Mano Obra)');
          if (maxUnits.toFixed(2) === maxFromMaquinaria.toFixed(2)) bottlenecks.push('Maquinaria');
          if (maxUnits.toFixed(2) === maxFromEstructuras.toFixed(2)) bottlenecks.push('Estructuras');
          if (maxUnits.toFixed(2) === maxFromInstalacion.toFixed(2)) bottlenecks.push('Instalación');
          if (maxUnits.toFixed(2) === maxFromArtes.toFixed(2)) bottlenecks.push('Artes Finales');
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
          sustainableUnits: p.currentMonthlyUnits * bottleneckScalingFactor,
          currentRevenue: p.currentMonthlyUnits * p.price,
          currentProfit: p.currentMonthlyUnits * unitProfit,
          maxUnits: finalMaxUnits,
          potentialRevenue: finalMaxUnits * p.price,
          potentialProfit: finalMaxUnits * unitProfit,
          bottleneck,
          hoursImpresionAtMax: finalMaxUnits * totalMachineHoursPerUnit,
          hoursMaquinariaAtMax: finalMaxUnits * totalMachineHoursPerUnit,
          hoursEstructurasAtMax: finalMaxUnits * p.hoursEstructuras,
          hoursInstalacionAtMax: finalMaxUnits * p.hoursInstalacion,
          hoursArtesAtMax: finalMaxUnits * p.hoursArtes,
        };
      });
      
      // 4. Calculate Current, Sustainable, and Max Potential financials
      const currentProductionRevenue = productAnalysis.reduce((sum, p) => sum + p.currentRevenue, 0);
      const currentProductionProfit = productAnalysis.reduce((sum, p) => sum + p.currentProfit, 0);
      const sustainableRevenue = productAnalysis.reduce((sum, p) => sum + (p.sustainableUnits * p.price), 0);
      const sustainableProfit = productAnalysis.reduce((sum, p) => sum + (p.sustainableUnits * (p.price - p.cost)), 0);
      
      // 5. Calculate global capacity and potential based on strategic OEE
      const OEE_UTILIZATION = 68.4;
      const globalCapacityUtilization = OEE_UTILIZATION;
      const expansionFactor = OEE_UTILIZATION > 0 ? 100 / OEE_UTILIZATION : 1;
      
      const maxCapacityRevenue = currentProductionRevenue * expansionFactor;
      const maxCapacityProfit = currentProductionProfit * expansionFactor;

      // 6. NUEVO: Calculate max sustainable production with current mix
      const maxMixAnalysis: MaxMixAnalysis[] = products.map(p => {
        const unitProfit = p.price - p.cost;
        const maxUnitsWithMix = p.currentMonthlyUnits * expansionFactor;
        return {
            productId: p.id,
            name: p.name,
            currentUnits: p.currentMonthlyUnits,
            maxUnitsWithMix: maxUnitsWithMix,
            maxProfitWithMix: maxUnitsWithMix * unitProfit,
        };
      });

      // 7. Calculate the opportunity gap
      const opportunityGapRevenue = maxCapacityRevenue - currentProductionRevenue;
      const opportunityGapProfit = maxCapacityProfit - currentProductionProfit;

      // 8. Calculate historical average
      const totalHistoricalRevenue = HISTORICAL_REVENUE.reduce((sum, item) => sum + item.revenue, 0);
      const averageHistoricalRevenue = totalHistoricalRevenue > 0 ? totalHistoricalRevenue / HISTORICAL_REVENUE.length : 0;

      setResults({
        departmentUtilization,
        productAnalysis,
        maxMixAnalysis, // NUEVO
        currentProductionRevenue,
        currentProductionProfit,
        sustainableRevenue,
        sustainableProfit,
        averageHistoricalRevenue,
        bottleneckDepartmentName: bottleneckDepartment.name,
        bottleneckOverloadPercentage: bottleneckDepartment.utilizationPercentage,
        globalCapacityUtilization,
        expansionFactor, // NUEVO
        opportunityGapRevenue,
        opportunityGapProfit,
        maxCapacityRevenue,
        maxCapacityProfit,
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
          historicalData={HISTORICAL_REVENUE}
        />
      </main>
      <footer className="text-center py-4 text-gray-600 text-sm">
        <p>Desarrollado con React, Tailwind CSS y Gemini AI.</p>
      </footer>
    </div>
  );
};

export default App;