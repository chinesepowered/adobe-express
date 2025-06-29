// AI-powered accessibility advisor using Together AI Llama 3.3 Free
class AccessibilityAIAdvisor {
    constructor(apiKey, config = {}) {
        this.apiKey = apiKey;
        this.baseURL = 'https://api.together.xyz/v1/chat/completions';
        this.model = config.AI_MODEL || 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free';
        this.maxTokens = config.MAX_TOKENS || 800;
        this.temperature = config.TEMPERATURE || 0.3;
        this.minCallInterval = config.MIN_CALL_INTERVAL_MS || 30000; // 30 seconds
        this.cache = new Map(); // Cache recommendations to avoid repeated API calls
        this.lastCallTime = 0; // Track last API call for rate limiting
    }

    /**
     * Get AI-powered advice for an accessibility issue
     * @param {Object} issue - The accessibility issue object
     * @param {Object} context - Additional context about the design element
     * @returns {Promise<string>} AI recommendation
     */
    async getAdviceForIssue(issue, context = {}) {
        // Create cache key to avoid repeated API calls for similar issues
        const cacheKey = this.createCacheKey(issue, context);
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const prompt = this.createAccessibilityPrompt(issue, context);
            const advice = await this.callTogetherAI(prompt);
            
            // Cache the result
            this.cache.set(cacheKey, advice);
            
            return advice;
        } catch (error) {
            console.error('AI Advisor error:', error);
            return this.getFallbackAdvice(issue);
        }
    }

    /**
     * Create a specialized prompt for accessibility advice
     */
    createAccessibilityPrompt(issue, context) {
        const basePrompt = `You are an expert accessibility consultant specializing in WCAG 2.1 guidelines. 

ACCESSIBILITY ISSUE:
- Type: ${issue.type}
- Title: ${issue.title}
- Description: ${issue.description}
- Current suggestion: ${issue.suggestion || 'None provided'}

DESIGN CONTEXT:
- Element type: ${context.elementType || 'Unknown'}
- Current colors: ${context.colors || 'Not specified'}
- Font size: ${context.fontSize || 'Not specified'}
- Text content: ${context.textContent || 'Not specified'}

Please provide:
1. A clear, actionable recommendation (2-3 sentences)
2. Specific implementation steps
3. Why this matters for users with disabilities
4. WCAG success criteria reference if applicable

Keep the response concise, practical, and focused on the specific issue. Avoid generic advice.`;

        return basePrompt;
    }

    /**
     * Make API call to Together AI
     */
    async callTogetherAI(prompt, maxRetries = 2) {
        let attempt = 0;
        
        while (attempt <= maxRetries) {
            try {
                const response = await fetch(this.baseURL, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: this.model,
                        messages: [
                            {
                                role: 'user',
                                content: prompt
                            }
                        ],
                        max_tokens: this.maxTokens,
                        temperature: this.temperature,
                        top_p: 0.8,
                        stop: ['Human:', 'User:']
                    })
                });

                if (!response.ok) {
                    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                
                if (data.choices && data.choices[0] && data.choices[0].message) {
                    return data.choices[0].message.content.trim();
                } else {
                    throw new Error('Invalid API response format');
                }

            } catch (error) {
                attempt++;
                console.warn(`AI API attempt ${attempt} failed:`, error);
                
                if (attempt <= maxRetries) {
                    // Exponential backoff
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                } else {
                    throw error;
                }
            }
        }
    }

    /**
     * Create cache key for similar issues
     */
    createCacheKey(issue, context) {
        const keyParts = [
            issue.type,
            issue.title,
            context.elementType,
            context.colors,
            context.fontSize
        ].filter(Boolean);
        
        return keyParts.join('|').toLowerCase();
    }

    /**
     * Fallback advice when AI is unavailable
     */
    getFallbackAdvice(issue) {
        const fallbackAdvice = {
            'color-contrast': 'Increase the contrast between text and background colors. Use online contrast checkers to ensure WCAG AA compliance (4.5:1 ratio).',
            'font-size': 'Increase font size to at least 12px for body text. Consider using relative units (em, rem) for better scalability.',
            'alt-text': 'Add descriptive alternative text that conveys the meaning and context of the image. Keep it concise but informative.',
            'text-readability': 'Break up long text blocks, avoid all-caps formatting, and ensure adequate line spacing for better readability.',
            'interactive-elements': 'Ensure interactive elements have clear focus indicators and are large enough for touch interaction (44px minimum).'
        };

        return fallbackAdvice[issue.type] || 'Review WCAG 2.1 guidelines for this accessibility issue and implement recommended best practices.';
    }

    /**
     * Get bulk advice for multiple issues in a single API call (FREE tier optimized)
     */
    async getBulkAdvice(issues, context = {}) {
        if (issues.length === 0) return [];

        // Create cache key for the entire batch
        const batchCacheKey = issues.map(issue => 
            this.createCacheKey(issue, context)
        ).join('||');
        
        if (this.cache.has(batchCacheKey)) {
            return this.cache.get(batchCacheKey);
        }

        try {
            // Check rate limiting
            await this.waitForRateLimit();
            
            const prompt = this.createBatchAccessibilityPrompt(issues, context);
            const response = await this.callTogetherAI(prompt);
            
            // Parse the structured response
            const adviceList = this.parseBatchResponse(response, issues);
            
            // Cache the results
            this.cache.set(batchCacheKey, adviceList);
            
            return adviceList;
            
        } catch (error) {
            console.error('Batch AI Advisor error:', error);
            // Return fallback advice for all issues
            return issues.map(issue => this.getFallbackAdvice(issue));
        }
    }

    /**
     * Create a specialized prompt for batch processing multiple accessibility issues
     */
    createBatchAccessibilityPrompt(issues, context) {
        const issueList = issues.map((issue, index) => `
${index + 1}. ISSUE: ${issue.title}
   Type: ${issue.type}
   Description: ${issue.description}
   Current suggestion: ${issue.suggestion || 'None provided'}
   Context: ${issue.elementType || 'Unknown element'}`
        ).join('\n');

        return `You are an expert accessibility consultant specializing in WCAG 2.1 guidelines. 

I have ${issues.length} accessibility issues from a design that need expert advice. Please provide specific, actionable recommendations for each issue.

ACCESSIBILITY ISSUES:
${issueList}

DESIGN CONTEXT:
- Design tool: Adobe Express
- Target audience: General public
- Compliance goal: WCAG 2.1 AA minimum

Please respond with EXACTLY this format for each issue:

[ISSUE 1]
RECOMMENDATION: [2-3 sentence actionable advice]
IMPLEMENTATION: [Specific steps to fix]
WHY IT MATTERS: [Impact on users with disabilities]
WCAG: [Relevant success criteria if applicable]

[ISSUE 2]
[Continue for all issues...]

Keep each recommendation concise but specific. Focus on practical solutions designers can implement in Adobe Express.`;
    }

    /**
     * Parse the structured batch response from AI
     */
    parseBatchResponse(response, issues) {
        const adviceList = [];
        
        try {
            // Split response by issue markers
            const issueBlocks = response.split(/\[ISSUE \d+\]/);
            
            // Skip the first empty block and process the rest
            for (let i = 1; i < issueBlocks.length && i - 1 < issues.length; i++) {
                const block = issueBlocks[i].trim();
                
                // Extract sections
                const recommendation = this.extractSection(block, 'RECOMMENDATION:');
                const implementation = this.extractSection(block, 'IMPLEMENTATION:');
                const whyItMatters = this.extractSection(block, 'WHY IT MATTERS:');
                const wcag = this.extractSection(block, 'WCAG:');
                
                // Combine into advice
                let advice = recommendation;
                if (implementation) advice += ` Implementation: ${implementation}`;
                if (whyItMatters) advice += ` This matters because: ${whyItMatters}`;
                if (wcag) advice += ` (${wcag})`;
                
                adviceList.push(advice || this.getFallbackAdvice(issues[i - 1]));
            }
            
            // Fill in any missing advice with fallbacks
            while (adviceList.length < issues.length) {
                adviceList.push(this.getFallbackAdvice(issues[adviceList.length]));
            }
            
        } catch (error) {
            console.error('Error parsing batch response:', error);
            // Return fallback advice for all issues
            return issues.map(issue => this.getFallbackAdvice(issue));
        }
        
        return adviceList;
    }

    /**
     * Extract a section from the AI response
     */
    extractSection(text, sectionName) {
        const sectionStart = text.indexOf(sectionName);
        if (sectionStart === -1) return '';
        
        const contentStart = sectionStart + sectionName.length;
        const nextSectionStart = text.indexOf('\n', contentStart);
        const sectionEnd = nextSectionStart === -1 ? text.length : nextSectionStart;
        
        return text.substring(contentStart, sectionEnd).trim();
    }

    /**
     * Wait for rate limit before making API call
     */
    async waitForRateLimit() {
        const timeSinceLastCall = Date.now() - this.lastCallTime;
        const timeToWait = this.minCallInterval - timeSinceLastCall;
        
        if (timeToWait > 0) {
            console.log(`⏳ Rate limiting: waiting ${Math.ceil(timeToWait / 1000)}s before AI call...`);
            await new Promise(resolve => setTimeout(resolve, timeToWait));
        }
        
        this.lastCallTime = Date.now();
    }

    /**
     * Clear the advice cache
     */
    clearCache() {
        this.cache.clear();
    }
}

// Export for use in main application
export default AccessibilityAIAdvisor; 