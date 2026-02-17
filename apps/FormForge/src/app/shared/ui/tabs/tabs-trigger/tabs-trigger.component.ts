import { Component, input, computed, inject } from '@angular/core';
import { cn } from '../../../utils/cn';
import { TABS_GROUP_CONTEXT, TabsGroupContext } from '../tabs-group/tabs-group.component';

@Component({
  selector: 'button[appTabsTrigger]',
  standalone: true,
  template: `<ng-content />`,
  host: {
    '[class]': 'computedClass()',
    '[attr.role]': '"tab"',
    '[attr.aria-selected]': 'isActive()',
    '[attr.aria-controls]': 'value()',
    '[attr.data-state]': 'isActive() ? "active" : "inactive"',
    '(click)': 'onClick()',
    '[type]': '"button"',
  },
})
export class TabsTriggerComponent {
  value = input.required<string>();
  class = input<string>('');

  private tabsGroupContext = inject(TABS_GROUP_CONTEXT, { optional: true });

  isActive = computed(() => {
    if (!this.tabsGroupContext) return false;
    return this.tabsGroupContext.activeTab() === this.value();
  });

  computedClass = computed(() =>
    cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      this.isActive()
        ? 'bg-background text-foreground shadow-sm'
        : 'text-muted-foreground hover:bg-background/50 hover:text-foreground',
      this.class()
    )
  );

  onClick(): void {
    if (this.tabsGroupContext) {
      this.tabsGroupContext.setActiveTab(this.value());
    }
  }
}

