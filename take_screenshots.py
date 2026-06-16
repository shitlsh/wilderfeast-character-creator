import asyncio
import os
import time
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # Open local dev server url
        url = "http://localhost:5174/"
        print(f"Connecting to {url}...")
        try:
            await page.goto(url, timeout=10000)
            # Wait for content to render
            await page.wait_for_timeout(2000)
            print("Successfully loaded page.")
        except Exception as e:
            print("Connection failed, trying 5173 instead...")
            url = "http://localhost:5173/"
            await page.goto(url, timeout=10000)
            await page.wait_for_timeout(2000)
            print("Successfully loaded page on 5173.")

        # Capture Desktop screenshot
        await page.set_viewport_size({"width": 1280, "height": 800})
        await page.wait_for_timeout(1000)
        desktop_path = "public/desktop-screenshot.png"
        await page.screenshot(path=desktop_path)
        print(f"Saved desktop screenshot to {desktop_path}")

        # Capture Mobile screenshot
        await page.set_viewport_size({"width": 375, "height": 812})
        await page.wait_for_timeout(1000)
        mobile_path = "public/mobile-screenshot.png"
        await page.screenshot(path=mobile_path)
        print(f"Saved mobile screenshot to {mobile_path}")

        # Let's inspect some layout elements for overflow
        print("\n--- Visual Verification Check ---")
        skills_box = await page.query_selector(".lg\\:col-span-8") # skills container
        if skills_box:
            box_size = await skills_box.bounding_box()
            print(f"Skills Box Size: width={box_size['width']}, height={box_size['height']}")
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
