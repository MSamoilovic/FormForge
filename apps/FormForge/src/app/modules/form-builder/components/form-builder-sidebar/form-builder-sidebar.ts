import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AvailableField } from '@form-forge/models';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideLayoutGrid, lucideGripVertical,
  lucideType, lucideHash, lucideChevronDown, lucideListChecks,
  lucideMail, lucideLink, lucideLock, lucidePhone, lucideAlignLeft,
  lucideCloudUpload, lucideSquareCheck, lucideToggleRight, lucideCircleDot,
  lucideCalendar, lucidePalette, lucideSliders,
} from '@ng-icons/lucide';
import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardDescriptionComponent,
  CardContentComponent,
} from '../../../../shared/ui/card';

@Component({
  selector: 'app-form-builder-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    NgIconComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
  ],
  viewProviders: [
    provideIcons({
      lucideLayoutGrid,
      lucideGripVertical,
      lucideType,
      lucideHash,
      lucideChevronDown,
      lucideListChecks,
      lucideMail,
      lucideLink,
      lucideLock,
      lucidePhone,
      lucideAlignLeft,
      lucideCloudUpload,
      lucideSquareCheck,
      lucideToggleRight,
      lucideCircleDot,
      lucideCalendar,
      lucidePalette,
      lucideSliders,
    }),
  ],
  templateUrl: './form-builder-sidebar.html',
  styleUrl: './form-builder-sidebar.scss',
})
export class FormBuilderSidebar {
  availableFields = input<AvailableField[]>([]);
}
