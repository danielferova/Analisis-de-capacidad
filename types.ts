
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
  sustainableUnits: number; // Unidades que se pueden producir con el cuello de botella al 100%
  currentRevenue: number;
  currentProfit: number;
  maxUnits: number;
  potentialRevenue: number;
  potentialProfit: number;
  bottleneck: string;
  hoursImpresionAtMax: number; // Workload for 'Taller de Impresión (Mano de Obra)' at max units
  hoursMaquinariaAtMax: number; // Workload for 'Maquinaria Clave (OEE Real)' at max units
  hoursEstructurasAtMax: number;
  hoursInstalacionAtMax: number;
  hoursArtesAtMax: number;
}

export interface AnalysisResults {
  departmentUtilization: DepartmentUtilization[];
  productAnalysis: ProductAnalysis[];
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
  // Brecha entre producción actual y el potencial máximo
  opportunityGapRevenue: number;
  opportunityGapProfit: number;
  // Métricas de potencial máximo (llevando el cuello de botella al 100% con el mix actual)
  maxCapacityRevenue: number;
  maxCapacityProfit: number;
}
