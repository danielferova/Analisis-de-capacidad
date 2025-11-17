import React from 'react';
import type { AnalysisResults } from '../types';
import { SparklesIcon } from '../constants';

interface ResultsDisplayProps {
  results: AnalysisResults | null;
  onGetSuggestions: () => void;
  isLoadingSuggestions: boolean;
  suggestions: string;
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

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, onGetSuggestions, isLoadingSuggestions, suggestions }) => {
  if (!results) return null;

  const top5Products = [...results.productAnalysis]
    .sort((a, b) => b.potentialProfit - a.potentialProfit)
    .slice(0, 5);
    
  const hasFinancials = results.plannedRevenue > 0;

  return (
    <div className="mt-10 bg-gray-800 p-6 rounded-xl shadow-lg animate-fade-in space-y-8">
      {/* Summary and Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-gray-900/50 p-6 rounded-lg flex flex-col justify-center items-center">
            <h3 className="text-xl font-semibold text-teal-400 mb-2">Diagnóstico Actual de la Planta</h3>
            <div className="text-center w-full">
                <p className="text-lg text-gray-400">Capacidad Real (Cumplimiento del Plan)</p>
                <p className={`text-7xl font-bold my-2 animate-pulse ${results.actualCapacityPercentage < 75 ? 'text-red-400' : 'text-yellow-400'}`}>
                    {results.actualCapacityPercentage.toFixed(1)}%
                </p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {/* Columna Realidad */}
                    <div className="p-3 bg-gray-800 rounded-lg text-center">
                        <p className="text-sm font-bold text-teal-300">Sostenible (Tu Realidad)</p>
                        <p className="text-xs text-gray-400 mt-2">Ingreso</p>
                        <p className="text-lg font-semibold text-white">
                           Q{results.actualSustainableRevenue.toLocaleString('es-GT', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">Utilidad</p>
                        <p className="text-lg font-bold text-green-400">
                           Q{results.sustainableProfit.toLocaleString('es-GT', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </p>
                    </div>
                     {/* Columna Meta */}
                     <div className="p-3 bg-gray-800 rounded-lg text-center">
                        <p className="text-sm font-bold text-gray-400">Planificado (Tu Meta)</p>
                         <p className="text-xs text-gray-500 mt-2">Ingreso</p>
                        <p className="text-lg font-semibold text-gray-300">
                           Q{results.plannedRevenue.toLocaleString('es-GT', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">Utilidad</p>
                        <p className="text-lg font-bold text-gray-300">
                           Q{results.plannedProfit.toLocaleString('es-GT', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </p>
                    </div>
                </div>
                 {/* Brecha de Oportunidad */}
                <div className="mt-4 p-4 bg-red-900/50 rounded-lg border border-red-700 col-span-1 md:col-span-2">
                    <p className="text-sm font-bold text-red-300">Brecha de Oportunidad Mensual</p>
                    <p className="text-2xl font-extrabold text-white">
                       - Q{results.opportunityGapProfit.toLocaleString('es-GT', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </p>
                     <p className="text-xs text-red-200 mt-1">
                      Esta es la **utilidad** que se está perdiendo cada mes por el cuello de botella.
                    </p>
                </div>
            </div>
        </div>
        <div className="lg:col-span-2 bg-gray-900/50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-teal-400 mb-2">Carga de Trabajo por Departamento</h3>
             <p className="text-sm text-gray-400 mb-6">
               El plan de producción actual sobrecarga el departamento de <span className="font-bold text-red-400">{results.bottleneckDepartmentName}</span>, creando una restricción que limita toda la capacidad de la planta.
             </p>
            <div className="space-y-6">
              {results.departmentUtilization.map(dep => (
                <UtilizationBar key={dep.departmentId} name={dep.name} required={dep.requiredHours} available={dep.availableHours} percentage={dep.utilizationPercentage} />
              ))}
            </div>
        </div>
      </div>

       {/* Product Analysis Table */}
      <div>
        <h3 className="text-xl font-semibold text-teal-400 mb-2">Análisis de Producción Sostenible (Mix Actual)</h3>
        <p className="text-sm text-gray-400 mb-4">Esta tabla compara las unidades que planeas producir contra las que tu capacidad actual realmente te permite, mostrando el impacto directo en la utilidad.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700">
              <tr>
                <th className="p-3">Producto</th>
                <th className="p-3 text-center">Unidades/Mes (Planificadas)</th>
                <th className="p-3 text-center">Unidades/Mes (Sostenibles)</th>
                <th className="p-3 text-center">Utilidad/Mes (Planificada)</th>
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