from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from utils.realtime import realtime_manager

router = APIRouter(tags=["Monitoring"])


@router.websocket("/ws/monitor")
async def monitor_ws(websocket: WebSocket) -> None:
    await realtime_manager.connect(websocket)
    try:
        while True:
            # Keep the socket alive and allow clients to send ping payloads.
            await websocket.receive_text()
    except WebSocketDisconnect:
        realtime_manager.disconnect(websocket)
