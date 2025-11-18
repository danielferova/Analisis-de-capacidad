import React from 'react';

interface HistoricalData {
  month: string;
  revenue: number;
}

interface HistoricalChartProps {
  data: HistoricalData[];
  averageRevenue: number;
}

const formatCurrency = (value: number) => `Q${value.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const HistoricalChart: React.FC<HistoricalChartProps> = ({ data, averageRevenue }) => {
  if (!data || data.length === 0) return null;

  const chartWidth = 500;
  const chartHeight = 300;
  const padding = 50;

  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const yAxisMax = Math.ceil(maxRevenue / 100000) * 100000;

  const xScale = (index: number) => padding + (index * (chartWidth - 2 * padding)) / (data.length - 1);
  const yScale = (revenue: number) => chartHeight - padding - (revenue / yAxisMax) * (chartHeight - 2 * padding);

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.revenue)}`).join(' ');
  
  const yAxisLabels = Array.from({ length: 6 }, (_, i) => {
    const value = yAxisMax * (i / 5);
    return {
      value: value,
      y: yScale(value)
    };
  });


  return (
    <div className="bg-gray-900/50 p-6 rounded-lg">
      <h3 className="text-xl font-semibold text-teal-400 mb-2">Análisis de Ingresos Históricos</h3>
      <p className="text-sm text-gray-400 mb-6">
        Estos son tus ingresos mensuales reales. Úsalos como punto de referencia para evaluar tu rendimiento actual y potencial.
      </p>
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Chart */}
        <div className="flex-grow">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto" aria-labelledby="chart-title">
            <title id="chart-title">Gráfico de Ingresos Históricos</title>
            {/* Y-Axis */}
            <g className="text-xs fill-current text-gray-400">
              {yAxisLabels.map(label => (
                <g key={label.value}>
                  <text x={padding - 10} y={label.y + 4} textAnchor="end">{`Q${(label.value / 1000).toFixed(0)}k`}</text>
                  <line x1={padding} y1={label.y} x2={chartWidth - padding} y2={label.y} className="stroke-current text-gray-700" strokeWidth="0.5" />
                </g>
              ))}
            </g>

            {/* X-Axis */}
            <g className="text-xs fill-current text-gray-400">
              {data.map((d, i) => (
                <text key={d.month} x={xScale(i)} y={chartHeight - padding + 20} textAnchor="middle">{d.month.substring(0, 3)}</text>
              ))}
            </g>

            {/* Data Line */}
            <path d={linePath} fill="none" className="stroke-current text-teal-400" strokeWidth="2" />

            {/* Data Points and Tooltips */}
            {data.map((d, i) => (
              <g key={i} className="group">
                 <circle cx={xScale(i)} cy={yScale(d.revenue)} r="4" className="fill-current text-teal-400 stroke-current text-gray-900" strokeWidth="2" />
                 <g className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <rect x={xScale(i) - 40} y={yScale(d.revenue) - 35} width="80" height="25" rx="4" className="fill-current text-gray-800" />
                    <text x={xScale(i)} y={yScale(d.revenue) - 18} textAnchor="middle" className="text-xs fill-current text-white font-bold">{formatCurrency(d.revenue)}</text>
                 </g>
              </g>
            ))}
             {/* Average Line */}
            <line 
                x1={padding} y1={yScale(averageRevenue)} 
                x2={chartWidth - padding} y2={yScale(averageRevenue)} 
                className="stroke-current text-yellow-500" 
                strokeWidth="1.5"
                strokeDasharray="4 4" 
            />
            <text x={chartWidth - padding + 5} y={yScale(averageRevenue) + 4} className="text-xs fill-current text-yellow-500">Promedio</text>

          </svg>
        </div>

        {/* Data Table */}
        <div className="w-full md:w-64 bg-gray-800 p-2 rounded-lg border border-gray-700 flex-shrink-0">
          <table className="w-full text-sm">
            <thead className="bg-orange-600 text-white">
              <tr>
                <th colSpan={2} className="p-2 text-center font-bold">INGRESOS HISTÓRICOS</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {data.map(item => (
                <tr key={item.month} className="border-b border-gray-700">
                  <td className="p-2">{item.month}</td>
                  <td className="p-2 text-right font-mono">{formatCurrency(item.revenue)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="text-white font-bold">
              <tr>
                <td className="p-2">Promedio</td>
                <td className="p-2 text-right font-mono">{formatCurrency(averageRevenue)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistoricalChart;
