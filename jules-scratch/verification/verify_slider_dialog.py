import time
from playwright.sync_api import Page, expect

def test_slider_dialog_redesign(page: Page):
    """
    This test verifies the new design and functionality of the SliderDialog component.
    """
    # 1. Arrange: Go to the application's homepage.
    page.goto("http://localhost:5173")

    # Wait for the AzNavRail component to be ready.
    expect(page.get_by_text("GraffitiXR")).to_be_visible()

    # 2. Act: Click the "Opacity" button to open the slider dialog.
    page.get_by_text("Opacity").click()

    # 3. Assert: Check that the dialog is visible and take a screenshot.
    slider_dialog = page.locator(".slider-dialog")
    expect(slider_dialog).to_be_visible()
    expect(slider_dialog.get_by_text("Opacity")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/01-slider-dialog-new-look.png")

    # 4. Act: Change the slider value, then click the reset button.
    slider = slider_dialog.locator('input[type="range"]')
    slider.set_input_files([]) # This is a trick to clear the input
    slider.fill("0.2")

    reset_button = slider_dialog.get_by_role("button", name="Reset")
    reset_button.click()

    # 5. Assert: Check that the value has been reset and take a screenshot.
    expect(slider).to_have_value("0.5")
    page.screenshot(path="jules-scratch/verification/02-slider-dialog-reset.png")

    # 6. Act: Close the dialog.
    close_button = slider_dialog.get_by_role("button", name="Done")
    close_button.click()

    # 7. Assert: Check that the dialog is no longer visible.
    expect(slider_dialog).not_to_be_visible()
    page.screenshot(path="jules-scratch/verification/03-slider-dialog-closed.png")