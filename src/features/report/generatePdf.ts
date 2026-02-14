import jsPDF from 'jspdf';
import type { DayGroup } from '@/types';
import { MEAL_TYPE_LABELS } from '@/types';

/**
 * Seçilen tarih aralığındaki kayıtlardan PDF rapor oluşturur.
 */
export function generatePdf(
    groups: DayGroup[],
    dateRangeLabel: string
): void {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Beslenme Raporu', pageWidth / 2, y, { align: 'center' });
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120);
    doc.text(dateRangeLabel, pageWidth / 2, y, { align: 'center' });
    y += 12;

    // Summary
    const totalCalories = groups.reduce((s, g) => s + g.totalCalories, 0);
    const totalProtein = groups.reduce((s, g) => s + g.totalProtein, 0);
    const totalCarbs = groups.reduce((s, g) => s + g.totalCarbs, 0);
    const totalFat = groups.reduce((s, g) => s + g.totalFat, 0);

    doc.setTextColor(60);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Ozet', 14, y);
    y += 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Toplam Kalori: ${totalCalories} kcal`, 14, y); y += 5;
    doc.text(`Protein: ${totalProtein}g  |  Karbonhidrat: ${totalCarbs}g  |  Yag: ${totalFat}g`, 14, y);
    y += 10;

    // Day details
    for (const group of groups) {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(80);
        doc.text(`${group.date}  (${group.totalCalories} kcal)`, 14, y);
        y += 6;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);

        for (const entry of group.entries) {
            if (y > 275) {
                doc.addPage();
                y = 20;
            }

            const time = new Date(entry.recorded_at);
            const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
            const mealLabel = MEAL_TYPE_LABELS[entry.meal_type];

            doc.text(
                `  ${timeStr}  ${entry.food_name} (${entry.portion}) — ${entry.calories} kcal [${mealLabel}]`,
                14,
                y
            );
            y += 4.5;
        }

        y += 4;
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(160);
    doc.text('Voice to Diet — Sesli Beslenme Gunlugu', pageWidth / 2, 290, { align: 'center' });

    doc.save(`beslenme-raporu-${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * Raporu düz metin olarak panoya kopyalar.
 */
export function generatePlainText(groups: DayGroup[], dateRangeLabel: string): string {
    const lines: string[] = [];

    lines.push('═══ BESLENME RAPORU ═══');
    lines.push(dateRangeLabel);
    lines.push('');

    const totalCalories = groups.reduce((s, g) => s + g.totalCalories, 0);
    lines.push(`Toplam: ${totalCalories} kcal`);
    lines.push('');

    for (const group of groups) {
        lines.push(`── ${group.date} (${group.totalCalories} kcal) ──`);

        for (const entry of group.entries) {
            const time = new Date(entry.recorded_at);
            const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
            lines.push(`  ${timeStr} ${entry.food_name} (${entry.portion}) — ${entry.calories} kcal`);
        }

        lines.push('');
    }

    return lines.join('\n');
}
