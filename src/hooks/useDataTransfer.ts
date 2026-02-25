import { useCallback } from 'react';
import type { TimeEvent } from '../types';

const EXPORT_FILENAME = 'time-matter-backup.json';

interface ExportData {
    version: 1;
    exportedAt: string;
    events: TimeEvent[];
}

export function useDataTransfer(
    events: TimeEvent[],
    setEvents: (events: TimeEvent[]) => void
) {
    const exportData = useCallback(() => {
        if (events.length === 0) {
            alert('当前没有事件数据可导出');
            return;
        }
        const data: ExportData = {
            version: 1,
            exportedAt: new Date().toISOString(),
            events: [...events],
        };
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], {
            type: 'application/json;charset=utf-8',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = EXPORT_FILENAME;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        // Delay cleanup to ensure download starts
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 200);
    }, [events]);

    const importData = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            try {
                const text = await file.text();
                const parsed = JSON.parse(text) as ExportData;

                if (!parsed.events || !Array.isArray(parsed.events)) {
                    throw new Error('Invalid format');
                }

                // Validate each event has required fields
                const validEvents = parsed.events.filter(
                    (ev) =>
                        ev.id &&
                        ev.name &&
                        ev.targetDate &&
                        ev.category &&
                        ev.color &&
                        ev.createdAt
                );

                if (validEvents.length === 0) {
                    alert('未找到有效的事件数据');
                    return;
                }

                const confirmed = confirm(
                    `即将导入 ${validEvents.length} 个事件，是否替换当前所有数据？`
                );
                if (confirmed) {
                    setEvents(validEvents);
                }
            } catch {
                alert('文件格式错误，请选择有效的 Time Matter 备份文件');
            }
        };
        input.click();
    }, [setEvents]);

    return { exportData, importData };
}
