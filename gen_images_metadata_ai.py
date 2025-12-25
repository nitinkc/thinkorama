#!/usr/bin/env python3
"""
Enhanced metadata generator using Tesseract OCR + BLIP-2 image captioning.
Extracts both text from images and generates AI descriptions.

Usage: python gen_images_metadata_ai.py [--sample N]
"""
import os
import json
import sys
from pathlib import Path
from PIL import Image
import pytesseract

# Try to import transformers for BLIP-2
try:
    from transformers import BlipProcessor, BlipForConditionalGeneration
    BLIP_AVAILABLE = True
except ImportError:
    BLIP_AVAILABLE = False
    print("⚠️  BLIP-2 not available. Install with: pip install transformers torch")

def load_blip_model():
    """Load BLIP model for image captioning"""
    if not BLIP_AVAILABLE:
        return None, None
    
    print("Loading BLIP model (first time may take a few minutes to download)...")
    try:
        processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
        model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
        print("✓ BLIP model loaded successfully")
        return processor, model
    except Exception as e:
        print(f"⚠️  Could not load BLIP model: {e}")
        return None, None

def generate_image_caption(image_path, processor, model):
    """Generate caption for an image using BLIP"""
    if not processor or not model:
        return ""
    
    try:
        image = Image.open(image_path).convert('RGB')
        inputs = processor(image, return_tensors="pt")
        out = model.generate(**inputs, max_length=50)
        caption = processor.decode(out[0], skip_special_tokens=True)
        return caption
    except Exception as e:
        print(f"  Warning: Could not caption {image_path}: {e}")
        return ""

def extract_text_from_image(image_path):
    """Extract text using Tesseract OCR"""
    try:
        image = Image.open(image_path)
        text = pytesseract.image_to_string(image)
        # Clean up the text
        text = ' '.join(text.split())
        return text
    except Exception as e:
        print(f"  Warning: Could not process {image_path}: {e}")
        return ""

def generate_metadata(sample_size=None):
    """Generate metadata with OCR + BLIP captioning"""
    
    # Load images list
    with open('images.json', 'r') as f:
        images = json.load(f)
    
    if sample_size:
        images = images[:sample_size]
        print(f"Processing sample of {sample_size} images...")
    
    # Load BLIP model if available
    processor, model = load_blip_model()
    use_blip = processor is not None and model is not None
    
    print(f"\nStarting processing with:")
    print(f"  ✓ Tesseract OCR")
    print(f"  {'✓' if use_blip else '✗'} BLIP-2 Captioning")
    print()
    
    metadata = []
    total = len(images)
    
    for idx, img_path in enumerate(images, 1):
        full_path = os.path.join('images', img_path)
        
        if not os.path.exists(full_path):
            print(f"  Skipping missing file: {full_path}")
            continue
        
        # Extract folder and filename
        parts = img_path.split('/')
        folder = parts[0] if len(parts) > 1 else ''
        filename = parts[-1]
        
        # OCR extraction
        ocr_text = extract_text_from_image(full_path)
        
        # BLIP caption
        caption = ""
        if use_blip:
            caption = generate_image_caption(full_path, processor, model)
        
        # Combine all searchable text
        searchable_parts = [folder, filename.replace('.jpg', '').replace('.png', '')]
        if ocr_text:
            searchable_parts.append(ocr_text)
        if caption:
            searchable_parts.append(caption)
        
        searchable_text = ' '.join(searchable_parts).strip()
        
        metadata.append({
            "path": img_path,
            "text": searchable_text,
            "ocr": ocr_text,
            "caption": caption,
            "folder": folder,
            "filename": filename
        })
        
        if idx % 10 == 0:
            print(f"Processed {idx}/{total} images...")
    
    # Save metadata
    output_file = 'images-metadata.json'
    with open(output_file, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"\n✓ Generated '{output_file}' with {len(metadata)} image entries.")
    print(f"Successfully processed: {len(metadata)}")
    
    # Show sample
    if metadata:
        print(f"\n📋 Sample entries:")
        for item in metadata[:2]:
            print(f"\n  Path: {item['path']}")
            if item['ocr']:
                print(f"  OCR: {item['ocr'][:80]}...")
            if item['caption']:
                print(f"  Caption: {item['caption']}")
    
    print("\nYou can now use the enhanced search feature in the web app!")

if __name__ == '__main__':
    sample_size = None
    if len(sys.argv) > 1 and sys.argv[1] == '--sample':
        sample_size = int(sys.argv[2]) if len(sys.argv) > 2 else 10
    
    generate_metadata(sample_size)
