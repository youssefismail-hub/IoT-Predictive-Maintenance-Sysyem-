import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'searchFilter',
    standalone: true
})
export class SearchFilterPipe implements PipeTransform {
    transform(items: any[], searchTerm: string, fields: string[]): any[] {
        if (!items || !searchTerm) {
            return items;
        }

        searchTerm = searchTerm.toLowerCase();

        return items.filter(item => {
            return fields.some(field => {
                const value = this.getNestedProperty(item, field);
                return value && value.toString().toLowerCase().includes(searchTerm);
            });
        });
    }

    private getNestedProperty(obj: any, path: string): any {
        return path.split('.').reduce((prev, curr) => prev?.[curr], obj);
    }
}
