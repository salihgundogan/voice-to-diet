import type { MealType } from '@/types';
import { MEAL_TYPE_LABELS, MEAL_TYPE_ICONS } from '@/types';
import styles from './Badge.module.css';

interface BadgeProps {
    mealType: MealType;
}

export function Badge({ mealType }: BadgeProps) {
    return (
        <span className={`${styles['badge']} ${styles[mealType]}`}>
            {MEAL_TYPE_ICONS[mealType]} {MEAL_TYPE_LABELS[mealType]}
        </span>
    );
}
