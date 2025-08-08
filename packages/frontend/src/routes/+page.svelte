<script lang="ts">
  import "./_other/app.css";
  import TableEditor from "./_other/TableEditor.svelte";
  import favicon from "./_other/favicon.svg";
  import { submittedData, fileSubmit, excelFilePath, status, sendEdit } from "./_other";


</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<p>Status: {$status}</p>

<form on:submit|preventDefault={fileSubmit} class="flex">
  <label>
    File Path:
    <input
      class="bg-[#3E3E55] text-white box-border rounded-[12px] px-4 py-3 text-[14px]"
      bind:value={$excelFilePath}
    />
  </label>
  <button  class="bg-[#3d5cff] text-white outline-0 box-border rounded-[12px] px-4 py-3 text-[14px]" type="submit">Connect</button>
</form>

<button on:click={sendEdit}> Edit Excel Cell A1 </button>

<TableEditor/>

{#if $submittedData.length > 0}
  <h2 class="mt-4 font-bold">Submitted Table Data:</h2>
  <pre>{JSON.stringify($submittedData, null, 2)}</pre>
{/if}
