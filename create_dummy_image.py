from PIL import Image, ImageDraw

# Create a dummy image
img = Image.new('RGB', (200, 200), color = 'red')
d = ImageDraw.Draw(img)
d.text((10,10), "Dummy Image for Testing", fill=(255,255,0))
img.save('dummy_image.png')