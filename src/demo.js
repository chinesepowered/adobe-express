// Demo initialization for hackathon
document.addEventListener('DOMContentLoaded', function() {
    // Show demo banner
    document.getElementById('demo-banner').style.display = 'block';
    
    // Hide loading screen after 2 seconds
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transition = 'opacity 0.5s ease-out';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 2000);
    
    // Initialize demo data for hackathon presentation
    setTimeout(() => {
        initializeDemoData();
    }, 2500);
});

function initializeDemoData() {
    // Simulate some accessibility violations for demo
    if (window.accessibilityValidator) {
        // Add mock violations to demonstrate the interface
        window.accessibilityValidator.violations = [
            {
                type: 'contrast',
                element: { id: 'demo-text-1' },
                issue: {
                    ratio: 2.8,
                    required: 4.5,
                    severity: 'high',
                    foreground: '#666666',
                    background: '#ffffff'
                },
                bounds: { x: 100, y: 150, width: 200, height: 40 }
            },
            {
                type: 'typography',
                element: { id: 'demo-text-2' },
                issues: ['Font size too small (minimum 12px recommended)', 'Line height too tight (minimum 1.2 recommended)'],
                bounds: { x: 50, y: 200, width: 300, height: 25 }
            },
            {
                type: 'alt-text',
                element: { id: 'demo-image-1' },
                suggestion: 'A colorful graph showing quarterly sales data with an upward trend',
                bounds: { x: 150, y: 300, width: 250, height: 180 }
            }
        ];
        
        // Update compliance score based on demo violations
        window.accessibilityValidator.complianceScore = 72;
        
        // Update the UI with demo data
        window.accessibilityValidator.updateValidationResults();
        window.accessibilityValidator.updateComplianceScore();
        
        console.log('Demo data initialized for hackathon presentation');
    }
}

// Hackathon demo functions to simulate Adobe Express integration
function simulateExpressIntegration() {
    // Mock Adobe Express SDK responses for demo
    window.mockExpressAPI = {
        getDocument: () => ({
            getPages: () => [
                {
                    getChildren: () => [
                        {
                            type: 'text',
                            id: 'demo-text-1',
                            getText: () => 'Sample headline text',
                            getTextStyle: () => ({
                                fontSize: 16,
                                fontWeight: 'normal',
                                color: '#666666',
                                lineHeight: 1.1
                            }),
                            getBounds: () => ({ x: 100, y: 150, width: 200, height: 40 })
                        },
                        {
                            type: 'text',
                            id: 'demo-text-2',
                            getText: () => 'Small body text that might be hard to read',
                            getTextStyle: () => ({
                                fontSize: 10,
                                fontWeight: 'normal',
                                color: '#333333',
                                lineHeight: 1.0
                            }),
                            getBounds: () => ({ x: 50, y: 200, width: 300, height: 25 })
                        },
                        {
                            type: 'image',
                            id: 'demo-image-1',
                            getAltText: () => '',
                            getBounds: () => ({ x: 150, y: 300, width: 250, height: 180 })
                        }
                    ]
                }
            ]
        })
    };
}

// Initialize demo Express integration
simulateExpressIntegration(); 