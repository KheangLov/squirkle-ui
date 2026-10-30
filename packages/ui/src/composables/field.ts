import type { PropType } from 'vue'
import { roundedProp } from './style'

export type FieldVariant = 'outlined' | 'filled' | 'solo' | 'underlined' | 'plain'

/** Props every text-like control forwards to SqField. */
export const fieldShellProps = {
  /** Id for the native input (label `for` points to it); generated when omitted. */
  id: { type: String, default: undefined },
  label: { type: String, default: undefined },
  hint: { type: String, default: undefined },
  persistentHint: Boolean,
  placeholder: { type: String, default: undefined },
  variant: { type: String as PropType<FieldVariant>, default: 'outlined' },
  density: { type: String as PropType<'default' | 'comfortable' | 'compact'>, default: 'default' },
  color: { type: String, default: 'primary' },
  rounded: roundedProp,
  prependIcon: { type: String, default: undefined },
  appendIcon: { type: String, default: undefined },
  prependInnerIcon: { type: String, default: undefined },
  appendInnerIcon: { type: String, default: undefined },
  prefix: { type: String, default: undefined },
  suffix: { type: String, default: undefined },
  clearable: Boolean,
  disabled: Boolean,
  readonly: Boolean,
  loading: Boolean,
  required: Boolean,
  hideDetails: Boolean,
  /** Accessible name for the native control when there is no visible `label` (declared so it doesn't land on the wrapper). */
  ariaLabel: { type: String, default: undefined },
  ariaLabelledby: { type: String, default: undefined },
}

export const pickShellProps = (props: Record<string, unknown>) => {
  const out: Record<string, unknown> = {}
  for (const k of Object.keys(fieldShellProps)) if (!['disabled', 'readonly', 'placeholder', 'id', 'ariaLabel', 'ariaLabelledby'].includes(k)) out[k] = props[k]
  return out
}
