export interface Department {
  id: 'impresion' | 'estructuras' | 'instalacion' | 'maquinaria';
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
  hoursArtes: number;
  hoursEstructuras: number;
  hoursInstalacion: number;
}

export interface DepartmentUtilization {
  departmentId: 'impresion' | 'estructuras' | 'instalacion' | 'maquinaria';
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
  hoursImpresionAtMax: number; // Corresponds to hoursArtes (labor)
  hoursMaquinariaAtMax: number; // Corresponds to hoursImpresion (machine)
  hoursEstructurasAtMax: number;
  hoursInstalacionAtMax: number;
}

export interface AnalysisResults {
  departmentUtilization: DepartmentUtilization[];
  productAnalysis: ProductAnalysis[];
  // Métricas del plan de producción (la meta)
  plannedRevenue: number;
  plannedProfit: number;
  // Métricas sostenibles (la realidad con el cuello de botella)
  actualSustainableRevenue: number;
  sustainableProfit: number;
  // Métricas de diagnóstico
  bottleneckDepartmentName: string;
  bottleneckOverloadPercentage: number; // Cuánto está sobrecargado el cuello de botella (ej: 167.4%)
  actualCapacityPercentage: number; // Porcentaje del plan que se puede cumplir (ej: 59.7%)
  opportunityGapRevenue: number;
  opportunityGapProfit: number;
}