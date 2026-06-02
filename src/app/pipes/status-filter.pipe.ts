import { Pipe, PipeTransform } from '@angular/core';
import { Equipment, EquipmentStatus } from '../models/equipment.model';

@Pipe({
    name: 'statusFilter',
    standalone: true
})
export class StatusFilterPipe implements PipeTransform {
    transform(items: Equipment[], status: EquipmentStatus | 'all'): Equipment[] {
        if (!items || status === 'all') {
            return items;
        }

        return items.filter(item => item.status === status);
    }
}
