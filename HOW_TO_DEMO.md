# 🎬 How to Demo the Accessibility Validator Add-on

## Method 1: Load as Local Add-on in Adobe Express (RECOMMENDED FOR HACKATHON)

### Prerequisites
1. **Adobe Express account** - Sign up at [express.adobe.com](https://express.adobe.com)
2. **Enable Developer Mode** in Adobe Express
3. **Local development server** running

### Step-by-Step Demo Instructions

#### 1. Start the Development Server
```bash
cd accessibility-validator
pnpm install
pnpm start
```
This will start your add-on at `http://localhost:5241`

#### 2. Enable Developer Mode in Adobe Express
1. Go to [express.adobe.com](https://express.adobe.com)
2. Open browser Developer Tools (F12)
3. In console, type: `localStorage.setItem('ccx-addons-dev-mode', 'true')`
4. Refresh the page

#### 3. Load Your Local Add-on
1. In Adobe Express, click the "Add-ons" button (➕ icon in left sidebar)
2. Look for "Developer" section at the bottom
3. Click "Load local add-on"
4. Enter the manifest URL: `http://localhost:5241/manifest.json`
5. Click "Load"

#### 4. Demo the Add-on
1. **Create a new Adobe Express project** (any template)
2. **Add some elements** with accessibility issues:
   - Text with poor contrast (light gray on white)
   - Very small text (under 12px)
   - All-caps text
   - Images without alt text
3. **Open your Accessibility Validator** from the add-ons panel
4. **Click "Scan Canvas"** to see real-time validation
5. **Show the results** - issues found, accessibility score, WCAG compliance level

### What to Highlight in Your Demo Video

✅ **Real Adobe Express Integration**: "This is running as a real add-on inside Adobe Express"  
✅ **Live Document Scanning**: "It's analyzing the actual canvas elements in real-time"  
✅ **WCAG Compliance**: "Shows specific WCAG violations with actionable fixes"  
✅ **Professional UI**: "Clean, intuitive interface that fits Adobe's design language"  
✅ **Export Functionality**: "Generate detailed accessibility reports for stakeholders"  
✅ **Multiple Validation Types**: "Color contrast, text readability, interactive elements, alt text"  

---

## Method 2: Standalone Demo (Fallback)

If you have issues with the local add-on loading:

```bash
cd accessibility-validator
pnpm start
# Visit http://localhost:5241/demo.html
```

This shows the same functionality with simulated Adobe Express data.

---

## Troubleshooting

### Add-on Won't Load
- Make sure dev server is running on port 5241
- Check browser console for CORS errors
- Try refreshing Adobe Express after enabling dev mode
- Ensure manifest.json is accessible at `http://localhost:5241/manifest.json`

### No Elements Found
- Make sure you have content in your Adobe Express canvas
- Try adding text, shapes, or images first
- Check browser console for API errors

### CORS Issues
- Add `--host` flag to dev server (already included in package.json)
- Check that localhost:5241 is allowed in manifest permissions

---

## Demo Script for Video

**[0:00-0:30] Introduction**
> "Hi! I'm [Your Name] and I've built an Accessibility Validator add-on for Adobe Express. This tool provides real-time WCAG compliance checking directly in the design canvas."

**[0:30-1:00] Problem Statement**
> "The problem: designers often discover accessibility issues after completing their work, leading to costly redesigns. My solution catches these issues in real-time during the design process."

**[1:00-2:00] Live Demo**
> "Let me show you this running as a real Adobe Express add-on. I'm loading it locally here... [show loading process]... and now I'll create a design with some accessibility issues... [add poor contrast text, small text, etc.]... Now let's scan for issues..."

**[2:00-2:30] Results & Value**
> "As you can see, it found [X] accessibility issues, gave us a compliance score, and provided specific WCAG-compliant fixes. This saves designers hours of rework and ensures inclusive design from the start."

**[2:30-3:00] Production Plan**
> "For production, I plan to [mention your roadmap]. This addresses a real need in the $13B accessibility market and would make Adobe Express the first design tool with real-time accessibility validation."

---

## File Structure Summary

```
accessibility-validator/
├── manifest.json          # Adobe Express add-on manifest
├── index.html            # Main UI panel
├── package.json          # Dependencies and scripts
├── src/
│   ├── index.js         # Main application logic
│   ├── styles.css       # UI styling
│   └── mock-sdk.js      # Demo fallback data
├── demo.html            # Standalone demo page
└── .gitignore           # Git ignore file
```

**You're ready to create an impressive hackathon demo! 🚀**