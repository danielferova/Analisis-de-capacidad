import React from 'react';
import type { AnalysisResults } from '../types';
import { SparklesIcon } from '../constants';
import HistoricalChart from './HistoricalChart'; // Import new component

interface ResultsDisplayProps {
  results: AnalysisResults | null;
  onGetSuggestions: () => void;
  isLoadingSuggestions: boolean;
  suggestions: string;
  historicalData: { month: string; revenue: number }[]; // Add prop
}


const UtilizationBar: React.FC<{ name: string; required: number; available: number; percentage: number }> = ({ name, required, available, percentage }) => {
  const color = percentage > 100 ? 'bg-red-600' : percentage > 95 ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500';
  const displayName = `${name} (${required.toFixed(0)} / ${available.toFixed(0)}h)`;
  const isOverloaded = percentage > 100;
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-300">{displayName}</span>
        <span className={`text-sm font-bold ${isOverloaded ? 'text-red-400' : 'text-gray-300'}`}>{percentage.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-4 relative overflow-hidden">
        <div 
          className={`${color} h-4 rounded-full absolute`} 
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
        {isOverloaded && (
           <div 
             className="bg-red-900/80 h-4 rounded-r-full absolute left-0 animate-pulse" 
             style={{ width: `${percentage}%` }}
           ></div>
        )}
      </div>
       {isOverloaded && (
         <p className="text-xs text-red-400 mt-1 text-right">
           Sobrecarga del {(percentage - 100).toFixed(1)}%
         </p>
       )}
    </div>
  );
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, onGetSuggestions, isLoadingSuggestions, suggestions, historicalData }) => {
  if (!results) return null;

  const top5Products = [...results.productAnalysis]
    .sort((a, b) => b.potentialProfit - a.potentialProfit)
    .slice(0, 5);
    
  const hasFinancials = results.currentProductionRevenue > 0;
  
  const formatCurrency = (value: number) => `Q${value.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const capacityPercentage = results.globalCapacityUtilization;
  let capacityColor = 'text-yellow-400'; // Default for 60-75% and 95-100%
  if (capacityPercentage > 100) {
      capacityColor = 'text-red-500'; // Overloaded
  } else if (capacityPercentage >= 75 && capacityPercentage <= 95) {
      capacityColor = 'text-green-400'; // Optimal
  } else if (capacityPercentage < 60) {
      capacityColor = 'text-red-400'; // Underutilized
  }
  
  const isPlanUnsustainable = results.bottleneckOverloadPercentage > 100;


  return (
    <div className="mt-10 bg-gray-800 p-6 rounded-xl shadow-lg animate-fade-in space-y-12">
      {/* Main grid for historical and diagnosis */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      
        {/* Left Column: Historical Chart */}
        <div className="lg:col-span-3">
          <HistoricalChart data={historicalData} averageRevenue={results.averageHistoricalRevenue} />
        </div>

        {/* Right Column: The main dashboard */}
        <div className="lg:col-span-2 flex flex-col space-y-8">
            <div className="bg-gray-900/50 p-6 rounded-lg flex flex-col items-center text-center">
              <h3 className="text-xl font-semibold text-teal-400">Utilización de Capacidad Global</h3>
              <p className="text-gray-400">Carga de Trabajo vs. Capacidad Total</p>
              <p className={`text-8xl font-bold my-4 ${capacityColor}`}>
                {results.globalCapacityUtilization.toFixed(1)}%
              </p>
               <div className="mt-4 p-4 bg-red-900/50 rounded-lg border border-red-700 w-full text-center">
                <p className="text-md font-bold text-red-300">Brecha de Oportunidad (Utilidad Potencial)</p>
                 <p className="text-sm text-gray-300 mb-1">(Potencial Máximo vs. Producción Actual)</p>
                <p className="text-3xl font-extrabold text-white my-1">
                  + {formatCurrency(results.opportunityGapProfit)}
                </p>
                <p className="text-xs text-red-200 mt-1">
                  Utilidad adicional posible al optimizar.
                </p>
              </div>
            </div>

            <div className="bg-gray-900/50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-teal-400 mb-2">Análisis Financiero Mensual</h3>
                <div className="space-y-4 mt-4">
                  
                  <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <p className="text-sm font-bold text-yellow-400">Promedio Histórico (Referencia)</p>
                    <p className="text-lg font-semibold text-white">{formatCurrency(results.averageHistoricalRevenue)} <span className="text-xs text-gray-400">(Ingreso)</span></p>
                  </div>

                  <div className={`p-3 bg-gray-800 rounded-lg border ${isPlanUnsustainable ? 'border-yellow-600' : 'border-gray-700'}`}>
                    <p className="text-sm font-bold text-gray-300">Plan de Producción (Teórico)</p>
                    <p className="text-lg font-semibold text-white">{formatCurrency(results.currentProductionRevenue)} <span className="text-xs text-gray-400">(Ingreso)</span></p>
                    <p className="text-lg font-bold text-white">{formatCurrency(results.currentProductionProfit)} <span className="text-xs text-gray-400">(Utilidad)</span></p>
                     {isPlanUnsustainable && (
                        <div className="mt-3 p-2 bg-yellow-900/50 border border-yellow-700 rounded-md text-xs text-yellow-300">
                            <p>
                                <span className="font-bold">¡Atención!</span> Este plan sobrecarga su cuello de botella (<span className="font-semibold">{results.bottleneckDepartmentName}</span>) y no es sostenible. La producción real se verá limitada.
                            </p>
                        </div>
                    )}
                  </div>
                  
                  <div className="p-3 bg-gray-800 rounded-lg border border-cyan-700">
                    <p className="text-sm font-bold text-cyan-400">Potencial Sostenible (con mix actual)</p>
                    <p className="text-xs text-gray-400 mb-1">(Llevando el cuello de botella al 100%)</p>
                    <p className="text-lg font-semibold text-white">{formatCurrency(results.maxCapacityRevenue)} <span className="text-xs text-gray-400">(Ingreso)</span></p>
                    <p className="text-lg font-bold text-cyan-400">{formatCurrency(results.maxCapacityProfit)} <span className="text-xs text-gray-400">(Utilidad)</span></p>
                  </div>

                </div>
            </div>
        </div>
      </div>
      
       {/* Utilization Bars */}
       <div className="bg-gray-900/50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-teal-400 mb-2">Carga de Trabajo por Departamento</h3>
             <p className="text-sm text-gray-400 mb-6">
               El análisis muestra que el mix de producción actual sobrecarga <span className="font-bold text-red-400">{results.bottleneckDepartmentName}</span>, creando la restricción que limita toda la capacidad de la planta.
             </p>
            <div className="space-y-6">
              {results.departmentUtilization.map(dep => (
                <UtilizationBar key={dep.departmentId} name={dep.name} required={dep.requiredHours} available={dep.availableHours} percentage={dep.utilizationPercentage} />
              ))}
            </div>
        </div>

       {/* Product Analysis Table */}
      <div>
        <h3 className="text-xl font-semibold text-teal-400 mb-2">Análisis de Producción: Realidad vs. Sostenibilidad</h3>
        <p className="text-sm text-gray-400 mb-4">Esta tabla compara las unidades de tu producción actual contra las que tu capacidad realmente te permite de forma sostenible, mostrando el impacto directo en la utilidad.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700">
              <tr>
                <th className="p-3">Producto</th>
                <th className="p-3 text-center">Unidades/Mes (Actual)</th>
                <th className="p-3 text-center">Unidades/Mes (Sostenibles)</th>
                <th className="p-3 text-center">Utilidad/Mes (Actual)</th>
                <th className="p-3 text-center">Utilidad/Mes (Sostenible)</th>
                <th className="p-3 text-center">Cuello de Botella (Individual)</th>
              </tr>
            </thead>
            <tbody>
              {results.productAnalysis.map(p => (
                <tr key={p.productId} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3 text-center text-lg">{p.currentMonthlyUnits}</td>
                  <td className="p-3 text-center font-bold text-teal-400 text-lg">{p.sustainableUnits.toFixed(0)}</td>
                  <td className="p-3 text-center">Q{p.currentProfit.toLocaleString('es-GT', { style: 'decimal', minimumFractionDigits: 2 })}</td>
                  <td className="p-3 text-center font-semibold text-green-400">Q{(p.sustainableUnits * (p.price - p.cost)).toLocaleString('es-GT', { style: 'decimal', minimumFractionDigits: 2 })}</td>
                  <td className={`p-3 text-center font-semibold ${p.bottleneck !== 'N/A' ? 'text-yellow-400' : 'text-green-400'}`}>{p.bottleneck}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Top 5 Products by Individual Potential */}
      {hasFinancials && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-teal-400 mb-2">Top 5 Productos por Rentabilidad Potencial Individual</h3>
          <p className="text-sm text-gray-400 mb-4">Este análisis teórico muestra el potencial máximo si dedicaras el 100% de la capacidad a un solo producto. Úsalo para identificar tus productos "estrella" y guiar tu estrategia de ventas.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                <tr>
                  <th className="p-3">Producto</th>
                  <th className="p-3 text-center">Max Unidades/Mes</th>
                  <th className="p-3 text-center">Utilidad Potencial</th>
                  <th className="p-3 text-center">Ingreso Potencial</th>
                </tr>
              </thead>
              <tbody>
                {top5Products.map(p => (
                  <tr key={p.productId} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3 text-center font-bold text-teal-400 text-lg">{p.maxUnits.toFixed(0)}</td>
                    <td className="p-3 text-center font-semibold text-green-400">Q{p.potentialProfit.toLocaleString('es-GT', { style: 'decimal', minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-center">Q{p.potentialRevenue.toLocaleString('es-GT', { style: 'decimal', minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Suggestions */}
      {hasFinancials && (
        <div className="pt-6 border-t border-gray-700">
            <button 
              onClick={onGetSuggestions}
              disabled={isLoadingSuggestions}
              className="w-full md:w-auto flex items-center justify-center py-2 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transition-all disabled:opacity-50 disabled:cursor-wait"
            >
              <SparklesIcon />
              {isLoadingSuggestions ? 'Generando Estrategia...' : 'Obtener Plan de Optimización con IA'}
            </button>
            {suggestions && (
                <div className="mt-4 p-6 bg-gray-900 rounded-lg">
                    <h4 className="text-xl font-semibold text-indigo-400 mb-3">Plan de Optimización Estratégica</h4>
                    <div className="prose prose-invert max-w-none text-gray-300" dangerouslySetInnerHTML={{ __html: suggestions.replace(/\n/g, '<br />') }} />
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;