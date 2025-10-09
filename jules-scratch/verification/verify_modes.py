from playwright.sync_api import Page, expect
import time

def test_mode_switching_and_features(page: Page):
    """
    This test verifies the mode switching and the core functionality of each mode.
    """
    # Listen for all console events and print them
    page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text()}"))

    # 1. Arrange: Go to the app and dismiss onboarding.
    page.goto("http://localhost:5175/GraffitiXRweb/")

    # Give the app a moment to load and potentially crash
    time.sleep(2)

    page.screenshot(path="jules-scratch/verification/00-debug-page-load.png")

    onboarding_modal = page.locator(".onboarding-modal")
    if onboarding_modal.is_visible():
        onboarding_modal.get_by_role("button", name="Get Started").click()

    # 2. Assert: Verify initial state is Image Trace mode.
    expect(page.get_by_text("Image Trace")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/01-image-trace-mode.png")

    # 3. Act: Switch to Mock-Up mode.
    page.get_by_text("Image Trace").click()
    expect(page.get_by_text("Mock Up")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/02-mock-up-mode.png")

    # 4. Act: Load background and overlay images.
    page.locator('input[type="file"]').first.set_input_files("jules-scratch/verification/test_image.png")
    page.locator('input[type="file"]').last.set_input_files("jules-scratch/verification/test_image.png")

    # Wait for images to load
    canvas = page.locator("#overlay-canvas")
    expect(canvas).to_have_attribute("data-image-loaded", "true", timeout=5000)
    time.sleep(1) # Give it a moment to render
    page.screenshot(path="jules-scratch/verification/03-mock-up-images-loaded.png")

    # 5. Act & Assert: Test Warp mode.
    page.get_by_text("Warp").click()
    # Drag a warp point
    page.mouse.move(100, 100)
    page.mouse.down()
    page.mouse.move(150, 150)
    page.mouse.up()
    time.sleep(1) # Give it a moment to render
    page.screenshot(path="jules-scratch/verification/04-mock-up-warped.png")

    # 6. Act: Switch to AR Overlay mode.
    page.get_by_text("Mock Up").click()
    expect(page.get_by_text("AR Overlay")).to_be_visible()
    # Check for the AR button provided by @react-three/xr
    expect(page.get_by_role("button", name="Enter AR")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/05-ar-overlay-mode.png")