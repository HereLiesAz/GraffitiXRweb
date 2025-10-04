from PIL import Image

# Create a new 100x100 image with a black background
img = Image.new('RGB', (100, 100), 'black')
img.save('jules-scratch/verification/dummy_image.png')
print("Dummy image created successfully.")