import { computed, effect, inject, signal, type Signal, type WritableSignal } from '@angular/core';
import { ConfigStoreService } from '../services/config-store.service';
import type { KittyConfigAST } from '../models/kitty-types';

export interface FormHelper<TSection extends keyof KittyConfigAST> {
  state: WritableSignal<KittyConfigAST[TSection]>;
  advancedMode: Signal<boolean>;
  update: () => void;
  updateField: <K extends keyof KittyConfigAST[TSection]>(
    key: K,
    value: KittyConfigAST[TSection][K],
  ) => void;
}

export function createFormHelper<TSection extends keyof KittyConfigAST>(
  section: TSection,
): FormHelper<TSection> {
  const configStore = inject(ConfigStoreService);

  const state = signal<KittyConfigAST[TSection]>(configStore.configState()[section]);
  const advancedMode = computed(() => configStore.advancedMode());

  effect(() => {
    state.set(configStore.configState()[section]);
  });

  function update(): void {
    configStore.updateSection(section, { ...(state() as object) } as Partial<KittyConfigAST[TSection]>);
  }

  function updateField<K extends keyof KittyConfigAST[TSection]>(
    key: K,
    value: KittyConfigAST[TSection][K],
  ): void {
    state.update(current => ({ ...(current as object), [key]: value }) as unknown as KittyConfigAST[TSection]);
    update();
  }

  return { state, advancedMode, update, updateField };
}
