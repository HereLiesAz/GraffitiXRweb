import time
from playwright.sync_api import Page, expect

def test_ui_improvements(page: Page):
    """
    This test verifies the redesigned SliderDialog and the new Notification component.
    """
    # 1. Arrange: Go to the application's homepage.
    page.goto("http://localhost:5173")
    expect(page.get_by_text("GraffitiXR")).to_be_visible()

    # 2. Act & Assert: Test the SliderDialog
    # Open the dialog
    page.get_by_text("Opacity").click()
    slider_dialog = page.locator(".slider-dialog")
    expect(slider_dialog).to_be_visible()
    expect(slider_dialog.get_by_text("Opacity")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/01-slider-dialog.png")

    # Test the reset button
    slider = slider_dialog.locator('input[type="range"]')
    slider.fill("0.2")
    reset_button = slider_dialog.get_by_role("button", name="Reset")
    reset_button.click()
    expect(slider).to_have_value("0.5")

    # Close the dialog
    close_button = slider_dialog.get_by_role("button", name="Done")
    close_button.click()
    expect(slider_dialog).not_to_be_visible()

    # 3. Act & Assert: Test the Notification
    # Click the "Capture Marks" button
    page.get_by_text("Capture Marks").click()

    # Verify that the notification is visible and take a screenshot
    notification = page.locator(".notification")
    expect(notification).to_be_visible()
    expect(notification).to_contain_text("keypoints captured")
    page.screenshot(path="jules-scratch/verification/02-notification.png")

    # Wait for the notification to disappear
    expect(notification).not_to_be_visible(timeout=5000)