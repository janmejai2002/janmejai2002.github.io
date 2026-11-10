import urllib.request, json, asyncio, websockets, base64

req = urllib.request.urlopen('http://127.0.0.1:9222/json')
tabs = json.loads(req.read().decode('utf-8'))
local_tabs = [t for t in tabs if t.get('type') == 'page' and ('localhost' in t.get('url', '') or 'janmejai2002' in t.get('url', ''))]

if not local_tabs:
    # Use any open page tab
    local_tabs = [t for t in tabs if t.get('type') == 'page']

tab = local_tabs[0]
ws_url = tab['webSocketDebuggerUrl']
print(f"Targeting tab: {tab.get('title')} ({tab.get('url')})")

async def run_audit():
    async with websockets.connect(ws_url, max_size=10*1024*1024) as ws:
        msg_id = 1
        
        async def call(method, params=None):
            nonlocal msg_id
            m_id = msg_id
            msg_id += 1
            payload = {'id': m_id, 'method': method}
            if params:
                payload['params'] = params
            await ws.send(json.dumps(payload))
            while True:
                res = await ws.recv()
                data = json.loads(res)
                if data.get('id') == m_id:
                    return data.get('result', {})

        async def capture(filename):
            res = await call('Page.captureScreenshot', {'format': 'png'})
            b64 = res.get('data', '')
            if b64:
                with open(filename, 'wb') as f:
                    f.write(base64.b64decode(b64))
                print(f"Saved {filename}")

        # 1. Navigate to Home
        print("Navigating to http://localhost:4321/ ...")
        await call('Page.navigate', {'url': 'http://localhost:4321/'})
        await asyncio.sleep(2.0)
        await capture('docs/screenshot_v3_home_serene.png')

        # 2. Click the plate to trigger kintsugi fracture
        print("Clicking plate at (450, 320) ...")
        await call('Input.dispatchMouseEvent', {'type': 'mousePressed', 'x': 450, 'y': 320, 'button': 'left', 'clickCount': 1})
        await call('Input.dispatchMouseEvent', {'type': 'mouseReleased', 'x': 450, 'y': 320, 'button': 'left'})
        await asyncio.sleep(1.2)
        await capture('docs/screenshot_v3_home_mending.png')
        await asyncio.sleep(2.2)
        await capture('docs/screenshot_v3_home_settled.png')

        # 3. Navigate to a Case Study (Uso Lens)
        print("Navigating to Case Study post (Klarna) ...")
        await call('Page.navigate', {'url': 'http://localhost:4321/blog/klarna-ai-customer-service-graded-honestly/'})
        await asyncio.sleep(1.5)
        await capture('docs/screenshot_v3_post_lens_uso.png')

        # 4. Navigate to a Technical post (Tsugi Lens)
        print("Navigating to Technical post (KV Cache) ...")
        await call('Page.navigate', {'url': 'http://localhost:4321/blog/kv-cache-explained/'})
        await asyncio.sleep(1.5)
        await capture('docs/screenshot_v3_post_lens_tsugi.png')

        print("CDP Audit Screenshots Complete.")

asyncio.run(run_audit())
