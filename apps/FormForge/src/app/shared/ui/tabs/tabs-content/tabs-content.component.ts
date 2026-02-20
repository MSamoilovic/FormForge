import { Component, input, computed, inject } from '@angular/core';
import { cn } from '../../../utils/cn';
import { TABS_GROUP_CONTEXT, TabsGroupContext } from '../tabs-group/tabs-group.component';

@Component({
  selector: 'app-tabs-content, [appTabsContent]',
  standalone: true,
  template: `<ng-content />`,
  host: {
    '[class]': 'computedClass()',
    '[attr.role]': '"tabpanel"',
    '[attr.aria-labelledby]': 'value()',
    '[attr.data-state]': 'isActive() ? "active" : "inactive"',
    '[style.display]': 'isActive() ? "flex" : "none"',
  },
})
export class TabsContentComponent {
  value = input.required<string>();
  class = input<string>('');

  private tabsGroupContext = inject(TABS_GROUP_CONTEXT, { optional: true });

  isActive = computed(() => {
    if (!this.tabsGroupContext) return false;
    return this.tabsGroupContext.activeTab() === this.value();
  });

  computedClass = computed(() =>
    cn(
      'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'flex flex-col h-full',
      this.class()
    )
  );
}

