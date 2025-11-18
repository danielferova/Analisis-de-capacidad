
import { GoogleGenAI } from "@google/genai";
import type { Product, Department, AnalysisResults } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

function formatDataForPrompt(
  departments: Department[],
  products: Product[],
  results: AnalysisResults
): string {
  
  const utilizationInfo = results.departmentUtilization.map(d => `- ${d.name}: Se requieren ${d.requiredHours.toFixed(0)} horas. Utilización: ${d.utilizationPercentage.toFixed(1)}%`).join('\n');
  const productsInfo = results.productAnalysis.map(p => `
  - Producto: "${p.name}"
    - Unidades Actuales/Mes: ${p.currentMonthlyUnits}
    - Unidades Sostenibles/Mes: ${p.sustainableUnits.toFixed(0)} (Lo que se puede producir ajustado al cuello de botella)
    - Utilidad Unitaria: Q${(p.price - p.cost).toFixed(2)}
    - Utilidad Actual: Q${p.currentProfit.toFixed(2)}
    - Utilidad Sostenible: Q${(p.sustainableUnits * (p.price - p.cost)).toFixed(2)}
`).join('');

  return `
Eres un consultor experto en optimización de operaciones y la Teoría de las Restricciones (TOC) para CNP Network, una empresa de señalización y publicidad.

He realizado un análisis de la capacidad de producción basándome en los datos de producción actuales. A continuación, te presento el diagnóstico:

**1. DIAGNÓSTICO GENERAL DE LA PLANTA:**
- **Utilización de Capacidad Global: ${results.globalCapacityUtilization.toFixed(1)}%** (Carga de trabajo de la producción actual contra el total de horas disponibles).
- **Utilidad de Producción Actual: Q${results.currentProductionProfit.toLocaleString('es-GT', {minimumFractionDigits: 2, maximumFractionDigits: 2})}**
- **Utilidad Potencial (Planta al 100%): Q${results.maxCapacityProfit.toLocaleString('es-GT', {minimumFractionDigits: 2, maximumFractionDigits: 2})}**
- **BRECHA DE OPORTUNIDAD MENSUAL: Q${results.opportunityGapProfit.toLocaleString('es-GT', {minimumFractionDigits: 2, maximumFractionDigits: 2})}** (Esta es la GANANCIA que se podría obtener al optimizar la producción y llevar la planta a su máxima capacidad sostenible).

**2. ANÁLISIS DEL CUELLO DE BOTELLA:**
- **Departamento Crítico:** ${results.bottleneckDepartmentName}
- **Sobrecarga Actual:** ${results.bottleneckOverloadPercentage.toFixed(1)}% (La producción actual le exige a este departamento un ${(results.bottleneckOverloadPercentage - 100).toFixed(1)}% más de lo que puede manejar, lo cual es insostenible a largo plazo).

**3. ANÁLISIS DE UTILIZACIÓN (Carga de Trabajo):**
${utilizationInfo}

**4. ANÁLISIS DE PRODUCTOS (Producción Actual vs. Sostenible):**
${productsInfo}

**TU TAREA:**

Basado en este diagnóstico, responde a las siguientes preguntas del gerente de producción de forma clara, directa y enfocada en CERRAR LA BRECHA DE RENTABILIDAD:

1.  **Diagnóstico del Problema Central:** La producción actual genera una utilidad de Q${results.currentProductionProfit.toLocaleString('es-GT', {minimumFractionDigits: 2, maximumFractionDigits: 2})}. Sin embargo, la planta tiene un potencial de Q${results.maxCapacityProfit.toLocaleString('es-GT', {minimumFractionDigits: 2, maximumFractionDigits: 2})}. Explica cómo la sobrecarga en **${results.bottleneckDepartmentName}** es la restricción clave que impide alcanzar ese potencial, resultando en una brecha de **Q${results.opportunityGapProfit.toLocaleString('es-GT', {minimumFractionDigits: 2, maximumFractionDigits: 2})}** mensuales.
2.  **Estrategias para el Cuello de Botella:** Proporciona 3 estrategias específicas y accionables para **"elevar la restricción"**, es decir, aumentar la capacidad del departamento **${results.bottleneckDepartmentName}**.
3.  **Optimización del Mix de Productos para ALCANZAR EL POTENCIAL MÁXIMO:**
    - Basado en los datos de rentabilidad y consumo de horas del cuello de botella, ¿qué productos se deberían priorizar en ventas y producción para maximizar la **UTILIDAD** con la capacidad disponible?
    - Menciona 1 o 2 productos que podrían reducirse, ya que consumen muchos recursos del cuello de botella para la rentabilidad que ofrecen actualmente.
4.  **Resumen y Próximos Pasos:** Concluye con un resumen de las 2-3 acciones más críticas que la empresa debería tomar INMEDIATAMENTE para empezar a recuperar esa **brecha de utilidad**.

Formatea tu respuesta en Markdown, usando títulos, listas y **negritas** para que sea fácil de leer y entender.
  `;
}

export const getSuggestionsFromGemini = async (
  departments: Department[],
  products: Product[],
  results: AnalysisResults
): Promise<string> => {
  try {
    const fullPrompt = formatDataForPrompt(departments, products, results);
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: fullPrompt
    });

    return response.text;
  } catch (error) {
    console.error("Error fetching suggestions from Gemini:", error);
    return "Error al generar sugerencias. Por favor, inténtelo de nuevo.";
  }
};
