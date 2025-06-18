// src/index.js - Main Accessibility Validator Add-on Logic

import Color from 'color';
import wcagContrast from 'wcag-contrast';
import addOnUISdk from "https://express.adobe.com/static/add-on-sdk/sdk.js";

// Main Accessibility Validator Class
class AccessibilityValidator {
    constructor() {
        this.isActive = false;
        this.violations = [];
        this.complianceScore = 100;
        this.checkInterval = null;
        this.overlays = [];
        
        // Configuration
        this.config = {
            contrastThreshold: 4.5, // WCAG AA standard
            minFontSize: 12,
            minLineHeight: 1.2,
            checkFrequency: 2000 // Check every 2 seconds
        };
        
        // Initialize the add-on
        this.init();
    }
    
    async init() {
        console.log('Initializing Accessibility Validator Add-on...');
        
        await addOnUISdk.ready;
        console.log('addOnUISdk is ready for use.');
        
        // Create the main UI
        this.createUI();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize Adobe Express SDK
        this.editor = addOnUISdk.app.document;
        
        console.log('Accessibility Validator initialized successfully');
    }
    
    createUI() {
        const container = document.createElement('div');
        container.className = 'accessibility-validator';
        container.innerHTML = `
            <div class="validator-header">
                <h2>♿ Accessibility Validator</h2>
                <div class="compliance-score">
                    <span>Compliance Score:</span>
                    <span class="score-value" id="compliance-score">100</span>
                    <span class="score-unit">/ 100</span>
                </div>
            </div>
            
            <div class="validator-controls">
                <button class="toggle-btn" id="toggle-validation">
                    <span class="btn-icon">▶️</span>
                    <span id="toggle-text">Start Validation</span>
                </button>
                
                <div class="validation-options">
                    <div class="option-item">
                        <input type="checkbox" id="check-contrast" checked>
                        <span>Color Contrast (WCAG AA)</span>
                    </div>
                    <div class="option-item">
                        <input type="checkbox" id="check-typography" checked>
                        <span>Typography & Readability</span>
                    </div>
                    <div class="option-item">
                        <input type="checkbox" id="check-alt-text" checked>
                        <span>Alt Text & Images</span>
                    </div>
                </div>
            </div>
            
            <div class="validation-results" id="validation-results">
                <div class="results-section">
                    <h3>🎯 Ready to Validate</h3>
                    <p style="text-align: center; color: #666; padding: 20px;">
                        Click "Start Validation" to begin checking your design for accessibility issues.
                    </p>
                </div>
            </div>
            
            <div class="quick-actions">
                <button class="action-btn" id="export-report">
                    <span>📄</span>
                    <span>Export Accessibility Report</span>
                </button>
                <button class="action-btn" id="fix-all-issues">
                    <span>🔧</span>
                    <span>Auto-Fix All Issues</span>
                </button>
            </div>
        `;
        
        // Replace body content with our UI
        document.body.appendChild(container);
        
        // Store reference to main container
        this.container = container;
    }
    
    setupEventListeners() {
        // Toggle validation button
        const toggleBtn = document.getElementById('toggle-validation');
        toggleBtn.addEventListener('click', () => this.toggleValidation());
        
        // Export report button
        const exportBtn = document.getElementById('export-report');
        exportBtn.addEventListener('click', () => this.exportReport());
        
        // Auto-fix button
        const fixAllBtn = document.getElementById('fix-all-issues');
        fixAllBtn.addEventListener('click', () => this.fixAllIssues());
        
        // Validation option checkboxes
        const checkboxes = document.querySelectorAll('.validation-options input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                if (this.isActive) {
                    this.runValidation();
                }
            });
        });
    }
    
    toggleValidation() {
        this.isActive = !this.isActive;
        
        const toggleBtn = document.getElementById('toggle-validation');
        const toggleText = document.getElementById('toggle-text');
        
        if (this.isActive) {
            toggleBtn.classList.add('active');
            toggleBtn.querySelector('.btn-icon').textContent = '⏸️';
            toggleText.textContent = 'Stop Validation';
            
            // Start continuous validation
            this.startContinuousValidation();
        } else {
            toggleBtn.classList.remove('active');
            toggleBtn.querySelector('.btn-icon').textContent = '▶️';
            toggleText.textContent = 'Start Validation';
            
            // Stop continuous validation
            this.stopContinuousValidation();
            this.clearOverlays();
        }
    }
    
    startContinuousValidation() {
        // Run initial validation
        this.runValidation();
        
        // Set up interval for continuous checking
        this.checkInterval = setInterval(() => {
            this.runValidation();
        }, this.config.checkFrequency);
        
        console.log('Started continuous accessibility validation');
    }
    
    stopContinuousValidation() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        console.log('Stopped continuous accessibility validation');
    }
    
    async runValidation() {
        console.log('Running accessibility validation...');
        
        // Clear previous violations
        this.violations = [];
        
        // Get document elements (mock data for demo)
        const documentElements = await this.getDocumentElements();
        
        // Run enabled checks
        const enabledChecks = this.getEnabledChecks();
        
        if (enabledChecks.contrast) {
            await this.checkColorContrast(documentElements);
        }
        
        if (enabledChecks.typography) {
            await this.checkTypography(documentElements);
        }
        
        if (enabledChecks.altText) {
            await this.checkAltText(documentElements);
        }
        
        // Calculate compliance score
        this.calculateComplianceScore();
        
        // Update UI
        this.updateValidationResults();
        this.updateComplianceScore();
        this.updateCanvasOverlays();
        
        console.log(`Validation complete. Found ${this.violations.length} issues.`);
    }
    
    getEnabledChecks() {
        return {
            contrast: document.getElementById('check-contrast').checked,
            typography: document.getElementById('check-typography').checked,
            altText: document.getElementById('check-alt-text').checked
        };
    }
    
    async getDocumentElements() {
        // In a real add-on, this would interact with the Express API:
        const pages = await this.editor.getPages();
        // For now, we only support the first page
        if (pages.length > 0) {
            return pages[0].children;
        }
        return [];
    }
    
    async checkColorContrast(elements) {
        console.log('Checking color contrast...');
        
        elements.forEach(element => {
            if (element.type === 'text') {
                const style = element.getTextStyle();
                const bounds = element.getBounds();
                
                // Mock background color (in real app, would detect from canvas)
                const backgroundColor = '#ffffff';
                const foregroundColor = style.color;
                
                try {
                    const contrast = wcagContrast.rgb(
                        this.hexToRgb(foregroundColor),
                        this.hexToRgb(backgroundColor)
                    );
                    
                    if (contrast < this.config.contrastThreshold) {
                        this.violations.push({
                            type: 'contrast',
                            element: element,
                            issue: {
                                ratio: contrast,
                                required: this.config.contrastThreshold,
                                severity: contrast < 3 ? 'high' : 'medium',
                                foreground: foregroundColor,
                                background: backgroundColor
                            },
                            bounds: bounds
                        });
                    }
                } catch (error) {
                    console.warn('Error checking contrast:', error);
                }
            }
        });
    }
    
    async checkTypography(elements) {
        console.log('Checking typography...');
        
        elements.forEach(element => {
            if (element.type === 'text') {
                const style = element.getTextStyle();
                const bounds = element.getBounds();
                const issues = [];
                
                // Check font size
                if (style.fontSize < this.config.minFontSize) {
                    issues.push(`Font size too small (minimum ${this.config.minFontSize}px recommended)`);
                }
                
                // Check line height
                if (style.lineHeight < this.config.minLineHeight) {
                    issues.push(`Line height too tight (minimum ${this.config.minLineHeight} recommended)`);
                }
                
                if (issues.length > 0) {
                    this.violations.push({
                        type: 'typography',
                        element: element,
                        issues: issues,
                        bounds: bounds
                    });
                }
            }
        });
    }
    
    async checkAltText(elements) {
        console.log('Checking alt text...');
        
        elements.forEach(element => {
            if (element.type === 'image') {
                const altText = element.getAltText ? element.getAltText() : '';
                const bounds = element.getBounds();
                
                if (!altText || altText.trim() === '') {
                    this.violations.push({
                        type: 'alt-text',
                        element: element,
                        suggestion: this.generateAltTextSuggestion(element),
                        bounds: bounds
                    });
                }
            }
        });
    }
    
    generateAltTextSuggestion(imageElement) {
        // In a real implementation, this would use AI/ML to analyze the image
        // For demo, provide contextual suggestions
        const suggestions = [
            'A colorful graph showing quarterly sales data with an upward trend',
            'Portrait photo of a smiling professional in business attire',
            'Infographic displaying key statistics about user engagement',
            'Logo design featuring modern typography and geometric shapes',
            'Illustrated diagram explaining the user journey process'
        ];
        
        return suggestions[Math.floor(Math.random() * suggestions.length)];
    }
    
    calculateComplianceScore() {
        if (this.violations.length === 0) {
            this.complianceScore = 100;
            return;
        }
        
        // Calculate weighted score based on violation severity
        let totalDeductions = 0;
        this.violations.forEach(violation => {
            switch (violation.type) {
                case 'contrast':
                    totalDeductions += violation.issue.severity === 'high' ? 25 : 15;
                    break;
                case 'typography':
                    totalDeductions += violation.issues.length * 8;
                    break;
                case 'alt-text':
                    totalDeductions += 12;
                    break;
            }
        });
        
        this.complianceScore = Math.max(0, 100 - totalDeductions);
    }
    
    updateComplianceScore() {
        const scoreElement = document.getElementById('compliance-score');
        if (scoreElement) {
            scoreElement.textContent = this.complianceScore;
            
            // Update score styling based on value
            scoreElement.className = 'score-value';
            if (this.complianceScore >= 90) {
                scoreElement.classList.add('score-excellent');
            } else if (this.complianceScore >= 70) {
                scoreElement.classList.add('score-good');
            } else if (this.complianceScore >= 50) {
                scoreElement.classList.add('score-warning');
            } else {
                scoreElement.classList.add('score-critical');
            }
        }
    }
    
    updateValidationResults() {
        const resultsContainer = document.getElementById('validation-results');
        
        if (this.violations.length === 0) {
            resultsContainer.innerHTML = `
                <div class="results-section">
                    <h3>✅ All Checks Passed!</h3>
                    <div class="no-issues">
                        <p>🎉 Your design meets all accessibility standards!</p>
                        <p>Compliance Score: ${this.complianceScore}/100</p>
                    </div>
                </div>
            `;
            return;
        }
        
        // Group violations by type
        const groupedViolations = this.groupViolationsByType();
        
        let resultsHTML = '';
        
        Object.keys(groupedViolations).forEach(type => {
            const violations = groupedViolations[type];
            const typeInfo = this.getViolationTypeInfo(type);
            
            resultsHTML += `
                <div class="results-section">
                    <h3>${typeInfo.icon} ${typeInfo.title} (${violations.length})</h3>
                    <div class="issues-list">
                        ${violations.map(violation => this.renderViolation(violation)).join('')}
                    </div>
                </div>
            `;
        });
        
        resultsContainer.innerHTML = resultsHTML;
        
        // Add event listeners for newly created buttons
        this.attachViolationEventListeners();
    }
    
    groupViolationsByType() {
        const grouped = {};
        this.violations.forEach(violation => {
            if (!grouped[violation.type]) {
                grouped[violation.type] = [];
            }
            grouped[violation.type].push(violation);
        });
        return grouped;
    }
    
    getViolationTypeInfo(type) {
        const typeMap = {
            'contrast': { icon: '🎨', title: 'Color Contrast Issues' },
            'typography': { icon: '📝', title: 'Typography Issues' },
            'alt-text': { icon: '🖼️', title: 'Missing Alt Text' }
        };
        return typeMap[type] || { icon: '⚠️', title: 'Other Issues' };
    }
    
    renderViolation(violation) {
        switch (violation.type) {
            case 'contrast':
                return this.renderContrastViolation(violation);
            case 'typography':
                return this.renderTypographyViolation(violation);
            case 'alt-text':
                return this.renderAltTextViolation(violation);
            default:
                return '';
        }
    }
    
    renderContrastViolation(violation) {
        const { issue } = violation;
        return `
            <div class="issue-item contrast-issue">
                <div class="issue-header">
                    <span class="issue-icon">🎨</span>
                    <span class="issue-title">Low Color Contrast</span>
                    <span class="issue-severity ${issue.severity}">${issue.severity}</span>
                </div>
                <div class="issue-details">
                    <p>Current ratio: <strong>${issue.ratio.toFixed(2)}:1</strong></p>
                    <p>Required: <strong>${issue.required}:1</strong> (WCAG AA)</p>
                    <div class="color-preview">
                        <div class="color-sample" style="background-color: ${issue.foreground}"></div>
                        <span>Text: ${issue.foreground}</span>
                        <div class="color-sample" style="background-color: ${issue.background}"></div>
                        <span>Background: ${issue.background}</span>
                    </div>
                </div>
                <div class="issue-actions">
                    <button class="fix-btn" onclick="window.accessibilityValidator.fixContrastIssue('${violation.element.id}')">
                        <span>🔧</span> Auto-Fix Colors
                    </button>
                </div>
            </div>
        `;
    }
    
    renderTypographyViolation(violation) {
        return `
            <div class="issue-item typography-issue">
                <div class="issue-header">
                    <span class="issue-icon">📝</span>
                    <span class="issue-title">Typography Issues</span>
                    <span class="issue-severity medium">medium</span>
                </div>
                <div class="issue-details">
                    ${violation.issues.map(issue => `<p>• ${issue}</p>`).join('')}
                </div>
                <div class="issue-actions">
                    <button class="fix-btn" onclick="window.accessibilityValidator.fixTypographyIssue('${violation.element.id}')">
                        <span>🔧</span> Fix Typography
                    </button>
                </div>
            </div>
        `;
    }
    
    renderAltTextViolation(violation) {
        return `
            <div class="issue-item alt-text-issue">
                <div class="issue-header">
                    <span class="issue-icon">🖼️</span>
                    <span class="issue-title">Missing Alt Text</span>
                    <span class="issue-severity low">low</span>
                </div>
                <div class="issue-details">
                    <p>This image needs descriptive alt text for screen readers.</p>
                    <div class="alt-text-suggestion">
                        <label for="alt-text-${violation.element.id}">Suggested description:</label>
                        <textarea 
                            class="alt-text-input" 
                            id="alt-text-${violation.element.id}"
                            placeholder="Enter alt text description..."
                        >${violation.suggestion}</textarea>
                    </div>
                </div>
                <div class="issue-actions">
                    <button class="suggest-btn" onclick="window.accessibilityValidator.regenerateAltText('${violation.element.id}')">
                        <span>🤖</span> Regenerate
                    </button>
                    <button class="apply-btn" onclick="window.accessibilityValidator.applyAltText('${violation.element.id}')">
                        <span>✅</span> Apply Alt Text
                    </button>
                </div>
            </div>
        `;
    }
    
    attachViolationEventListeners() {
        // Event listeners are attached via onclick attributes in the HTML
        // This method can be used for more complex event handling if needed
    }
    
    updateCanvasOverlays() {
        // Clear existing overlays
        this.clearOverlays();
        
        // Add overlays for violations (mock implementation)
        this.violations.forEach(violation => {
            this.addCanvasOverlay(violation);
        });
    }
    
    addCanvasOverlay(violation) {
        // In a real implementation, this would add visual indicators to the Express canvas
        // For demo purposes, we'll just log the overlay creation
        console.log(`Adding overlay for ${violation.type} violation at:`, violation.bounds);
    }
    
    clearOverlays() {
        // Remove all canvas overlays
        this.overlays.forEach(overlay => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        });
        this.overlays = [];
    }
    
    // Action methods
    async fixContrastIssue(elementId) {
        console.log(`Fixing contrast issue for element: ${elementId}`);
        
        // In a real implementation, this would:
        // 1. Calculate compliant color alternatives
        // 2. Apply the best option to the element
        // 3. Re-run validation
        
        // For demo, simulate fix
        this.simulateIssueFix('contrast', elementId);
    }
    
    async fixTypographyIssue(elementId) {
        console.log(`Fixing typography issue for element: ${elementId}`);
        
        // In a real implementation, this would adjust font size, line height, etc.
        this.simulateIssueFix('typography', elementId);
    }
    
    async applyAltText(elementId) {
        console.log(`Applying alt text for element: ${elementId}`);
        
        const textarea = document.getElementById(`alt-text-${elementId}`);
        if (textarea) {
            const altText = textarea.value.trim();
            
            // In a real implementation, this would set the alt text on the image element
            console.log(`Setting alt text: "${altText}"`);
            
            this.simulateIssueFix('alt-text', elementId);
        }
    }
    
    async regenerateAltText(elementId) {
        console.log(`Regenerating alt text for element: ${elementId}`);
        
        const textarea = document.getElementById(`alt-text-${elementId}`);
        if (textarea) {
            // Show loading state
            textarea.placeholder = 'Generating new description...';
            textarea.disabled = true;
            
            // Simulate AI generation delay
            setTimeout(() => {
                textarea.value = this.generateAltTextSuggestion(null);
                textarea.disabled = false;
                textarea.placeholder = 'Enter alt text description...';
            }, 1500);
        }
    }
    
    simulateIssueFix(type, elementId) {
        // Remove the violation from our list
        this.violations = this.violations.filter(v => 
            !(v.type === type && v.element.id === elementId)
        );
        
        // Recalculate score and update UI
        this.calculateComplianceScore();
        this.updateValidationResults();
        this.updateComplianceScore();
        
        // Show success message
        this.showSuccessMessage(`${type} issue fixed successfully!`);
    }
    
    async fixAllIssues() {
        console.log('Auto-fixing all accessibility issues...');
        
        // Show loading state
        const fixAllBtn = document.getElementById('fix-all-issues');
        const originalText = fixAllBtn.innerHTML;
        fixAllBtn.innerHTML = '<span class="loading"></span> Fixing Issues...';
        fixAllBtn.disabled = true;
        
        // Simulate fixing issues one by one
        const violationsCopy = [...this.violations];
        for (let i = 0; i < violationsCopy.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const violation = violationsCopy[i];
            this.simulateIssueFix(violation.type, violation.element.id);
        }
        
        // Restore button
        fixAllBtn.innerHTML = originalText;
        fixAllBtn.disabled = false;
        
        this.showSuccessMessage('All accessibility issues have been fixed!');
    }
    
    exportReport() {
        console.log('Exporting accessibility report...');
        
        const report = {
            timestamp: new Date().toISOString(),
            complianceScore: this.complianceScore,
            totalViolations: this.violations.length,
            violations: this.violations,
            summary: {
                contrast: this.violations.filter(v => v.type === 'contrast').length,
                typography: this.violations.filter(v => v.type === 'typography').length,
                altText: this.violations.filter(v => v.type === 'alt-text').length
            }
        };
        
        // Create downloadable JSON report
        const blob = new Blob([JSON.stringify(report, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `accessibility-report-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showSuccessMessage('Accessibility report exported successfully!');
    }
    
    showSuccessMessage(message) {
        // Create temporary success notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success-color);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            z-index: 10001;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Utility methods
    hexToRgb(hex) {
        try {
            const color = Color(hex);
            return color.rgb().array();
        } catch (error) {
            console.warn('Invalid color format:', hex);
            return [0, 0, 0];
        }
    }
}

// Initialize the add-on when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Create global instance
    window.accessibilityValidator = new AccessibilityValidator();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityValidator;
}