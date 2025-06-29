// Adobe Express Add-on SDK integration
import AccessibilityAIAdvisor from './ai-advisor.js';

let editor = null;
let isAdobeExpressEnvironment = false;
let aiAdvisor = null;

// Initialize AI Advisor if API key is available
async function initializeAI() {
    try {
        const { config } = await import('./config.js').catch(() => ({ config: null }));
        if (config && config.TOGETHER_API_KEY && config.TOGETHER_API_KEY !== 'your-together-api-key-here') {
            aiAdvisor = new AccessibilityAIAdvisor(config.TOGETHER_API_KEY, config);
            console.log('🤖 AI-powered accessibility advice enabled (Free tier: 2 calls/min)');
        } else {
            console.log('💡 AI advice disabled. Create src/config.js with your Together AI API key to enable AI recommendations.');
        }
    } catch (error) {
        console.log('💡 AI advice disabled. Create src/config.js with your Together AI API key to enable AI recommendations.');
    }
}

// Initialize AI when the module loads
initializeAI();

// Initialize Adobe Express SDK
async function initializeSDK() {
    try {
        // Check if AddOnSDK is available globally (in Adobe Express environment)
        if (typeof window !== 'undefined' && window.AddOnSDK) {
            await window.AddOnSDK.ready;
            isAdobeExpressEnvironment = true;
            editor = window.AddOnSDK.app;
            console.log("Adobe Express SDK initialized successfully");
        } else {
            throw new Error("AddOnSDK not available");
        }
    } catch (error) {
        console.warn("Adobe Express SDK not available, falling back to mock:", error);
        // Fallback for demo/development
        const { editor: mockEditor } = await import('./mock-sdk.js');
        editor = mockEditor;
    }
    
    // Initialize the validator after SDK is ready
    const validator = new AccessibilityValidator();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSDK);
} else {
    initializeSDK();
}

class AccessibilityValidator {
    constructor() {
        this.isAdobeExpressEnvironment = isAdobeExpressEnvironment;
        this.initialize();
    }

    async initialize() {
        this.setupEventListeners();
        if (this.isAdobeExpressEnvironment) {
            await this.waitForEditor();
        }
        this.updateUI();
    }

    async waitForEditor() {
        return new Promise((resolve) => {
            if (editor && editor.ready) {
                resolve();
            } else if (editor) {
                editor.on("ready", resolve);
            } else {
                // Fallback timeout
                setTimeout(resolve, 1000);
            }
        });
    }

    updateUI() {
        const statusEl = document.getElementById('scanStatus');
        if (this.isAdobeExpressEnvironment) {
            statusEl.textContent = '✅ Connected to Adobe Express - Ready to scan';
            statusEl.className = 'status';
        } else {
            statusEl.textContent = '🔧 Demo mode - Using sample data';
            statusEl.className = 'status';
        }
    }

    setupEventListeners() {
        const scanBtn = document.getElementById('scanBtn');
        const exportBtn = document.getElementById('exportBtn');
        const statusEl = document.getElementById('scanStatus');
        
        scanBtn.addEventListener('click', async () => {
            scanBtn.disabled = true;
            statusEl.textContent = 'Scanning canvas...';
            statusEl.className = 'status scanning';
            
            try {
                await this.scanCanvas();
                statusEl.textContent = 'Scan completed';
                statusEl.className = 'status';
                exportBtn.disabled = false;
            } catch (error) {
                console.error('Scan failed:', error);
                statusEl.textContent = 'Scan failed';
                statusEl.className = 'status error';
            } finally {
                scanBtn.disabled = false;
            }
        });

        exportBtn.addEventListener('click', () => {
            this.exportReport();
        });
        
        // Initially disable export until scan is done
        exportBtn.disabled = true;
    }

    async scanCanvas() {
        try {
            let document;
            
            if (this.isAdobeExpressEnvironment) {
                // Real Adobe Express environment
                document = editor.document;
                if (!document) {
                    throw new Error('No Adobe Express document available');
                }
            } else {
                // Demo environment
                document = editor.context.document;
            }

            const validationResults = await this.validateDocument(document);
            await this.displayResults(validationResults);
            
        } catch (error) {
            console.error('Error scanning canvas:', error);
            this.displayError(error.message);
        }
    }

    async validateDocument(document) {
        const issues = [];
        let totalElements = 0;
        
        try {
            if (this.isAdobeExpressEnvironment) {
                // Real Adobe Express API
                const pages = document.pages;
                
                for (const page of pages) {
                    const children = page.children;
                    const elements = await this.getAllElements({ children });
                    totalElements += elements.length;
                    
                    for (const element of elements) {
                        const elementIssues = await this.validateElement(element);
                        issues.push(...elementIssues);
                    }
                }
            } else {
                // Demo/mock environment
                const pages = await document.pages;
                
                for (const page of pages) {
                    const artboards = await page.artboards;
                    
                    for (const artboard of artboards) {
                        const elements = await this.getAllElements(artboard);
                        totalElements += elements.length;
                        
                        for (const element of elements) {
                            const elementIssues = await this.validateElement(element);
                            issues.push(...elementIssues);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error validating document:', error);
            issues.push({
                type: 'error',
                title: 'Document Validation Error',
                description: 'Unable to fully validate document: ' + error.message,
                suggestion: 'Try scanning again or check if the document is properly loaded.'
            });
        }

        return {
            issues,
            totalElements,
            score: this.calculateAccessibilityScore(issues, totalElements)
        };
    }

    async getAllElements(container) {
        const elements = [];
        
        try {
            const children = await container.children;
            
            for (const child of children) {
                elements.push(child);
                
                if (child.children) {
                    const childElements = await this.getAllElements(child);
                    elements.push(...childElements);
                }
            }
        } catch (error) {
            console.warn('Error getting elements:', error);
        }
        
        return elements;
    }

    async validateElement(element) {
        const issues = [];
        
        try {
            const colorContrastIssues = await this.checkColorContrast(element);
            issues.push(...colorContrastIssues);
            
            const textIssues = await this.checkTextReadability(element);
            issues.push(...textIssues);
            
            const structuralIssues = await this.checkStructuralElements(element);
            issues.push(...structuralIssues);
            
            const interactiveIssues = await this.checkInteractiveElements(element);
            issues.push(...interactiveIssues);
            
        } catch (error) {
            console.warn('Error validating element:', error);
        }
        
        return issues;
    }

    async checkColorContrast(element) {
        const issues = [];
        
        try {
            if (element.type === 'text') {
                const fill = await element.fill;
                const stroke = await element.stroke;
                
                if (fill && fill.type === 'solid') {
                    const textColor = fill.color;
                    const bgColor = await this.getBackgroundColor(element);
                    
                    if (bgColor) {
                        const contrast = this.calculateContrastRatio(textColor, bgColor);
                        const fontSize = await element.fontSize || 12;
                        
                        const isLargeText = fontSize >= 18 || (fontSize >= 14 && await element.fontWeight >= 700);
                        const minContrast = isLargeText ? 3.0 : 4.5;
                        
                        if (contrast < minContrast) {
                            issues.push({
                                type: 'error',
                                title: 'Low Color Contrast',
                                description: `Text has ${contrast.toFixed(2)}:1 contrast ratio, but needs ${minContrast}:1 for WCAG AA compliance.`,
                                suggestion: `Increase contrast by darkening text or lightening background. Current: ${this.colorToHex(textColor)} on ${this.colorToHex(bgColor)}`
                            });
                        } else if (contrast < 7.0) {
                            issues.push({
                                type: 'warning',
                                title: 'Consider Higher Contrast',
                                description: `Text meets AA standards (${contrast.toFixed(2)}:1) but falls short of AAA standards (7:1).`,
                                suggestion: 'For better accessibility, consider increasing contrast for AAA compliance.'
                            });
                        }
                    }
                }
            }
        } catch (error) {
            console.warn('Error checking color contrast:', error);
        }
        
        return issues;
    }

    async checkTextReadability(element) {
        const issues = [];
        
        try {
            if (element.type === 'text') {
                const text = await element.text || '';
                const fontSize = await element.fontSize || 12;
                
                if (fontSize < 12) {
                    issues.push({
                        type: 'error',
                        title: 'Text Too Small',
                        description: `Font size is ${fontSize}px, which may be difficult to read.`,
                        suggestion: 'Use at least 12px font size for better readability.'
                    });
                }
                
                if (text.length > 0) {
                    const wordCount = text.split(/\s+/).length;
                    const avgWordsPerLine = this.estimateWordsPerLine(text, fontSize);
                    
                    if (avgWordsPerLine > 12) {
                        issues.push({
                            type: 'warning',
                            title: 'Long Text Lines',
                            description: 'Lines may be too long for comfortable reading.',
                            suggestion: 'Consider breaking long text into shorter lines (50-75 characters per line).'
                        });
                    }
                    
                    if (text === text.toUpperCase() && wordCount > 3) {
                        issues.push({
                            type: 'warning',
                            title: 'All Caps Text',
                            description: 'All-caps text can be harder to read.',
                            suggestion: 'Consider using normal case with bold formatting for emphasis.'
                        });
                    }
                }
            }
        } catch (error) {
            console.warn('Error checking text readability:', error);
        }
        
        return issues;
    }

    async checkStructuralElements(element) {
        const issues = [];
        
        try {
            if (element.type === 'group') {
                const children = await element.children;
                if (children && children.length > 10) {
                    issues.push({
                        type: 'info',
                        title: 'Complex Group Structure',
                        description: `Group contains ${children.length} elements.`,
                        suggestion: 'Consider simplifying complex groups for better screen reader navigation.'
                    });
                }
            }
            
            if (element.type === 'shape' || element.type === 'image') {
                const altText = await element.altText;
                if (!altText || altText.trim() === '') {
                    issues.push({
                        type: 'error',
                        title: 'Missing Alt Text',
                        description: `${element.type} element lacks alternative text.`,
                        suggestion: 'Add descriptive alt text for screen readers and assistive technologies.'
                    });
                }
            }
        } catch (error) {
            console.warn('Error checking structural elements:', error);
        }
        
        return issues;
    }

    async checkInteractiveElements(element) {
        const issues = [];
        
        try {
            const isInteractive = await element.isInteractive;
            const text = await element.text || '';
            
            if (isInteractive || text.toLowerCase().includes('click') || text.toLowerCase().includes('button')) {
                if (text.length < 4) {
                    issues.push({
                        type: 'error',
                        title: 'Interactive Element Too Small',
                        description: 'Interactive elements should have descriptive text for screen readers.',
                        suggestion: 'Add clear, descriptive text that explains the action (e.g., "Submit form" instead of "Submit").'
                    });
                }
                
                if (text.toLowerCase() === 'click here' || text.toLowerCase() === 'read more') {
                    issues.push({
                        type: 'warning',
                        title: 'Generic Link Text',
                        description: 'Generic phrases like "click here" don\'t provide context for screen readers.',
                        suggestion: 'Use descriptive text that explains where the link goes or what it does.'
                    });
                }
                
                const fontSize = await element.fontSize || 12;
                if (fontSize < 16) {
                    issues.push({
                        type: 'warning',
                        title: 'Small Interactive Element',
                        description: `Interactive element has ${fontSize}px text, which may be hard to tap on mobile.`,
                        suggestion: 'Use at least 16px font size for interactive elements to meet mobile accessibility guidelines.'
                    });
                }
            }
            
            if (element.type === 'text' && text.length > 100) {
                const wordCount = text.split(/\s+/).length;
                if (wordCount > 25) {
                    issues.push({
                        type: 'info',
                        title: 'Long Text Block',
                        description: `Text contains ${wordCount} words in a single block.`,
                        suggestion: 'Consider breaking long text into shorter paragraphs or using headers to improve readability.'
                    });
                }
            }
        } catch (error) {
            console.warn('Error checking interactive elements:', error);
        }
        
        return issues;
    }

    async getBackgroundColor(element) {
        try {
            const parent = await element.parent;
            if (parent && parent.fill) {
                const fill = await parent.fill;
                if (fill.type === 'solid') {
                    return fill.color;
                }
            }
            return { r: 255, g: 255, b: 255, a: 1 };
        } catch (error) {
            return { r: 255, g: 255, b: 255, a: 1 };
        }
    }

    calculateContrastRatio(color1, color2) {
        const l1 = this.getLuminance(color1);
        const l2 = this.getLuminance(color2);
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
    }

    getLuminance(color) {
        const { r, g, b } = color;
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    colorToHex(color) {
        const { r, g, b } = color;
        return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
    }

    estimateWordsPerLine(text, fontSize) {
        const avgCharWidth = fontSize * 0.6;
        const assumedLineWidth = 300;
        const charsPerLine = assumedLineWidth / avgCharWidth;
        const avgWordsPerLine = charsPerLine / 5;
        return avgWordsPerLine;
    }

    calculateAccessibilityScore(issues, totalElements) {
        if (totalElements === 0) return 100;
        
        let score = 100;
        issues.forEach(issue => {
            switch (issue.type) {
                case 'error':
                    score -= 15;
                    break;
                case 'warning':
                    score -= 5;
                    break;
                case 'info':
                    score -= 2;
                    break;
            }
        });
        
        return Math.max(0, Math.min(100, score));
    }

    async displayResults(results) {
        // Store results for export
        this.lastResults = results;
        
        const resultsContainer = document.getElementById('results');
        const scoreText = document.getElementById('scoreText');
        const scoreCircle = document.getElementById('scoreCircle');
        const wcagLevel = document.getElementById('wcagLevel');
        const issueCount = document.getElementById('issueCount');
        
        scoreText.textContent = results.score;
        issueCount.textContent = results.issues.length;
        
        if (results.score >= 90) {
            wcagLevel.textContent = 'AAA';
            scoreCircle.style.background = `conic-gradient(#4CAF50 ${results.score * 3.6}deg, #eee 0deg)`;
        } else if (results.score >= 70) {
            wcagLevel.textContent = 'AA';
            scoreCircle.style.background = `conic-gradient(#FFA726 ${results.score * 3.6}deg, #eee 0deg)`;
        } else {
            wcagLevel.textContent = 'Needs Work';
            scoreCircle.style.background = `conic-gradient(#FF6B6B ${results.score * 3.6}deg, #eee 0deg)`;
        }
        
        if (results.issues.length === 0) {
            resultsContainer.innerHTML = '<div class="placeholder">🎉 No accessibility issues found!</div>';
        } else {
            // Show initial results with loading state for AI advice
            resultsContainer.innerHTML = results.issues.map(issue => `
                <div class="issue-item ${issue.type}">
                    <div class="issue-title">${issue.title}</div>
                    <div class="issue-description">${issue.description}</div>
                    <div class="issue-suggestion">${issue.suggestion}</div>
                    ${aiAdvisor ? `
                        <div class="ai-advice-section">
                            <div class="ai-advice-loading">🤖 Getting AI recommendations for all issues...</div>
                        </div>
                    ` : ''}
                </div>
            `).join('');
            
            // Get AI advice for each issue if available
            if (aiAdvisor) {
                this.enhanceWithAIAdvice(results.issues);
            }
        }
    }

    async enhanceWithAIAdvice(issues) {
        const issueElements = document.querySelectorAll('.issue-item');
        
        try {
            // Get AI advice for ALL issues in a single batch call (rate limit friendly)
            const aiAdviceList = await aiAdvisor.getBulkAdvice(issues, {
                designTool: 'Adobe Express',
                targetCompliance: 'WCAG 2.1 AA'
            });
            
            // Update UI with AI advice for each issue
            for (let i = 0; i < issues.length; i++) {
                const issue = issues[i];
                const issueElement = issueElements[i];
                const adviceSection = issueElement.querySelector('.ai-advice-section');
                
                if (!adviceSection) continue;
                
                const aiAdvice = aiAdviceList[i];
                
                // Update the UI with AI advice
                adviceSection.innerHTML = `
                    <div class="ai-advice">
                        <div class="ai-advice-header">🤖 AI Recommendation</div>
                        <div class="ai-advice-content">${aiAdvice}</div>
                    </div>
                `;
                
                // Store AI advice for export
                issue.aiAdvice = aiAdvice;
            }
            
        } catch (error) {
            console.error('Failed to get AI advice for issues:', error);
            
            // Show error state for all issues
            issueElements.forEach(issueElement => {
                const adviceSection = issueElement.querySelector('.ai-advice-section');
                if (adviceSection) {
                    adviceSection.innerHTML = `
                        <div class="ai-advice-error">
                            <div class="ai-advice-header">🤖 AI Recommendation</div>
                            <div class="ai-advice-content">AI advice temporarily unavailable. Please try again in 30 seconds.</div>
                        </div>
                    `;
                }
            });
        }
    }

    displayError(message) {
        const resultsContainer = document.getElementById('results');
        resultsContainer.innerHTML = `
            <div class="issue-item error">
                <div class="issue-title">Scan Error</div>
                <div class="issue-description">${message}</div>
                <div class="issue-suggestion">Please try scanning again or check if the document is properly loaded.</div>
            </div>
        `;
    }

    exportReport() {
        if (!this.lastResults) {
            alert('Please run a scan first before exporting.');
            return;
        }

        const report = this.generateReport(this.lastResults);
        const blob = new Blob([report], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `accessibility-report-${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    generateReport(results) {
        const { issues, score, totalElements } = results;
        const timestamp = new Date().toLocaleString();
        
        return `
<!DOCTYPE html>
<html>
<head>
    <title>Accessibility Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #667eea; color: white; padding: 20px; border-radius: 8px; }
        .score { font-size: 24px; font-weight: bold; color: #4CAF50; }
        .issue { border-left: 4px solid #ff6b6b; padding: 15px; margin: 10px 0; background: #f9f9f9; }
        .warning { border-left-color: #ffa726; }
        .info { border-left-color: #42a5f5; }
    </style>
</head>
<body>
    <div class="header">
        <h1>♿ Accessibility Report</h1>
        <p>Generated on ${timestamp}</p>
    </div>
    
    <div style="margin: 20px 0;">
        <h2>Overall Score: <span class="score">${score}/100</span></h2>
        <p><strong>Elements Analyzed:</strong> ${totalElements}</p>
        <p><strong>Issues Found:</strong> ${issues.length}</p>
        <p><strong>WCAG Compliance Level:</strong> ${score >= 90 ? 'AAA' : score >= 70 ? 'AA' : 'Needs Work'}</p>
    </div>
    
    <h2>Issues Detected</h2>
    ${issues.length === 0 ? '<p>🎉 No accessibility issues found!</p>' : 
      issues.map(issue => `
        <div class="issue ${issue.type}">
            <h3>${issue.title}</h3>
            <p><strong>Description:</strong> ${issue.description}</p>
            <p><strong>Suggestion:</strong> ${issue.suggestion}</p>
            ${issue.aiAdvice ? `
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px; border-radius: 8px; margin-top: 12px;">
                    <h4 style="margin: 0 0 8px 0; font-size: 14px;">🤖 AI Recommendation</h4>
                    <p style="margin: 0; font-size: 13px; line-height: 1.5;">${issue.aiAdvice}</p>
                </div>
            ` : ''}
        </div>
      `).join('')}
    
    <footer style="margin-top: 40px; text-align: center; color: #666;">
        Generated by Accessibility Validator for Adobe Express
    </footer>
</body>
</html>`;
    }
}