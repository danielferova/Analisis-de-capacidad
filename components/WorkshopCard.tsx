
import React from 'react';
import type { Department, Product } from '../types';

interface WorkshopCardProps {
  departments: Department[];
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const WorkshopCard: React.FC<WorkshopCardProps> = ({ departments, setDepartments, products, setProducts }) => {

  const handleDepartmentChange = (id: string, value: number) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, availableHours: value } : d));
  };

  const handleProductChange = (id: string, field: keyof Product, value: any) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  return (
    <div className="space-y-8">
      {/* Department Capacities */}
      <div>
        <h2 className="text-2xl font-semibold text-teal-400 mb-4">1. Capacidad Mensual por Departamento (Horas)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {departments.map(dep => (
            <div key={dep.id} className="bg-gray-800 p-4 rounded-lg shadow-md">
              <label htmlFor={`horas-${dep.id}`} className="block text-sm font-medium text-gray-300 mb-2">{dep.name}</label>
              <input
                id={`horas-${dep.id}`}
                type="number"
                value={dep.availableHours}
                onChange={(e) => handleDepartmentChange(dep.id, parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div>
        <h2 className="text-2xl font-semibold text-teal-400 mb-4">2. Productos y Tiempos de Proceso</h2>
        <div className="overflow-x-auto bg-gray-800 p-4 rounded-lg shadow-md">
          <table className="w-full min-w-[1200px] text-sm text-left text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700">
              <tr>
                <th className="p-3">Producto</th>
                <th className="p-3 text-center">Precio Venta (Q)</th>
                <th className="p-3 text-center">Costo (Q)</th>
                <th className="p-3 text-center">Unidades/Mes (Plan Actual)</th>
                <th className="p-3 text-center">h/ud Impresión UV</th>
                <th className="p-3 text-center">h/ud Corte/UV</th>
                <th className="p-3 text-center">h/ud Rev. Artes</th>
                <th className="p-3 text-center">h/ud Secado</th>
                <th className="p-3 text-center">h/ud Estructuras</th>
                <th className="p-3 text-center">h/ud Instalación</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-gray-700">
                  <td className="p-2 font-medium">{p.name}</td>
                  <td className="p-2">
                    <input type="number" value={p.price} onChange={e => handleProductChange(p.id, 'price', parseFloat(e.target.value) || 0)} className="w-24 text-center bg-gray-800 border-b border-gray-600 focus:outline-none focus:border-teal-500" />
                  </td>
                  <td className="p-2">
                    <input type="number" value={p.cost} onChange={e => handleProductChange(p.id, 'cost', parseFloat(e.target.value) || 0)} className="w-24 text-center bg-gray-800 border-b border-gray-600 focus:outline-none focus:border-teal-500" />
                  </td>
                  <td className="p-2">
                    <input type="number" value={p.currentMonthlyUnits} onChange={e => handleProductChange(p.id, 'currentMonthlyUnits', parseInt(e.target.value) || 0)} className="w-24 text-center bg-gray-800 border-b border-gray-600 focus:outline-none focus:border-teal-500" />
                  </td>
                  <td className="p-2">
                     <input type="number" step="0.01" value={p.hoursImpresion} onChange={e => handleProductChange(p.id, 'hoursImpresion', parseFloat(e.target.value) || 0)} className="w-24 text-center bg-gray-800 border-b border-gray-600 focus:outline-none focus:border-teal-500" />
                  </td>
                   <td className="p-2">
                     <input type="number" step="0.01" value={p.hoursCorteUV} onChange={e => handleProductChange(p.id, 'hoursCorteUV', parseFloat(e.target.value) || 0)} className="w-24 text-center bg-gray-800 border-b border-gray-600 focus:outline-none focus:border-teal-500" />
                  </td>
                  <td className="p-2">
                     <input type="number" step="0.01" value={p.hoursArtes} onChange={e => handleProductChange(p.id, 'hoursArtes', parseFloat(e.target.value) || 0)} className="w-24 text-center bg-gray-800 border-b border-gray-600 focus:outline-none focus:border-teal-500" />
                  </td>
                  <td className="p-2">
                     <input type="number" step="0.01" value={p.hoursSecado} onChange={e => handleProductChange(p.id, 'hoursSecado', parseFloat(e.target.value) || 0)} className="w-24 text-center bg-gray-800 border-b border-gray-600 focus:outline-none focus:border-teal-500" />
                  </td>
                  <td className="p-2">
                     <input type="number" step="0.01" value={p.hoursEstructuras} onChange={e => handleProductChange(p.id, 'hoursEstructuras', parseFloat(e.target.value) || 0)} className="w-24 text-center bg-gray-800 border-b border-gray-600 focus:outline-none focus:border-teal-500" />
                  </td>
                  <td className="p-2">
                     <input type="number" step="0.01" value={p.hoursInstalacion} onChange={e => handleProductChange(p.id, 'hoursInstalacion', parseFloat(e.target.value) || 0)} className="w-24 text-center bg-gray-800 border-b border-gray-600 focus:outline-none focus:border-teal-500" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
           <p className="text-yellow-400 text-sm mt-4 font-semibold">
            * Por favor, introduce el precio de venta y costo para cada producto para habilitar el análisis financiero completo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkshopCard;
