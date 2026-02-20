import { Component, input, signal, computed, effect, InjectionToken } from '@angular/core';
import { cn } from '../../../utils/cn';

export interface TabsGroupContext {
  activeTab: () => string;
  setActiveTab: (value: string) => void;
}

export const TABS_GROUP_CONTEXT = new InjectionToken<TabsGroupContext>('TabsGroupContext');

@Component({
  selector: 'app-tabs-group',
  standalone: true,
  template: `<ng-content />`,
  host: {
    '[class]': 'computedClass()',
  },
  providers: [
    {
      provide: TABS_GROUP_CONTEXT,
      useFactory: (component: TabsGroupComponent) => ({
        activeTab: () => component.activeTab(),
        setActiveTab: (value: string) => component.activeTab.set(value),
      }),
      deps: [TabsGroupComponent],
    },
  ],
})
export class TabsGroupComponent {
  class = input<string>('');
  defaultTab = input<string>('');
  
  activeTab = signal<string>('');

  constructor() {
    // Watch for changes to defaultTab and initialize
    effect(() => {
      const defaultTabValue = this.defaultTab();
      if (defaultTabValue && !this.activeTab()) {
        this.activeTab.set(defaultTabValue);
      }
    });
  }

  computedClass = computed(() =>
    cn('w-full', this.class())
  );
}

