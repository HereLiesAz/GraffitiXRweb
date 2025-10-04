import time
from playwright.sync_api import Page, expect

def test_ar_and_mockup_flow(page: Page):
    """
    This test verifies the end-to-end functionality of the AR and Mock-Up modes.
    """
    # 1. Arrange: Go to the application's homepage.
    page.goto("http://localhost:5173")
    expect(page.get_by_text("GraffitiXR")).to_be_visible()

    # 2. Act: Switch to AR Overlay mode.
    page.get_by_text("Mode\nImage Trace").click()
    page.get_by_text("Mode\nAR Overlay").click()
    expect(page.get_by_text("Capture Marks")).to_be_visible()

    # 3. Act: Load an image.
    # Use a relative path from the root of the project
    page.locator('input[type="file"]').first.set_input_files('dummy_image.png')

    # 4. Act: Capture the marker fingerprint.
    # We need to handle the alert that pops up
    page.once("dialog", lambda dialog: dialog.dismiss())
    page.get_by_text("Capture Marks").click()

    # 5. Act: Save the application state.
    with page.expect_download() as download_info:
        page.get_by_text("Save").click()
    download = download_info.value
    download.save_as("jules-scratch/verification/graffiti-xr-state.grf")

    # 6. Act: Reload the page to reset the state.
    page.reload()
    expect(page.get_by_text("Mode\nImage Trace")).to_be_visible() # Check that mode is reset

    # 7. Act: Load the saved state.
    page.locator('input[accept=".grf"]').set_input_files("jules-scratch/verification/graffiti-xr-state.grf")

    # 8. Assert: Verify that the state has been restored.
    expect(page.get_by_text("Mode\nAR Overlay")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/01-state-restored.png")

    # 9. Act: Switch to Mock Up mode.
    page.get_by_text("Mode\nAR Overlay").click()
    page.get_by_text("Mode\nMock Up").click()
    expect(page.get_by_text("Warp")).to_be_visible()

    # 10. Act: Activate warp mode and take a screenshot.
    page.get_by_text("Warp").click()
    page.screenshot(path="jules-scratch/verification/02-mock-up-warp-mode.png")