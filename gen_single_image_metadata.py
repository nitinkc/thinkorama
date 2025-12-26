#!/usr/bin/env python3
"""
Single image metadata generator with enhanced OCR preprocessing.
Useful for debugging or improving metadata for specific images.

Usage: python gen_single_image_metadata.py <relative_path_from_images_folder>
Example: python gen_single_image_metadata.py mind/Gj5Xi5ZXkAAL2u_.jpg
"""
import os
import sys
import json
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter
import pytesseract

try:
    from transformers import BlipProcessor, BlipForConditionalGeneration
    BLIP_AVAILABLE = True
except ImportError:
    BLIP_AVAILABLE = False
    print("⚠️  BLIP-2 not available. Install with: pip install transformers torch")

def preprocess_for_ocr(image):
    """Apply multiple preprocessing techniques to improve OCR accuracy"""
    
    # Convert to grayscale
    img_gray = image.convert('L')
    
    # Increase contrast
    enhancer = ImageEnhance.Contrast(img_gray)
    img_contrast = enhancer.enhance(2.0)
    
    # Increase sharpness
    enhancer = ImageEnhance.Sharpness(img_contrast)
    img_sharp = enhancer.enhance(2.0)
    
    # Apply slight blur to reduce noise (helps with noisy images)
    img_denoised = img_sharp.filter(ImageFilter.MedianFilter(size=3))
    
    return img_denoised

def extract_text_advanced(image_path):
    """Extract text using multiple OCR strategies"""
    
    results = {}
    
    try:
        image = Image.open(image_path)
        
        # Strategy 1: Default OCR
        text_default = pytesseract.image_to_string(image)
        results['default'] = ' '.join(text_default.split()).strip()
        
        # Strategy 2: Preprocessed image
        img_processed = preprocess_for_ocr(image)
        text_processed = pytesseract.image_to_string(img_processed)
        results['preprocessed'] = ' '.join(text_processed.split()).strip()
        
        # Strategy 3: PSM 6 (Assume a single uniform block of text)
        text_psm6 = pytesseract.image_to_string(image, config='--psm 6')
        results['psm6'] = ' '.join(text_psm6.split()).strip()
        
        # Strategy 4: PSM 11 (Sparse text, find as much text as possible)
        text_psm11 = pytesseract.image_to_string(image, config='--psm 11')
        results['psm11'] = ' '.join(text_psm11.split()).strip()
        
        # Strategy 5: PSM 3 with preprocessing (Fully automatic page segmentation)
        text_psm3 = pytesseract.image_to_string(img_processed, config='--psm 3')
        results['psm3_preprocessed'] = ' '.join(text_psm3.split()).strip()
        
        # Get the longest/best result
        best_text = max(results.values(), key=len)
        
        return best_text, results
        
    except Exception as e:
        print(f"  Error during OCR: {e}")
        return "", {}

def generate_caption(image_path):
    """Generate BLIP-2 caption"""
    if not BLIP_AVAILABLE:
        return ""
    
    try:
        print("Loading BLIP model...")
        processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
        model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
        
        image = Image.open(image_path).convert('RGB')
        inputs = processor(image, return_tensors="pt")
        
        # Generate with different parameters for more detailed captions
        out = model.generate(**inputs, max_length=100, num_beams=5)
        caption = processor.decode(out[0], skip_special_tokens=True)
        
        print(f"✓ Caption generated: {caption}")
        return caption
        
    except Exception as e:
        print(f"  Warning: Could not generate caption: {e}")
        return ""

def process_single_image(relative_path):
    """Process a single image and show detailed results"""
    
    full_path = os.path.join('images', relative_path)
    
    if not os.path.exists(full_path):
        print(f"❌ Error: Image not found at {full_path}")
        return None
    
    print(f"\n📸 Processing: {relative_path}")
    print("=" * 60)
    
    # Extract path components
    parts = relative_path.split('/')
    folder = parts[0] if len(parts) > 1 else ''
    filename = parts[-1]
    
    print(f"\n📁 Folder: {folder}")
    print(f"📄 Filename: {filename}")
    
    # OCR with multiple strategies
    print(f"\n🔍 Running OCR with multiple strategies...")
    best_text, all_results = extract_text_advanced(full_path)
    
    print(f"\n📝 OCR Results:")
    for strategy, text in all_results.items():
        if text:
            print(f"  {strategy}: {text[:100]}{'...' if len(text) > 100 else ''}")
        else:
            print(f"  {strategy}: (no text found)")
    
    print(f"\n✅ Best OCR result ({len(best_text)} chars): {best_text[:200]}")
    
    # BLIP caption
    print(f"\n🤖 Generating AI caption...")
    caption = generate_caption(full_path)
    
    # Combine all searchable text
    searchable_parts = [folder, filename.replace('.jpg', '').replace('.png', '')]
    if best_text:
        searchable_parts.append(best_text)
    if caption:
        searchable_parts.append(caption)
    
    searchable_text = ' '.join(searchable_parts).strip()
    
    metadata = {
        "path": relative_path,
        "text": searchable_text,
        "ocr": best_text,
        "caption": caption,
        "folder": folder,
        "filename": filename
    }
    
    print(f"\n📊 Final Metadata:")
    print(json.dumps(metadata, indent=2))
    
    # Ask if user wants to update
    print(f"\n" + "=" * 60)
    response = input("\n💾 Update images-metadata.json with this entry? (y/n): ").strip().lower()
    
    if response == 'y':
        # Load existing metadata
        with open('images-metadata.json', 'r') as f:
            all_metadata = json.load(f)
        
        # Find and replace or append
        found = False
        for i, item in enumerate(all_metadata):
            if item['path'] == relative_path:
                all_metadata[i] = metadata
                found = True
                print(f"✅ Updated existing entry for {relative_path}")
                break
        
        if not found:
            all_metadata.append(metadata)
            print(f"✅ Added new entry for {relative_path}")
        
        # Save back
        with open('images-metadata.json', 'w') as f:
            json.dump(all_metadata, f, indent=2)
        
        print(f"💾 Saved to images-metadata.json")
    else:
        print("❌ Skipped updating metadata file")
    
    return metadata

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python gen_single_image_metadata.py <relative_path>")
        print("Example: python gen_single_image_metadata.py mind/Gj5Xi5ZXkAAL2u_.jpg")
        sys.exit(1)
    
    relative_path = sys.argv[1]
    process_single_image(relative_path)
