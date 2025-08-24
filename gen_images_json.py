import os
import json

image_folder = 'images'
image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'}

image_files = [
    filename for filename in os.listdir(image_folder)
    if os.path.isfile(os.path.join(image_folder, filename)) and
       os.path.splitext(filename)[1].lower() in image_extensions
]

with open('images.json', 'w') as json_file:
    json.dump(image_files, json_file, indent=2)

print(f"Generated 'images.json' with {len(image_files)} image filenames.")
