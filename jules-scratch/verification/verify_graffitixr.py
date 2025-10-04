from playwright.sync_api import Page, expect

def test_graffitixr_modes(page: Page):
    """
    This test verifies that the GraffitiXRweb application can switch between
    its three main modes (Image Trace, AR Overlay, Mock-Up) and that the
    UI updates accordingly.
    """
    # 1. Arrange: Go to the application's homepage.
    # We assume the Vite dev server is running on the default port 5173.
    page.goto("http://localhost:5173")

    # Wait for the AzNavRail component to be ready
    expect(page.get_by_text("GraffitiXR")).to_be_visible()

    # 2. Act & Assert: Verify Image Tracing mode (default)
    expect(page.get_by_text("Image Trace")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/01-image-trace-mode.png")

    # 3. Act: Switch to AR Overlay mode
    mode_cycler = page.get_by_text("Mode")
    mode_cycler.click()

    # 4. Assert: Verify AR Overlay mode
    expect(page.get_by_text("AR Overlay")).to_be_visible()
    expect(page.get_by_text("Lock/Unlock")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/02-ar-overlay-mode.png")

    # 5. Act: Switch to Mock-Up mode
    mode_cycler.click()

    # 6. Assert: Verify Mock-Up mode
    expect(page.get_by_text("Mock-Up")).to_be_visible()
    expect(page.get_by_text("Warp")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/03-mock-up-mode.png")