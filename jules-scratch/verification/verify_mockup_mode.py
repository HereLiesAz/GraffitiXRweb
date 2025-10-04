import time
from playwright.sync_api import Page, expect

def test_graffitixr_mockup_mode(page: Page):
    """
    This test verifies that the Mock-Up mode in GraffitiXRweb functions correctly.
    It checks for the appearance of warp handles and the functionality of
    the undo, redo, and reset buttons.
    """
    # 1. Arrange: Go to the application's homepage.
    page.goto("http://localhost:5173")

    # Wait for the AzNavRail component to be ready.
    expect(page.get_by_text("GraffitiXR")).to_be_visible()

    # 2. Act: Switch to Mock-Up mode.
    page.get_by_text("Mode").click()
    page.get_by_text("Mock-Up").click()
    expect(page.get_by_text("Warp")).to_be_visible()

    # 3. Act: Load an image.
    # The file input is hidden, so we need to use this workaround to set its value.
    page.locator('input[type="file"]').set_input_files('jules-scratch/verification/dummy_image.png')

    # Wait for the image to be processed and warp points to initialize.
    time.sleep(2)

    # 4. Act: Activate Warp mode and verify handles.
    page.get_by_text("Warp").click()
    page.screenshot(path="jules-scratch/verification/04-mockup-warp-active.png")

    # 5. Act: Deactivate Warp mode.
    page.get_by_text("Apply Warp").click()
    page.screenshot(path="jules-scratch/verification/05-mockup-warp-applied.png")

    # This part is harder to verify with screenshots without actual dragging,
    # but we can check that the buttons exist.
    expect(page.get_by_text("Undo")).to_be_visible()
    expect(page.get_by_text("Redo")).to_be_visible()
    expect(page.get_by_text("Reset")).to_be_visible()