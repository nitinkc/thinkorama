# OCR Search Setup Guide

This guide walks through setting up the OCR-powered search feature for the Thinkorama image gallery.

## Prerequisites

### 1. Install Tesseract OCR

**macOS:**
```bash
brew install tesseract
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr
```

**Windows:**
Download and install from: https://github.com/UB-Mannheim/tesseract/wiki

Verify installation:
```bash
tesseract --version
```

### 2. Install Python Dependencies

```bash
pip install -r requirements.txt
```

Or manually:
```bash
pip install pytesseract Pillow
```

## Usage

### Initial Setup

1. **Generate image list** (always run this first):
   ```bash
   python gen_images_json.py
   ```
   This creates `images.json` with paths to all images.

2. **Generate OCR metadata** (enables search):
   ```bash
   python gen_images_metadata.py
   ```
   This creates `images-metadata.json` with extracted text from all images.
   
   ⚠️ **Note**: This can take several minutes depending on the number of images.

### When Adding New Images

After adding new images to the `images/` folder:

```bash
# 1. Update image list
python gen_images_json.py

# 2. Regenerate search metadata
python gen_images_metadata.py
```

### Testing Locally

Serve the site with a static server:
```bash
python -m http.server 8000
```

Then open: http://localhost:8000

## How the Search Works

1. **OCR Processing**: `gen_images_metadata.py` uses Tesseract to extract text from each image
2. **Metadata Storage**: Extracted text is stored in `images-metadata.json` alongside image paths
3. **Client-Side Search**: The Vue app loads the metadata and filters images in real-time
4. **Search Targets**: 
   - Extracted OCR text from images
   - Filenames
   - Folder/category names

## File Structure

```
images-metadata.json:
[
  {
    "path": "books/book1.jpg",
    "text": "Thinking Fast and Slow Daniel Kahneman",
    "folder": "books",
    "filename": "book1.jpg"
  },
  ...
]
```

## Troubleshooting

### "tesseract not found"
- Ensure Tesseract is installed and in your PATH
- On macOS, you may need to restart your terminal after `brew install`

### "No module named 'pytesseract'"
- Install Python dependencies: `pip install -r requirements.txt`

### Search not appearing
- Check browser console for errors loading `images-metadata.json`
- Ensure you've run `gen_images_metadata.py` at least once
- The search bar only appears when metadata is successfully loaded

### Poor OCR quality
- Tesseract works best with clear, high-contrast text
- Consider preprocessing images (increasing contrast, removing noise)
- Some images (artistic, low-resolution) may not yield good OCR results

## Advanced: Improving OCR Quality

If OCR results are poor, you can modify `gen_images_metadata.py` to:

1. Preprocess images (grayscale, threshold, denoise)
2. Use different Tesseract PSM modes
3. Add language support: `pytesseract.image_to_string(img, lang='eng+spa')`

Example preprocessing:
```python
from PIL import ImageEnhance, ImageFilter

# In gen_images_metadata.py, before OCR:
img = img.convert('L')  # Grayscale
img = ImageEnhance.Contrast(img).enhance(2)  # Increase contrast
text = pytesseract.image_to_string(img, config='--psm 6')
```

## Deployment

When deploying to GitHub Pages or similar:

1. Generate metadata locally: `python gen_images_metadata.py`
2. Commit `images-metadata.json` to your repository
3. Deploy as normal (no server-side processing needed)

The search runs entirely client-side, so hosting requirements remain minimal.
