<script setup lang="ts">
import {
  PhCheckCircle as CheckCircle,
  PhXCircle as XCircle,
  PhWarningCircle as WarningCircle,
  PhCircle as Circle,
  PhArrowsClockwise as Recheck,
} from '@phosphor-icons/vue'
import type { RegistrationCheckStatus } from '#client/composables/useRegistrationCheck'

const {
  domain,
  status = 'idle',
  message = '',
} = defineProps<{
  domain: string
  status?: RegistrationCheckStatus
  message?: string
}>()

const emit = defineEmits<{
  recheck: []
}>()

const open = ref(false)
const root = useTemplateRef<HTMLElement>('root')
let leaveTimer: ReturnType<typeof setTimeout> | null = null

function clearLeaveTimer() {
  if (leaveTimer) {
    clearTimeout(leaveTimer)
    leaveTimer = null
  }
}

function showMenu() {
  clearLeaveTimer()
  open.value = true
}

function scheduleHide() {
  clearLeaveTimer()
  leaveTimer = setTimeout(() => {
    open.value = false
    leaveTimer = null
  }, 120)
}

onBeforeUnmount(() => {
  clearLeaveTimer()
})

const label = computed(() => {
  switch (status) {
    case 'valid':
      return `Registration valid for ${domain}`
    case 'invalid':
      return `Registration invalid for ${domain}`
    case 'checking':
      return `Checking registration for ${domain}`
    case 'error':
      return `Registration check failed for ${domain}`
    default:
      return `Registration status unknown for ${domain}`
  }
})

const iconClass = computed(() => {
  switch (status) {
    case 'valid':
      return 'text-live'
    case 'invalid':
    case 'error':
      return 'text-danger'
    default:
      return 'text-muted'
  }
})

function onRecheck() {
  open.value = false
  emit('recheck')
}
</script>

<template>
  <div
    ref="root"
    class="relative shrink-0"
    @mouseenter="showMenu"
    @mouseleave="scheduleHide"
  >
    <button
      type="button"
      class="inline-flex h-7 w-7 items-center justify-center rounded-[6px] transition-colors hover:bg-paper"
      :class="iconClass"
      :aria-label="label"
      :aria-expanded="open"
      aria-haspopup="menu"
      :title="label"
      :aria-busy="status === 'checking' || undefined"
      @click.stop="open = !open"
    >
      <Recheck
        v-if="status === 'checking'"
        :size="16"
        weight="regular"
        class="animate-spin"
        aria-hidden="true"
      />
      <CheckCircle
        v-else-if="status === 'valid'"
        :size="16"
        weight="fill"
        aria-hidden="true"
      />
      <XCircle
        v-else-if="status === 'invalid'"
        :size="16"
        weight="fill"
        aria-hidden="true"
      />
      <WarningCircle
        v-else-if="status === 'error'"
        :size="16"
        weight="fill"
        aria-hidden="true"
      />
      <Circle
        v-else
        :size="16"
        weight="regular"
        aria-hidden="true"
      />
    </button>

    <div
      v-show="open"
      role="menu"
      class="absolute right-0 top-[calc(100%+0.35rem)] z-[20] min-w-[14rem] border border-rule bg-panel py-1 shadow-[0_12px_28px_var(--shadow)]"
      style="border-radius: var(--radius-panel)"
      @mouseenter="showMenu"
      @mouseleave="scheduleHide"
      @keydown.escape="open = false"
    >
      <p class="border-b border-rule px-3 py-2 text-xs text-muted" role="none">
        {{ message || label }}
      </p>
      <button
        type="button"
        role="menuitem"
        class="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-muted hover:bg-paper hover:text-ink disabled:opacity-50"
        :disabled="status === 'checking'"
        @click.stop="onRecheck"
      >
        <Recheck :size="16" weight="regular" aria-hidden="true" />
        Recheck registration
      </button>
    </div>
  </div>
</template>
