/**
 * Extracts the userId from a string in the format "G-userId".
 * 
 * @param {string} input - The string containing the userId.
 * @returns {string|null} - The extracted userId or null if invalid format.
 */
function extractUserId(input) {
    if (typeof input !== "string") return null;

    const match = input.match(/^G-(.+)$/);
    return match ? match[1] : null;
}