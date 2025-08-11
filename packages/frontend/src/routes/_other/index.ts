import { writable } from 'svelte/store';
import { browser } from "$app/environment";
import { get } from 'svelte/store';

/**
 * - Contains the websocket itself, which is changed to a specific websocket during connection.
 */
let socket: WebSocket;


/**
 * - Contains the submitted form/table data to complete edit.
 * - Shared between the `TableEditor` component and `+page.svelte` for synchronization.
 */
export const submittedData = writable<string[][]>([]);



/**
 * - Contains the read data to complete edit.
 * - Shared between the `TableEditor` component and `+page.svelte` for synchronization.
 */
export const readData = writable<string[][]>([]);



/**
 * - Contains the names of each sheet in Excel.
 * - Is only used in `+page.svelte`.
 */
export const sheetNames = writable<string[]>([]);



/**
 * - Tracks the current status of the connection to the backend.
 * - Is only used within `+page.svelte`.
 */
export let status = writable<string>("Disconnected");



/**
 * - Variable of the sheet to edit data in.
 * - Is only used within `+page.svelte`.
 */
export let sheet = writable<string>("");



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
 * - Function to connect to the websocket.
 * - If it doesn't connect, status becomes `"Disconnected"`.
 * - If it does, status becomes `"Connected"`.
 */
export function connect() {
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

    if (message.status === "edit_made") {
      console.log(`${message.message}`);
      alert("Excel file updated successfully.");
    } else if (message.status === "error") {
      console.error("Error from backend:", message.message);
      alert(`Error: ${message.message}`);
    } else if (message.status === "received_sheets" && message.message) {
      console.log("Available sheets:", message.message);
      sheetNames.set(message.message);
      console.log(get(sheetNames));
    } else if (message.status === "table_data" && message.message) {
      console.log("Available data:", message.message);
      readData.set(message.message);
      console.log(get(readData));
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

  if (get(status) === "Connected") {
    const payload = {
      operation: "get_sheets",
      data: {
        file_path: get(excelFilePath),
      },
    };

    console.log("Requesting sheets with payload:", payload);
    socket.send(JSON.stringify(payload));
  }
}


/**
 * - Function to make the edit.
 * - 
 * -
 */
export function sendEdit() {
  const payload = {
    operation: "edit_excel",
    data: {
      file_path: get(excelFilePath),
      sheet: get(sheet),
      submitted_data: get(submittedData),
      read_data: get(readData)
    },
  };

  console.log("Sending edit payload:", payload);
  socket.send(JSON.stringify(payload));
}




/**
 * - Function which gets data for each sheet.
 * - 
 * -
 */
export function eachSheet() {
  const payload = {
    operation: "each_sheet",
    data: {
      file_path: get(excelFilePath),
      sheet: get(sheet),
    },
  };

  console.log("Sending edit payload:", payload);
  socket.send(JSON.stringify(payload));
}

