// Configuration for Adobe Express Accessibility Validator
// Copy this file to config.js and add your API key

export const config = {
    // Together AI API Key (get yours at https://api.together.xyz/)
    // Replace 'your-together-api-key-here' with your actual API key
    TOGETHER_API_KEY: 'your-together-api-key-here',
    
    // AI Model Configuration
    AI_MODEL: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
    MAX_TOKENS: 4000,
    TEMPERATURE: 0.3,
    MIN_CALL_INTERVAL_MS: 30000, // 30 seconds between calls for free tier
    BATCH_ALL_ISSUES: true
};

// Instructions:
// 1. Sign up at https://api.together.xyz/
// 2. Get your API key from the dashboard
// 3. Copy this file: cp src/config.example.js src/config.js
// 4. Replace 'your-together-api-key-here' with your actual API key
// 5. The add-on will automatically detect and use AI features

// Security Notes:
// - config.js is automatically added to .gitignore
// - Never commit API keys to version control
// - The free tier has 2 API calls per minute limit 