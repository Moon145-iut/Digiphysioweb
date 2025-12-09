import { FoodAnalysisResult } from '../types';

const backendBase = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');

export async function analyzeFoodText(
  query: string
): Promise<FoodAnalysisResult> {
  if (!backendBase) {
    throw new Error('VITE_BACKEND_URL not configured');
  }

  const res = await fetch(`${backendBase}/api/food/nutrition`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    // map server fallback into your type
    return {
      name: data.name || 'Unknown food',
      calories: data.calories || 'Unknown',
      protein: data.protein || '-',
      fat: data.fat || '-',
      carbs: data.carbs || '-',
      fiber: data.fiber || '-',
      ingredients: data.ingredients || [],
      healthTips:
        data.healthTips ||
        'Could not analyze this meal. Try describing it more simply.',
      tags: data.tags || ['error'],
      balanced: false,
      summary: data.summary || 'Analysis incomplete',
    };
  }

  return data as FoodAnalysisResult;
}
