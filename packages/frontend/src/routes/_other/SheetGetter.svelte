<script lang="ts">
  import { sheetNames, sheet, eachSheet } from '.'; // adjust path if needed
</script>

<div class="bg-white p-6 rounded-xl shadow-lg w-80 space-y-4">
  <h2 class="text-xl font-semibold">Choose an Option</h2>

  <select
    bind:value={$sheet}
    onchange={eachSheet}
    class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    {#each $sheetNames as option}
      <option value={option}>{option}</option>
    {/each}
  </select>

</div>
