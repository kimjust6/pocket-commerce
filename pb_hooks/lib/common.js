/**
 * @file Common utility functions and constants for PocketBase hooks.
 * @module common
 */

/**
 * PocketBase Table Name Constants.
 * Use these to avoid hardcoding table names throughout the codebase.
 * @constant {Object<string, string>}
 * @property {string} USERS - The users table
 */
const TABLES = {
    USERS: 'users'
};

module.exports = {
    // Export constants
    TABLES,

    /**
     * Format a date string or Date object to a human-readable format.
     * @param {string|Date|null} date - The date to format
     * @returns {string} Formatted date string (e.g., "Jan 01, 2024") or '-' if invalid
     * @example
     * formatDateTime('2024-01-15') // "Jan 15, 2024"
     * formatDateTime(new Date()) // "Feb 05, 2026"
     * formatDateTime(null) // "-"
     */
    formatDateTime: function (date) {
        if (!date) return '-'
        const d = new Date(date)
        if (isNaN(d.getTime())) return '-'
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const month = months[d.getMonth()]
        const day = d.getDate().toString().padStart(2, '0')
        const year = d.getFullYear()
        return `${month} ${day}, ${year}`
    },

    /**
     * Helper to get param from various context locations
     * @param {object} context - The pb_hooks context object
     * @param {string} key - The parameter key
     * @returns {string|null} The parameter value or null
     */
    getParam: function (context, key) {
        if (context.params && context.params[key]) return context.params[key]
        if (context.query && context.query[key]) return context.query[key]
        if (typeof context.queryParam === 'function') return context.queryParam(key)
        return null
    },

    /**
     * Helper to safely extract form data from a PocketBase context.
     * Handles both multipart/form-data and JSON bodies (if parsed).
     * @param {object} context - The pb_hooks context object (request/response)
     * @returns {object} Simple key-value object of the form data
     */
    parseFormData: function (context) {
        let data = {}
        try {
            // Try built-in Context.formData() first (multipart/form-data)
            if (typeof context.formData === 'function') {
                const fd = context.formData()
                return fd
            }

            // Fallback to body() for JSON payloads
            if (typeof context.body === 'function') {
                const body = context.body()
                if (body) return body
            }

            // PocketPages templates and hooks also expose body() globally.
            if (typeof body === 'function') {
                const parsedBody = body()
                if (parsedBody) return parsedBody
            }
        } catch (e) {
            console.error('[common.js] Error parsing form data:', e)
        }
        return data
    },

    /**
     * Initialize PocketBase client and get authenticated user.
     * @param {object} context - The pb_hooks context object
     * @returns {{client: any, user: any}} Object containing the initialized client and user model (or null)
     */
    init: function (context) {
        const { request } = context
        const client = context.pb({ request })
        const user = client.authStore.model
        return { client, user }
    },

    /**
     * Converts PocketBase JSON field values into plain JavaScript values.
     * JSVM can expose JSON fields as reflected Go values, which render as method
     * tables in EJS unless they are explicitly unpacked first.
     * @param {any} value - Raw value returned from record.get(...)
     * @returns {any} Plain JavaScript value
     */
    normalizeJsonField: function (value) {
        const seen = new WeakSet()
        const normalize = (raw) => {
            if (raw === null || raw === undefined) return raw

            if (typeof raw === 'string') {
                try {
                    return normalize(JSON.parse(raw))
                } catch (ignore) {
                    return raw
                }
            }

            if (typeof raw !== 'object') return raw
            if (seen.has(raw)) return null
            seen.add(raw)

            try {
                if (typeof raw.string === 'function') {
                    const stringValue = raw.string()
                    if (!stringValue) return null
                    return normalize(JSON.parse(stringValue))
                }
            } catch (ignore) { }

            try {
                if (typeof raw.value === 'function') {
                    return normalize(raw.value())
                }
            } catch (ignore) { }

            if (Array.isArray(raw)) {
                return raw.map((item) => normalize(item))
            }

            try {
                const plain = JSON.parse(JSON.stringify(raw))
                if (plain && typeof plain === 'object') {
                    return normalize(plain)
                }
            } catch (ignore) { }

            const normalized = {}
            Object.keys(raw).forEach((key) => {
                if (typeof raw[key] !== 'function') {
                    normalized[key] = normalize(raw[key])
                }
            })
            return normalized
        }

        return normalize(value)
    }
};
