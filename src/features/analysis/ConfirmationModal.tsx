import { useState, useEffect } from 'react';
import type { FoodAnalysis, MealType } from '@/types';
import { MEAL_TYPE_LABELS, MEAL_TYPE_ICONS } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import styles from './ConfirmationModal.module.css';

interface ConfirmationModalProps {
    isOpen: boolean;
    analysis: FoodAnalysis | null;
    onConfirm: (data: FoodAnalysis) => void;
    onCancel: () => void;
    itemCounter?: string;
}

const ALL_MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export function ConfirmationModal({
    isOpen,
    analysis,
    onConfirm,
    onCancel,
    itemCounter,
}: ConfirmationModalProps) {
    const [formData, setFormData] = useState<FoodAnalysis | null>(null);

    // Analiz değiştiğinde form verisini sıfırla (kuyrukta sonraki yiyeceğe geçerken)
    useEffect(() => {
        setFormData(null);
    }, [analysis]);
    const data = formData ?? analysis;

    if (!data) return null;

    const updateField = <K extends keyof FoodAnalysis>(
        key: K,
        value: FoodAnalysis[K]
    ) => {
        setFormData((prev) => ({ ...(prev ?? data), [key]: value }));
    };

    const handleConfirm = () => {
        onConfirm(formData ?? data);
        setFormData(null);
    };

    const handleCancel = () => {
        setFormData(null);
        onCancel();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleCancel}
            title={itemCounter ? `Kaydı Onayla (${itemCounter})` : 'Kaydı Onayla'}
            footer={
                <>
                    <Button variant="secondary" fullWidth onClick={handleCancel}>
                        {itemCounter ? 'Atla ⏭️' : 'İptal'}
                    </Button>
                    <Button variant="primary" fullWidth onClick={handleConfirm}>
                        ✓ Kaydet
                    </Button>
                </>
            }
        >
            <div className={styles['form']}>
                {/* Food name */}
                <div className={styles['field']}>
                    <label className={styles['label']}>Yiyecek</label>
                    <input
                        className={styles['input']}
                        value={data.food_name}
                        onChange={(e) => updateField('food_name', e.target.value)}
                    />
                </div>

                {/* Portion */}
                <div className={styles['field']}>
                    <label className={styles['label']}>Porsiyon</label>
                    <input
                        className={styles['input']}
                        value={data.portion}
                        onChange={(e) => updateField('portion', e.target.value)}
                    />
                </div>

                {/* Calorie highlight */}
                <div className={styles['calorieHighlight']}>
                    <div className={styles['calorieNumber']}>
                        <input
                            className={styles['macroValue']}
                            type="number"
                            value={data.calories}
                            onChange={(e) => updateField('calories', Number(e.target.value))}
                            style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--color-primary-dark)' }}
                        />
                    </div>
                    <div className={styles['calorieLabel']}>kalori</div>
                </div>

                {/* Macros */}
                <div className={styles['macroRow']}>
                    <div className={styles['macroItem']}>
                        <input
                            className={styles['macroValue']}
                            type="number"
                            value={data.protein}
                            onChange={(e) => updateField('protein', Number(e.target.value))}
                        />
                        <span className={styles['macroLabel']}>Protein (g)</span>
                    </div>
                    <div className={styles['macroItem']}>
                        <input
                            className={styles['macroValue']}
                            type="number"
                            value={data.carbs}
                            onChange={(e) => updateField('carbs', Number(e.target.value))}
                        />
                        <span className={styles['macroLabel']}>Karb (g)</span>
                    </div>
                    <div className={styles['macroItem']}>
                        <input
                            className={styles['macroValue']}
                            type="number"
                            value={data.fat}
                            onChange={(e) => updateField('fat', Number(e.target.value))}
                        />
                        <span className={styles['macroLabel']}>Yağ (g)</span>
                    </div>
                </div>

                {/* Meal type */}
                <div className={styles['field']}>
                    <label className={styles['label']}>Öğün</label>
                    <div className={styles['mealTypeGrid']}>
                        {ALL_MEAL_TYPES.map((type) => (
                            <button
                                key={type}
                                className={`${styles['mealTypeOption']} ${data.meal_type === type ? styles['mealTypeOptionActive'] : ''
                                    }`}
                                onClick={() => updateField('meal_type', type)}
                                type="button"
                            >
                                {MEAL_TYPE_ICONS[type]} {MEAL_TYPE_LABELS[type]}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
