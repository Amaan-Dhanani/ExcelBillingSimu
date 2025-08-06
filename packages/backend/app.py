from quart import Quart, websocket
from quart_cors import cors
import openpyxl

app = Quart(__name__)
app = cors(app, allow_origin="*")

clients = set()

@app.websocket("/ws")
async def ws():
    clients.add(websocket._get_current_object())
    try:
        while True:
            data = await websocket.receive_json()
            print("Received from frontend:", data)

            # Example: modify Excel file
            if data["operation"] == "edit_excel":
                file_path = "example.xlsx"
                wb = openpyxl.load_workbook(file_path)
                ws_excel = wb.active

                cell = data["data"]["cell"]
                value = data["data"]["value"]

                ws_excel[cell] = value
                wb.save(file_path)

                await websocket.send_json({
                    "status": "updated",
                    "cell": cell,
                    "value": value
                })
    finally:
        clients.remove(websocket._get_current_object())

if __name__ == "__main__":
    app.run(port=5000)