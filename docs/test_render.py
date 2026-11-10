import urllib.request, json, asyncio, websockets, base64

req = urllib.request.urlopen('http://127.0.0.1:9222/json')
tabs = json.loads(req.read().decode('utf-8'))
local_tabs = [t for t in tabs if t.get('type') == 'page' and 'localhost:4321' in t.get('url', '')]
tab = local_tabs[0]
ws_url = tab['webSocketDebuggerUrl']

async def test_sequence():
    async with websockets.connect(ws_url, max_size=10*1024*1024) as ws:
        # Reload
        await ws.send(json.dumps({'id': 1, 'method': 'Page.reload', 'params': {'ignoreCache': True}}))
        await ws.recv()
        await asyncio.sleep(1.2)

        # 1. Capture initial load
        await ws.send(json.dumps({'id': 2, 'method': 'Page.captureScreenshot', 'params': {'format': 'png'}}))
        res = await ws.recv()
        b64 = json.loads(res).get('result', {}).get('data', '')
        if b64:
            with open('docs/screenshot_v2_load.png', 'wb') as f:
                f.write(base64.b64decode(b64))
            print('Saved docs/screenshot_v2_load.png')

        # 2. Click the plate at (400, 300)
        await ws.send(json.dumps({
            'id': 3,
            'method': 'Input.dispatchMouseEvent',
            'params': {'type': 'mousePressed', 'x': 400, 'y': 300, 'button': 'left', 'clickCount': 1}
        }))
        await ws.recv()
        await ws.send(json.dumps({
            'id': 4,
            'method': 'Input.dispatchMouseEvent',
            'params': {'type': 'mouseReleased', 'x': 400, 'y': 300, 'button': 'left'}
        }))
        await ws.recv()

        # Wait during mending
        await asyncio.sleep(1.2)
        await ws.send(json.dumps({'id': 5, 'method': 'Page.captureScreenshot', 'params': {'format': 'png'}}))
        res = await ws.recv()
        b64 = json.loads(res).get('result', {}).get('data', '')
        if b64:
            with open('docs/screenshot_v2_mending.png', 'wb') as f:
                f.write(base64.b64decode(b64))
            print('Saved docs/screenshot_v2_mending.png')

        # Wait for full settle
        await asyncio.sleep(2.0)
        await ws.send(json.dumps({'id': 6, 'method': 'Page.captureScreenshot', 'params': {'format': 'png'}}))
        res = await ws.recv()
        b64 = json.loads(res).get('result', {}).get('data', '')
        if b64:
            with open('docs/screenshot_v2_settled.png', 'wb') as f:
                f.write(base64.b64decode(b64))
            print('Saved docs/screenshot_v2_settled.png')

asyncio.run(test_sequence())
