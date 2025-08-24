import os
import json

# Define the image folder and valid extensions
image_folder = 'images'
valid_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'}

# List to store relative image paths
image_paths = []

# Walk through the directory recursively
for root, _, files in os.walk(image_folder):
    for file in files:
        ext = os.path.splitext(file)[1].lower()
        if ext in valid_extensions:
            # Get relative path from the images folder
            relative_path = os.path.relpath(os.path.join(root, file), image_folder)
            # Normalize path for web use
            image_paths.append(relative_path.replace("\\", "/"))

# Write the image paths to images.json
with open('images.json', 'w') as json_file:
    json.dump(image_paths, json_file, indent=2)

print(f"Generated 'images.json' with {len(image_paths)} image paths.")
