<script setup lang="ts">
import type { DomainEntry } from '#shared/types/clientstorage'

const { entries, selected } = defineProps<{
  entries: DomainEntry[]
  selected: string
}>()

const emit = defineEmits<{
  select: [domain: string]
}>()

const { states, check, checkAll } = useRegistrationCheck()

watch(
  () => entries.map(entry => entry.domain),
  (domains) => {
    checkAll(domains)
  },
  { immediate: true },
)

function recheck(domain: string) {
  void check(domain, true)
}
</script>

<template>
  <nav aria-label="Stored domains">
    <ul class="divide-y divide-rule">
      <li v-for="entry in entries" :key="entry.domain">
        <div
          class="flex w-full items-start gap-2 px-3 py-3 hover:bg-panel"
          :class="selected === entry.domain && 'bg-panel'"
        >
          <button
            type="button"
            class="flex min-w-0 flex-1 flex-col items-start gap-1 text-left"
            :aria-current="selected === entry.domain ? 'true' : undefined"
            @click="emit('select', entry.domain)"
          >
            <span class="font-medium">{{ entry.domain }}</span>
            <span class="w-full truncate font-mono text-xs text-muted">{{ entry.details.fulldomain }}</span>
          </button>
          <DomainRegistrationStatus
            :domain="entry.domain"
            :status="states[entry.domain]?.status ?? 'idle'"
            :message="states[entry.domain]?.message ?? ''"
            @recheck="recheck(entry.domain)"
          />
        </div>
      </li>
    </ul>
  </nav>
</template>
