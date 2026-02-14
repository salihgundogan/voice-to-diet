import { supabase } from '@/lib/supabase';
import type { FoodEntry, FoodEntryInsert, DateRange } from '@/types';

const TABLE_NAME = 'food_entries';

/**
 * Yeni bir yiyecek kaydı ekler.
 */
export async function addFoodEntry(entry: FoodEntryInsert): Promise<FoodEntry> {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert(entry)
        .select()
        .single();

    if (error) {
        throw new Error(`Kayıt eklenemedi: ${error.message}`);
    }

    return data as FoodEntry;
}

/**
 * Belirtilen kullanıcının yiyecek kayıtlarını getirir.
 * Opsiyonel tarih aralığı filtresi destekler.
 */
export async function getFoodEntries(
    userId: string,
    dateRange?: DateRange
): Promise<FoodEntry[]> {
    let query = supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false });

    if (dateRange) {
        query = query
            .gte('recorded_at', dateRange.start)
            .lte('recorded_at', dateRange.end);
    }

    const { data, error } = await query;

    if (error) {
        throw new Error(`Kayıtlar getirilemedi: ${error.message}`);
    }

    return (data as FoodEntry[]) || [];
}

/**
 * Bir yiyecek kaydını siler.
 */
export async function deleteFoodEntry(id: string): Promise<void> {
    const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', id);

    if (error) {
        throw new Error(`Kayıt silinemedi: ${error.message}`);
    }
}

/**
 * Kayıtları güne göre gruplar.
 */
export function groupEntriesByDay(entries: FoodEntry[]) {
    const groups: Record<string, FoodEntry[]> = {};

    for (const entry of entries) {
        const dateKey = entry.recorded_at.split('T')[0] || entry.recorded_at;
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey]!.push(entry);
    }

    return Object.entries(groups)
        .map(([date, dayEntries]) => ({
            date,
            entries: dayEntries.sort(
                (a, b) =>
                    new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
            ),
            totalCalories: dayEntries.reduce((sum, e) => sum + e.calories, 0),
            totalProtein: dayEntries.reduce((sum, e) => sum + e.protein, 0),
            totalCarbs: dayEntries.reduce((sum, e) => sum + e.carbs, 0),
            totalFat: dayEntries.reduce((sum, e) => sum + e.fat, 0),
        }))
        .sort((a, b) => b.date.localeCompare(a.date));
}
