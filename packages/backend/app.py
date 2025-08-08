from quart import Quart, websocket
import openpyxl
import openpyxl.styles.fills as fills
import os

# Patch PatternFill.__init__ to ignore 'extLst' keyword argument (SoftMaker Planmaker workaround)
original_init = fills.PatternFill.__init__

def patched_init(self, *args, **kwargs):
    if 'extLst' in kwargs:
        kwargs.pop('extLst')
    original_init(self, *args, **kwargs)

fills.PatternFill.__init__ = patched_init

app = Quart(__name__)

@app.websocket("/ws")
async def ws():
    print("start")
    while True:
        print("waiting")
        data = await websocket.receive_json()
        print("Received from frontend:", data)

        operation = data.get("operation")
        file_path = data.get("data", {}).get("file_path")

        if operation == "edit_excel":
            try:
                wb = openpyxl.load_workbook(file_path)
                ws_excel = wb.active
                ws_excel["A1"] = "it works?"
                wb.save(file_path)

                await websocket.send_json({
                    "status": "updated",
                    "cell": "A1",
                    "value": "it works?"
                })

            except PermissionError:
                await websocket.send_json({
                    "status": "error",
                    "message": "The Excel file is currently open. Please close it before editing."
                })

            except Exception as e:
                msg = str(e)
                # Suppress SoftMaker Office error silently
                if "PatternFill.__init__() got an unexpected keyword argument 'extLst'" in msg:
                    # Ignore the error completely, do not send an error message back
                    continue
                await websocket.send_json({
                    "status": "error",
                    "message": msg
                })

        elif operation == "get_sheets":
            try:
                wb = openpyxl.load_workbook(file_path, read_only=True)
                sheet_names = wb.sheetnames
                await websocket.send_json({
                    "status": "success",
                    "message": sheet_names
                })
            except Exception as e:
                msg = str(e)
                # Suppress SoftMaker Office error silently
                if "PatternFill.__init__() got an unexpected keyword argument 'extLst'" in msg:
                    # Ignore the error completely, do not send an error message back
                    continue
                await websocket.send_json({
                    "status": "error",
                    "message": msg
                })

if __name__ == "__main__":
    app.run(port=5000)