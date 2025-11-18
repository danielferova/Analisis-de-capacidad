
export interface Department {
  id: 'impresion' | 'estructuras' | 'instalacion' | 'maquinaria' | 'artes';
  name: string;
  availableHours: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  currentMonthlyUnits: number;
  hoursImpresion: number;
  hoursCorteUV: number; // NUEVO: Tiempo de corte/grabado láser/UV
  hoursArtes: number;
  hoursEstructuras: number;
  hoursInstalacion: number;
  hoursSecado: number;
}

export interface DepartmentUtilization {
  departmentId: 'impresion' | 'estructuras' | 'instalacion' | 'maquinaria' | 'artes';
  name: string;
  requiredHours: number;
  availableHours: number;
  utilizationPercentage: number;
}

export interface ProductAnalysis {
  productId: string;
  name: string;
  price: number;
  cost: number;
  currentMonthlyUnits: number;
  sustainableUnits: number; // Unidades que se pueden producir ajustado al cuello de botella
  currentRevenue: number;
  currentProfit: number;
  maxUnits: number;
  potentialRevenue: number;
  potentialProfit: number;
  bottleneck: string;
  hoursImpresionAtMax: number; 
  hoursMaquinariaAtMax: number; 
  hoursEstructurasAtMax: number;
  hoursInstalacionAtMax: number;
  hoursArtesAtMax: number;
}

// NUEVO: Define la estructura para la tabla de proyección del mix actual al 100%
export interface MaxMixAnalysis {
  productId: string;
  name: string;
  currentUnits: number;
  maxUnitsWithMix: number;
  maxProfitWithMix: number;
}


export interface AnalysisResults {
  departmentUtilization: DepartmentUtilization[];
  productAnalysis: ProductAnalysis[];
  maxMixAnalysis: MaxMixAnalysis[]; // NUEVO: Datos para la tabla de producción sostenible con mix actual
  // Métricas de la producción actual
  currentProductionRevenue: number;
  currentProductionProfit: number;
  // Métricas sostenibles (si la producción actual sobrecarga el cuello de botella)
  sustainableRevenue: number;
  sustainableProfit: number;
  // Métricas históricas
  averageHistoricalRevenue: number;
  // Métricas de diagnóstico
  bottleneckDepartmentName: string;
  bottleneckOverloadPercentage: number;
  globalCapacityUtilization: number;
  expansionFactor: number; // NUEVO: Factor para escalar la producción al 100%
  // Brecha entre producción actual y el potencial máximo
  opportunityGapRevenue: number;
  opportunityGapProfit: number;
  // Métricas de potencial máximo (llevando el cuello de botella al 100% con el mix actual)
  maxCapacityRevenue: number;
  maxCapacityProfit: number;
}