import os
import json

image_folder = 'images'
valid_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'}

image_paths = []

for root, _, files in os.walk(image_folder):
    for file in files:
        ext = os.path.splitext(file)[1].lower()
        if ext in valid_extensions:
            relative_path = os.path.relpath(os.path.join(root, file), image_folder)
            image_paths.append(relative_path.replace("\\", "/"))

with open('images.json', 'w') as json_file:
    json.dump(image_paths, json_file, indent=2)

print(f"Generated 'images.json' with {len(image_paths)} image paths.")
