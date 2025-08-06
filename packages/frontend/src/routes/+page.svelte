<script lang="ts">
  let socket: WebSocket;
  let status = "Not connected";
  let result = "";

  function connect() {
    socket = new WebSocket("ws://localhost:5000/ws");

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
    socket.send(
      JSON.stringify({
        operation: "edit_excel",
        data: {
          cell: "A1",
          value: "Hello from Svelte!"
        }
      })
    );
  }

  connect();
</script>

<h1>SvelteKit ↔ Python Excel Editor (WebSocket)</h1>
<p>Status: {status}</p>

<button on:click={sendEdit}>
  Edit Excel Cell A1
</button>

{#if result}
  <p>Response: {result}</p>
{/if}
