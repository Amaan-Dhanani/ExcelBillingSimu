<script lang="ts">
  import { tick } from "svelte";
  import { onMount } from "svelte";
  import { sendEdit } from ".";

  export let data: string[][] = [[""]];
  export let colHeaders: string[] | undefined = undefined;
  export let rowHeaders: string[] = [
    "Procedure Code",
    "Units",
    "POS",
    "Dates of Service (add more as needed)"
  ];

  let table: string[][] = [];
  let undoStack: string[][][] = [];
  let redoStack: string[][][] = [];
  import { submittedData } from ".";

  let inputRefs: (HTMLInputElement | undefined)[][] = [];

  onMount(() => {
    table = data.length ? data.map((row) => [...row]) : [[""]];
  });

  $: {
    if (colHeaders && table[0] && colHeaders.length < table[0].length) {
      colHeaders = [
        ...colHeaders,
        ...Array(table[0].length - colHeaders.length).fill(""),
      ];
    }
    if (rowHeaders && rowHeaders.length < table.length) {
      rowHeaders = [
        ...rowHeaders,
        ...Array(table.length - rowHeaders.length).fill(""),
      ];
    }
  }

  function saveState() {
    undoStack.push(table.map((row) => [...row]));
    if (undoStack.length > 100) undoStack.shift();
    redoStack = [];
  }

  function addColumn() {
    saveState();
    table = table.map((row) => [...row, ""]);
  }

  function deleteColumn(colIndex: number) {
    if (table[0].length <= 1) return;
    saveState();
    table = table.map((row) => row.filter((_, i) => i !== colIndex));
  }

  function addRow() {
    saveState();
    const columnCount = table[0]?.length || 1;
    table = [...table, Array(columnCount).fill("")];
  }

  function deleteRow(rowIndex: number) {
    if (table.length <= 1) return;
    saveState();
    table = table.filter((_, i) => i !== rowIndex);
  }

  function updateCell(row: number, col: number, value: string) {
    saveState();
    table[row][col] = value;
    table = [...table];
  }

  function inputRef(
    node: HTMLInputElement,
    params: { row: number; col: number },
  ) {
    const { row, col } = params;
    inputRefs[row] ??= [];
    inputRefs[row][col] = node;

    return {
      destroy() {
        inputRefs[row][col] = undefined;
      },
    };
  }

  function handleInput(e: Event, row: number, col: number) {
    const target = e.target as HTMLInputElement;
    updateCell(row, col, target.value);
  }

  function handleKeydown(e: KeyboardEvent, row: number, col: number) {
    const maxRow = table.length - 1;
    const maxCol = table[0].length - 1;

    switch (e.key) {
      case "ArrowUp":
        if (row > 0) {
          e.preventDefault();
          focusCell(row - 1, col);
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (row < maxRow) {
          focusCell(row + 1, col);
        } else {
          addRow();
          tick().then(() => focusCell(row + 1, col));
        }
        break;
      case "ArrowLeft":
        if (col > 0) {
          e.preventDefault();
          focusCell(row, col - 1);
        }
        break;
      case "ArrowRight":
        if (col < maxCol) {
          e.preventDefault();
          focusCell(row, col + 1);
        }
        break;
      case "Enter":
        e.preventDefault();
        if (row < maxRow) {
          focusCell(row + 1, col);
        } else {
          addRow();
          tick().then(() => focusCell(row + 1, col));
        }
        break;
      case "Tab":
        e.preventDefault();
        if (e.shiftKey) {
          if (col > 0) {
            focusCell(row, col - 1);
          } else if (row > 0) {
            focusCell(row - 1, table[row - 1].length - 1);
          }
        } else {
          if (col < maxCol) {
            focusCell(row, col + 1);
          } else if (row < maxRow) {
            focusCell(row + 1, 0);
          }
        }
        break;
    }
  }

  function focusCell(row: number, col: number) {
    const target = inputRefs[row]?.[col];
    if (target) {
      target.focus();
      target.select();
    }
  }

  function undo() {
    if (undoStack.length === 0) return;
    redoStack.push(table.map((row) => [...row]));
    table = undoStack.pop()!;
  }

  function redo() {
    if (redoStack.length === 0) return;
    undoStack.push(table.map((row) => [...row]));
    table = redoStack.pop()!;
  }

  function submitTable() {
    submittedData.set(table.map((row) => [...row]));
    console.log("Submitted Data:", $submittedData);
    sendEdit();
  }
</script>

<div class="overflow-auto">
  <table class="table-auto border-collapse w-full mt-4">
    <thead>
      <tr class="bg-gray-100 text-left">
        <th class="border px-4 py-2 text-center font-semibold"></th>
        {#each table[0] as _, colIndex}
          <th class="border px-4 py-2 text-center font-semibold">
            {colHeaders?.[colIndex] ?? `Code ${colIndex + 1}`}
            <button
              on:click={() => deleteColumn(colIndex)}
              class="ml-2 text-red-500 hover:text-red-700"
              title="Delete Column"
            >
              &times;
            </button>
          </th>
        {/each}
        <th class="px-2">
          <button
            on:click={addColumn}
            class="bg-green-500 hover:bg-green-600 text-white text-sm px-2 py-1 rounded"
          >
            + Column
          </button>
        </th>
      </tr>
    </thead>

    <tbody>
      {#each table as row, rowIndex (rowIndex)}
        <tr>
          <th
            class="border px-4 py-2 text-center font-semibold bg-gray-100 flex items-center justify-center space-x-1"
          >
            <span>{rowHeaders?.[rowIndex] ?? `Code ${rowIndex + 1}`}</span>
            
            <button
              on:click={() => deleteRow(rowIndex)}
              class="text-red-500 hover:text-red-700 font-bold"
              title="Delete Row"
            >
              &times;
            </button>
          </th>

          {#each row as cell, colIndex}
            <td class="border px-4 py-2 text-center">
              <input
                type="text"
                bind:value={table[rowIndex][colIndex]}
                use:inputRef={{ row: rowIndex, col: colIndex }}
                on:input={(e) => handleInput(e, rowIndex, colIndex)}
                on:keydown={(e) => handleKeydown(e, rowIndex, colIndex)}
                class="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </td>
          {/each}
          <td></td>
        </tr>
      {/each}
    </tbody>
  </table>

  <div class="py-2 space-x-2">
    <button
      on:click={addRow}
      class="bg-blue-500 hover:bg-blue-600 text-white text-sm px-2 py-1 rounded font-semibold"
    >
      + Row
    </button>
    <br /><br />
    <button
      on:click={undo}
      disabled={undoStack.length === 0}
      class="bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-1 rounded font-semibold"
      title="Undo (Ctrl+Z)"
    >
      Undo
    </button>
    <button on:click={redo} disabled={redoStack.length === 0} class="hidden">
      Redo
    </button>
    <button
      on:click={submitTable}
      class="bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-1 rounded font-semibold"
      title="Submit Table"
    >
      Submit
    </button>
  </div>
</div>
