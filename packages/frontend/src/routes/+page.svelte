<script lang="ts">
  let socket: WebSocket;
  let status = "Not connected";
  let result = "";
  let filePath = "";

  // On form submit, store file path in localStorage
  function handleSubmit(e: Event) {
    e.preventDefault();
    localStorage.setItem("excelFilePath", filePath);
    connect(); // Connect after setting file path
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
          file_path: storedFilePath
        }
      })
    );
  }
</script>

<p>Status: {status}</p>

<form on:submit|preventDefault={handleSubmit}>
  <label>
    Excel File Path:
    <input bind:value={filePath} placeholder="example.xlsx" />
  </label>
  <button type="submit">Connect</button>
</form>

<button on:click={sendEdit}>
  Edit Excel Cell A1
</button>

{#if result}
  <p>Response: {result}</p>
{/if}
