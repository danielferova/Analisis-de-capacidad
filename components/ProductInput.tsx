// This component is no longer used in the main application flow.
// Product data is now managed via the table in `WorkshopCard.tsx`.
// This file can be safely removed in future cleanup.
import React from 'react';
import type { Product } from '../types';
import { TrashIcon } from '../constants';

interface ProductInputProps {
  product: Product;
  onUpdate: (id: string, field: keyof Product, value: any) => void;
  onRemove: (id: string) => void;
}

const ProductInput: React.FC<ProductInputProps> = ({ product, onUpdate, onRemove }) => {
  return (
    <div className="p-4 bg-gray-700 rounded-lg mb-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center animate-fade-in">
      <div className="md:col-span-3">
        <label htmlFor={`name-${product.id}`} className="block text-sm font-medium text-gray-300 mb-1">Nombre Producto</label>
        <input
          id={`name-${product.id}`}
          type="text"
          value={product.name}
          onChange={(e) => onUpdate(product.id, 'name', e.target.value)}
          placeholder="Ej: Valla Publicitaria"
          className="w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
        />
      </div>
      <div className="md:col-span-2">
        <label htmlFor={`hoursImpresion-${product.id}`} className="block text-sm font-medium text-gray-300 mb-1">Horas Impresión</label>
        <input
          id={`hoursImpresion-${product.id}`}
          type="number"
          min="0"
          value={product.hoursImpresion}
          onChange={(e) => onUpdate(product.id, 'hoursImpresion', parseFloat(e.target.value) || 0)}
          className="w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
        />
      </div>
       <div className="md:col-span-2">
        <label htmlFor={`hoursEstructuras-${product.id}`} className="block text-sm font-medium text-gray-300 mb-1">Horas Estructuras</label>
        <input
          id={`hoursEstructuras-${product.id}`}
          type="number"
          min="0"
          value={product.hoursEstructuras}
          onChange={(e) => onUpdate(product.id, 'hoursEstructuras', parseFloat(e.target.value) || 0)}
          className="w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
        />
      </div>
      <div className="md:col-span-2">
        <label htmlFor={`hoursInstalacion-${product.id}`} className="block text-sm font-medium text-gray-300 mb-1">Horas Instal.</label>
        <input
          id={`hoursInstalacion-${product.id}`}
          type="number"
          min="0"
          value={product.hoursInstalacion}
          onChange={(e) => onUpdate(product.id, 'hoursInstalacion', parseFloat(e.target.value) || 0)}
          className="w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
        />
      </div>
      <div className="md:col-span-3 flex justify-end pt-5">
        <button
          onClick={() => onRemove(product.id)}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-600 rounded-full transition-colors"
          aria-label="Eliminar producto"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
};

export default ProductInput;