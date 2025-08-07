<script lang="ts">
  import { onMount } from "svelte";
  import "../app.css";
  import favicon from "$lib/assets/favicon.svg";

  let socket: WebSocket;
  let status = "Not connected";
  let result = "";
  let filePath = "";

  onMount(() => {
    const storedPath = localStorage.getItem("excelFilePath");
    if (storedPath) {
      filePath = storedPath;
    }
  });

  function handleSubmit(e: Event) {
    e.preventDefault();
    localStorage.setItem("excelFilePath", filePath);
    connect();
  }

  function connect() {
    socket = new WebSocket("wss://localhost:5000/ws");

    socket.onopen = () => {
      status = "Connected to Python backend";
    };

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      result = `Cell ${msg.cell} updated to ${msg.value}`;
    };

    socket.onclose = () => {
      status = "Disconnected";
    };
  }

  function sendEdit() {
    const storedFilePath = localStorage.getItem("excelFilePath");
    if (!storedFilePath) {
      result = "File path not set. Please submit the form first.";
      return;
    }

    socket.send(
      JSON.stringify({
        operation: "edit_excel",
        data: {
          cell: "A1",
          value: "Ya Ali Madad!",
          file_path: storedFilePath,
        },
      }),
    );
  }
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<p>Status: {status}</p>

<form on:submit|preventDefault={handleSubmit} class="flex">
  <label>
    File Path:
    <input
      class="bg-[#3E3E55] text-white box-border rounded-[12px] px-4 py-3 text-[14px]"
      bind:value={filePath}
    />
  </label>
  <button  class="bg-[#3d5cff] text-white outline-0 box-border rounded-[12px] px-4 py-3 text-[14px]" type="submit">Connect</button>
</form>

<button on:click={sendEdit}> Edit Excel Cell A1 </button>

{#if result}
  <p>Response: {result}</p>
{/if}
