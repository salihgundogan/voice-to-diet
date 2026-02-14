/* ═══════════════════════════════════════════════════
   Voice-to-Diet — Type Definitions
   ═══════════════════════════════════════════════════ */

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
    breakfast: 'Kahvaltı',
    lunch: 'Öğle',
    dinner: 'Akşam',
    snack: 'Atıştırmalık',
};

export const MEAL_TYPE_ICONS: Record<MealType, string> = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snack: '🍪',
};

export interface FoodEntry {
    id: string;
    user_id: string;
    food_name: string;
    portion: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    meal_type: MealType;
    recorded_at: string;
    created_at: string;
}

export type FoodEntryInsert = Omit<FoodEntry, 'id' | 'created_at'>;

export interface FoodAnalysis {
    food_name: string;
    portion: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    meal_type: MealType;
}

export interface DayGroup {
    date: string;
    entries: FoodEntry[];
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
}

export interface DateRange {
    start: string;
    end: string;
}

export type RecordingState = 'idle' | 'recording' | 'processing' | 'done' | 'error';
