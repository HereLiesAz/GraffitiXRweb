import time
from playwright.sync_api import Page, expect

def test_graffitixr_image_trace_mode(page: Page):
    """
    This test verifies that the Image Trace mode in GraffitiXRweb functions
    correctly. It checks for the appearance of the slider dialog when an
    image property is clicked.
    """
    # 1. Arrange: Go to the application's homepage.
    page.goto("http://localhost:5173")

    # Wait for the AzNavRail component to be ready.
    expect(page.get_by_text("GraffitiXR")).to_be_visible()

    # 2. Act: Load an image.
    page.locator('input[type="file"]').set_input_files('jules-scratch/verification/dummy_image.png')

    # Wait for the image to be processed.
    time.sleep(2)

    # 3. Act: Click the "Opacity" button to open the slider dialog.
    page.get_by_text("Opacity").click()

    # 4. Assert: Verify the slider dialog is visible.
    expect(page.get_by_text("Opacity")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/07-image-trace-slider-open.png")

    # 5. Act: Close the slider dialog.
    page.get_by_text("Close").click()

    # 6. Assert: Verify the slider dialog is closed.
    expect(page.get_by_text("Close")).not_to_be_visible()
    page.screenshot(path="jules-scratch/verification/08-image-trace-slider-closed.png")