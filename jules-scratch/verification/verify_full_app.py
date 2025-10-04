import time
from playwright.sync_api import Page, expect

def test_graffitixr_full_flow(page: Page):
    """
    This test verifies the end-to-end functionality of the GraffitiXRweb
    application, including mode switching, image loading, and marker capture.
    """
    # 1. Arrange: Go to the application's homepage.
    page.goto("http://localhost:5173")

    # Wait for the AzNavRail component to be ready.
    expect(page.get_by_text("GraffitiXR")).to_be_visible()

    # 2. Act: Switch to AR Overlay mode.
    page.get_by_text("Mode").click()
    page.get_by_text("AR Overlay").click()
    expect(page.get_by_text("Capture Marks")).to_be_visible()

    # 3. Act: Load an image.
    page.locator('input[type="file"]').first.set_input_files('jules-scratch/verification/dummy_image.png')

    # Wait for the image to be processed.
    time.sleep(2)

    # 4. Act: Capture the marker fingerprint.
    page.get_by_text("Capture Marks").click()

    # 5. Assert: Take a screenshot to verify the UI state.
    page.screenshot(path="jules-scratch/verification/06-full-app-flow.png")