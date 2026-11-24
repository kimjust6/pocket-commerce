<template>
  <div class="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-2 text-xs">
    <p class="font-bold text-base-content">Instant & Feeless Banano Payment</p>
    <p class="text-base-content/70">
      Send <span class="font-bold text-primary">{{ (total * 250).toFixed(0) }} BAN</span> to our merchant address.
    </p>
    <div class="bg-base-100 p-2 rounded-lg font-mono text-[10px] break-all border border-slate-200 dark:border-slate-800">
      ban_1ka1ium4pfue3uxtntqsboa8egcw864xqdbc85vc5z33x5ne52pfcqigp5cb
    </div>
  </div>
</template>

<script setup>
defineProps({
  total: {
    type: Number,
    required: true,
  },
})
</script>
