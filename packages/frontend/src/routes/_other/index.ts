import { writable } from 'svelte/store';
import { browser } from "$app/environment";
import { get } from 'svelte/store';

/**
 * - Contains the websocket itself, which is changed to a specific websocket during connection.
 */
let socket: WebSocket;


/**
 * - Contains the submitted form/table data.
 * - Shared between the `TableEditor` component and `+page.svelte` for synchronization.
 */
export const submittedData = writable<string[][]>([]);



/**
 * - Tracks the current status of the connection to the backend.
 * - Is only used within `+page.svelte`.
 */
export let status = writable<string>("Disconnected");



/**
 * - Tracks the file path used access the workbook, which is maintained by `localStorage`.
 * - If it doesn't exist in localStorage, it remains as blank.
 * - Is only used within `+page.svelte`.
 */
export let excelFilePath = writable<string>("");

if (browser) {
  const stored = localStorage.getItem("excelFilePath");
  if (stored) {
    excelFilePath.set(stored);
  }
}

/**
 * - Nonexported function to connect to the websocket.
 * - If it doesn't connect, status becomes `"Disconnected"`.
 * - If it does, status becomes `"Connected"`.
 */
function connect() {
  socket = new WebSocket("ws://127.0.0.1:5000/ws");

  socket.onopen = () => {
    status.set("Connected");
  };

  socket.onclose = () => {
    status.set("Disconnected");
  };

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log("Received from backend:", message);

    if (message.status === "updated") {
      console.log(`Cell ${message.cell} updated with value ${message.value}`);
      alert("Excel file updated successfully.");
    } else if (message.status === "error") {
      console.error("Error from backend:", message.message);
      alert(`Error: ${message.message}`);
    } else if (message.status === "success" && message.sheets) {
      console.log("Available sheets:", message.sheets);
    }
  };

}




/**
 * - Function to submit the `excelFilePath`.
 * - When submitting, it simply set the `excelFilePath`
 * - If it does, status becomes `"Connected"`.
 */
export async function fileSubmit(e: Event) {
  e.preventDefault();
  if (browser) {
    localStorage.setItem("excelFilePath", get(excelFilePath));
  }
  
  connect();

  setTimeout(() => {
    if (get(status) === "Connected") {
      requestSheets();
    }
  }, 500);
}


/**
 * - Function to submit the `excelFilePath` and all the data needed for the backend.
 * - 
 * -
 */
export function sendEdit() {
  const payload = {
    operation: "edit_excel",
    data: {
      file_path: get(excelFilePath),
    },
  };

  console.log("Sending edit payload:", payload);
  socket.send(JSON.stringify(payload));
}



/**
 * - Sends a request to the backend via WebSocket to retrieve the list of sheet names
 * - from the Excel workbook specified by the current `excelFilePath`.
 */
export function requestSheets() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const payload = {
      operation: "get_sheets",
      data: {
        file_path: get(excelFilePath),
      },
    };

    console.log("Requesting sheets with payload:", payload);
    socket.send(JSON.stringify(payload));
  } else {
    console.warn("Socket not connected yet.");
  }
}
