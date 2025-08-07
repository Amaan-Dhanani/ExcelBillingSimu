from quart import Quart, websocket
import openpyxl

app = Quart(__name__)

clients = set()

@app.websocket("/ws")
async def ws():
    print("start")
    while True:
        print("waiting")
        data = await websocket.receive_json()
        print("Received from frontend:", data)
        # Example: modify Excel file
        if data["operation"] == "edit_excel":
            file_path = data["data"].get("file_path")
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


if __name__ == "__main__":
    app.run(port=5000)