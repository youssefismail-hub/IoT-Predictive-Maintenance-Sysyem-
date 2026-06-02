import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EquipmentService } from '../../services/equipment.service';
import { Equipment, EquipmentStatus } from '../../models/equipment.model';
import { SearchFilterPipe } from '../../pipes/search-filter.pipe';
import { StatusFilterPipe } from '../../pipes/status-filter.pipe';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-equipment-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SearchFilterPipe, StatusFilterPipe],
  templateUrl: './equipment-list.html',
  styleUrl: './equipment-list.scss',
})
export class EquipmentListComponent implements OnInit {
  equipment$!: Observable<Equipment[]>;
  searchTerm = '';
  statusFilter: EquipmentStatus | 'all' = 'all';
  EquipmentStatus = EquipmentStatus;

  constructor(private equipmentService: EquipmentService) { }

  ngOnInit() {
    this.equipment$ = this.equipmentService.getAll();
  }

  getStatusClass(status: EquipmentStatus): string {
    const classes: Record<EquipmentStatus, string> = {
      [EquipmentStatus.OPERATIONAL]: 'badge-success',
      [EquipmentStatus.WARNING]: 'badge-warning',
      [EquipmentStatus.CRITICAL]: 'badge-danger',
      [EquipmentStatus.OFFLINE]: 'badge-secondary'
    };
    return classes[status];
  }
}
