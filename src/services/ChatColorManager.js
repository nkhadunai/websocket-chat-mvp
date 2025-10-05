// src/services/ChatColorManager.js
const crypto = require('crypto');

/**
 * Manages color generation for chat usernames
 */
class ChatColorManager {
    /**
     * Generates a consistent color for a username using MD5 hash
     * @param {string} username - Username to generate color for
     * @returns {string} RGB color string
     */
    static generateUserColor(username) {
        // Create hash of username
        const hash = crypto.createHash('md5').update(username).digest('hex');

        // Convert first 6 characters to RGB
        const r = parseInt(hash.substr(0, 2), 16);
        const g = parseInt(hash.substr(2, 2), 16);
        const b = parseInt(hash.substr(4, 2), 16);

        // Ensure minimum brightness for readability
        const adjustedR = Math.max(r, 100);
        const adjustedG = Math.max(g, 100);
        const adjustedB = Math.max(b, 100);

        return `rgb(${adjustedR}, ${adjustedG}, ${adjustedB})`;
    }

    /**
     * Alternative: HSL for better color control
     * Provides more vibrant and consistent colors
     * @param {string} username - Username to generate color for
     * @returns {string} HSL color string
     */
    static generateUserColorHSL(username) {
        const hash = crypto.createHash('md5').update(username).digest('hex');
        const hashInt = parseInt(hash.substr(0, 8), 16);

        const hue = hashInt % 360;
        const saturation = 65 + (hashInt % 20); // 65-85%
        const lightness = 45 + (hashInt % 15);  // 45-60%

        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
}

module.exports = ChatColorManager;