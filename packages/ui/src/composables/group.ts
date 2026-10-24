import { computed, inject, onBeforeUnmount, provide, type ComputedRef, type InjectionKey, type WritableComputedRef } from 'vue'

export interface GroupContext {
  isSelected: (value: unknown) => boolean
  toggle: (value: unknown) => void
  register: (value: unknown) => void
  unregister: (value: unknown) => void
  items: unknown[]
  disabled: ComputedRef<boolean>
  props: Record<string, unknown>
}

/**
 * Selection group used by BtnToggle, ChipGroup, Tabs, ExpansionPanels, Window, SlideGroup, ItemGroup.
 * Model is a single value, or an array when `multiple`.
 */
export function provideGroup(
  key: InjectionKey<GroupContext> | string,
  model: WritableComputedRef<unknown>,
  props: { multiple?: boolean; mandatory?: boolean; max?: number; disabled?: boolean } & Record<string, unknown>,
): GroupContext {
  // Registration order only; read in handlers, so it needs no reactivity (and Vue 2 cannot track a reactive() array root).
  const items: unknown[] = []
  const selected = () => (props.multiple ? ((model.value as unknown[]) ?? []) : model.value == null ? [] : [model.value])
  const ctx: GroupContext = {
    items,
    props,
    disabled: computed(() => !!props.disabled),
    isSelected: (v) => selected().includes(v),
    toggle(v) {
      const cur = selected()
      const on = cur.includes(v)
      if (props.multiple) {
        if (on) {
          if (props.mandatory && cur.length === 1) return
          model.value = cur.filter((x) => x !== v)
        } else if (!props.max || cur.length < props.max) model.value = [...cur, v]
      } else if (on) {
        if (!props.mandatory) model.value = undefined
      } else model.value = v
    },
    register(v) {
      items.push(v)
      if (props.mandatory && model.value == null && !props.multiple) model.value = v
    },
    unregister(v) {
      const i = items.indexOf(v)
      if (i >= 0) items.splice(i, 1)
    },
  }
  provide(key, ctx)
  return ctx
}

/** Joins the nearest group; without a `value` the item's registration index is its value. */
export function useGroupItem(key: InjectionKey<GroupContext> | string, value: () => unknown) {
  const group = inject<GroupContext | null>(key, null)
  const id = value() ?? (group ? group.items.length : 0)
  group?.register(id)
  onBeforeUnmount(() => group?.unregister(id))
  const current = () => value() ?? id
  return {
    group,
    id: computed(current),
    isSelected: computed(() => !!group?.isSelected(current())),
    toggle: () => group?.toggle(current()),
  }
}
