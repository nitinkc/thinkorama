#!/usr/bin/env python3
"""
Enhanced metadata generator using Tesseract OCR + BLIP-2 image captioning.
Extracts both text from images and generates AI descriptions.

Usage: 
  python gen_images_metadata_ai.py              # Full regeneration (creates backup)
  python gen_images_metadata_ai.py --incremental  # Only process new images
  python gen_images_metadata_ai.py --sample N     # Test with N images
"""
import os
import json
import sys
import shutil
from datetime import datetime
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

def load_existing_metadata():
    """Load existing metadata file if it exists"""
    if os.path.exists('images-metadata.json'):
        try:
            with open('images-metadata.json', 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"⚠️  Could not load existing metadata: {e}")
    return []

def create_backup():
    """Create timestamped backup of existing metadata"""
    if os.path.exists('images-metadata.json'):
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_name = f'images-metadata.backup.{timestamp}.json'
        shutil.copy('images-metadata.json', backup_name)
        print(f"✓ Created backup: {backup_name}")
        return backup_name
    return None

def generate_metadata(sample_size=None, incremental=False):
    """Generate metadata with OCR + BLIP captioning
    
    Args:
        sample_size: If set, only process first N images
        incremental: If True, only process new images not in existing metadata
    """
    
    # Load images list
    with open('images.json', 'r') as f:
        all_images = json.load(f)
    
    # Load existing metadata if incremental mode
    existing_metadata = {}
    if incremental:
        existing_list = load_existing_metadata()
        existing_metadata = {item['path']: item for item in existing_list}
        print(f"📂 Loaded {len(existing_metadata)} existing metadata entries")
    
    # Determine which images to process
    if incremental:
        images_to_process = [img for img in all_images if img not in existing_metadata]
        if not images_to_process:
            print("✓ All images already have metadata. Nothing to process.")
            return
        print(f"🔍 Found {len(images_to_process)} new images to process")
    else:
        images_to_process = all_images
        # Create backup before full regeneration
        if existing_metadata or os.path.exists('images-metadata.json'):
            create_backup()
    
    if sample_size:
        images_to_process = images_to_process[:sample_size]
        print(f"Processing sample of {sample_size} images...")
    
    # Load BLIP model if available
    processor, model = load_blip_model()
    use_blip = processor is not None and model is not None
    
    print(f"\n{'Incremental' if incremental else 'Full'} processing with:")
    print(f"  ✓ Tesseract OCR")
    print(f"  {'✓' if use_blip else '✗'} BLIP-2 Captioning")
    print()
    
    new_metadata = []
    total = len(images_to_process)
    
    for idx, img_path in enumerate(images_to_process, 1):
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
        
        new_metadata.append({
            "path": img_path,
            "text": searchable_text,
            "ocr": ocr_text,
            "caption": caption,
            "folder": folder,
            "filename": filename
        })
        
        if idx % 10 == 0:
            print(f"Processed {idx}/{total} images...")
    
    # Merge with existing metadata if incremental
    if incremental:
        print(f"\n🔄 Merging {len(new_metadata)} new entries with {len(existing_metadata)} existing entries...")
        # Keep existing entries that are still in images.json
        valid_paths = set(all_images)
        final_metadata = [item for item in existing_metadata.values() if item['path'] in valid_paths]
        final_metadata.extend(new_metadata)
        # Sort by path for consistency
        final_metadata.sort(key=lambda x: x['path'])
    else:
        final_metadata = new_metadata
    
    # Save metadata
    output_file = 'images-metadata.json'
    with open(output_file, 'w') as f:
        json.dump(final_metadata, f, indent=2)
    
    print(f"\n✓ Generated '{output_file}' with {len(final_metadata)} image entries.")
    print(f"  New: {len(new_metadata)}")
    if incremental:
        print(f"  Preserved: {len(existing_metadata)}")
        print(f"  Total: {len(final_metadata)}")
    
    # Show sample
    if new_metadata:
        print(f"\n📋 Sample of newly processed entries:")
        for item in new_metadata[:2]:
            print(f"\n  Path: {item['path']}")
            if item['ocr']:
                print(f"  OCR: {item['ocr'][:80]}...")
            if item['caption']:
                print(f"  Caption: {item['caption']}")
    
    print("\nYou can now use the enhanced search feature in the web app!")

if __name__ == '__main__':
    sample_size = None
    incremental = False
    
    # Parse command line arguments
    if '--help' in sys.argv or '-h' in sys.argv:
        print(__doc__)
        sys.exit(0)
    
    if '--incremental' in sys.argv:
        incremental = True
        print("🔄 Running in INCREMENTAL mode (only new images)")
    else:
        print("🔄 Running in FULL mode (regenerates all, creates backup)")
    
    if '--sample' in sys.argv:
        try:
            idx = sys.argv.index('--sample')
            sample_size = int(sys.argv[idx + 1]) if idx + 1 < len(sys.argv) else 10
        except (ValueError, IndexError):
            sample_size = 10
    
    generate_metadata(sample_size, incremental)
