import React from 'react';

export const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

export const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

// FIX: Replaced corrupted SVG path data with a valid path for the sparkles icon. This resolves the module export error.
export const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10.868 2.884c.321-.772 1.415-.772 1.736 0l1.83 4.401 4.753.392c.832.069 1.171 1.107.536 1.651l-3.62 3.292 1.056 4.637c.19 1.04-.734 1.842-1.564 1.332L10 16.428l-4.283 2.574c-.829.49-1.754-.292-1.564-1.332l1.056-4.637-3.62-3.292c-.635-.544-.296-1.582.536-1.651l4.753-.392 1.83-4.401Z" clipRule="evenodd" />
  </svg>
);


export const INITIAL_DEPARTMENTS = [
  // Capacidad calculada de la suma de personal de Impresión (7) y Artes Finales (1).
  // (8 personas * 44 h/semana * 4.333 sem/mes) = 1525 horas
  { id: 'impresion', name: 'Taller de Impresión (Arte/Mano de Obra)', availableHours: 1525 },
  // Capacidad calculada a partir de los datos reales de OEE de las 9 máquinas clave.
  // Suma de horas efectivas = (Horas Teóricas * Disponibilidad * Eficiencia * Calidad) para cada máquina.
  // Total correcto: 672 horas/mes.
  { id: 'maquinaria', name: 'Maquinaria Clave (OEE Real)', availableHours: 672 },
  // Capacidad calculada del personal de Estructuras.
  // (6 personas * 44 h/semana * 4.333 sem/mes) = 1144 horas
  { id: 'estructuras', name: 'Taller de Estructuras', availableHours: 1144 },
  // Capacidad calculada del personal de Instalación.
  // (8 personas * 44 h/semana * 4.333 sem/mes) = 1525 horas
  { id: 'instalacion', name: 'Equipo de Instalación', availableHours: 1525 },
];

export const INITIAL_PRODUCTS = [
  { id: '1', name: 'Vallas / Gigantografías', price: 3501.53, cost: 2128.06, currentMonthlyUnits: 25, hoursImpresion: 3.11, hoursArtes: 1, hoursEstructuras: 0, hoursInstalacion: 0.96 },
  { id: '2', name: 'Camión rotulado', price: 5065.16, cost: 3039.09, currentMonthlyUnits: 26, hoursImpresion: 5.31, hoursArtes: 1, hoursEstructuras: 3.82, hoursInstalacion: 2.06 },
  { id: '3', name: 'Adhesivos y lonas pequeñas', price: 930.98, cost: 558.19, currentMonthlyUnits: 240, hoursImpresion: 0.13, hoursArtes: 0.06, hoursEstructuras: 0, hoursInstalacion: 0.1 },
  { id: '4', name: 'Cenefas / Gondolas', price: 3512.50, cost: 1049.50, currentMonthlyUnits: 59, hoursImpresion: 7.73, hoursArtes: 1.1, hoursEstructuras: 5.19, hoursInstalacion: 2.17 },
  { id: '5', name: 'Caja de luz', price: 16875.00, cost: 10250.00, currentMonthlyUnits: 5, hoursImpresion: 18.71, hoursArtes: 1.1, hoursEstructuras: 17, hoursInstalacion: 7 },
  { id: '6', name: 'Salientes (soportes/sobresalientes visuales)', price: 6346.43, cost: 4038.23, currentMonthlyUnits: 4, hoursImpresion: 7.07, hoursArtes: 1, hoursEstructuras: 6.4, hoursInstalacion: 0.58 },
  { id: '7', name: 'Letras encajueladas (acero/acrílico)', price: 7689.33, cost: 4798.00, currentMonthlyUnits: 5, hoursImpresion: 0, hoursArtes: 0, hoursEstructuras: 0, hoursInstalacion: 0 },
  { id: '8', name: 'Medallas, trofeos, fichas de acrílico', price: 405.66, cost: 236.00, currentMonthlyUnits: 50, hoursImpresion: 6, hoursArtes: 1, hoursEstructuras: 0, hoursInstalacion: 0 },
  { id: '9', name: 'Stands / Estructura personalizada', price: 11265.00, cost: 7444.20, currentMonthlyUnits: 3, hoursImpresion: 0, hoursArtes: 0, hoursEstructuras: 0, hoursInstalacion: 0 },
];

export const HISTORICAL_REVENUE = [
  { month: 'Febrero', revenue: 414450.31 },
  { month: 'Marzo', revenue: 214619.26 },
  { month: 'Abril', revenue: 242243.69 },
  { month: 'Mayo', revenue: 404416.84 },
  { month: 'Junio', revenue: 127371.21 },
  { month: 'Julio', revenue: 263384.67 },
  { month: 'Agosto', revenue: 282048.49 },
  { month: 'Septiembre', revenue: 367944.44 },
  { month: 'Octubre', revenue: 141004.27 },
];