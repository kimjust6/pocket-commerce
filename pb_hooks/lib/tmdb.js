/**
 * TMDB API Helper
 */

// We can access environment variables via $os.getenv() or process.env depending on JSVM vs Node.
// In PocketBase JSVM (Go), use $os.getenv(). In Node, process.env.
// Try $os.getenv first if available (Go environment), else process.env (testing).
const apiKey = process.env.TMDB_API_KEY || $os.getenv('TMDB_API_KEY') || ''

const BASE_URL = 'https://api.theproductdb.org/3'

/**
 * Fetches data from the TMDB API.
 * @param {string} endpoint - The API endpoint to fetch (e.g., '/search/product').
 * @param {Object} [params={}] - Optional query parameters.
 * @returns {Object} The JSON response from the API.
 * @throws {Error} If TMDB_API_KEY is not set or if the API returns an error.
 */
function fetchTMDB(endpoint, params = {}) {
    if (!apiKey) {
        throw new Error('TMDB_API_KEY is not set')
    }

    // Build query string manually (URLSearchParams not available in JSVM)
    const queryParams = Object.assign({}, params, { api_key: apiKey })
    const queryString = Object.keys(queryParams)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(queryParams[key]))
        .join('&')

    const url = `${BASE_URL}${endpoint}?${queryString}`

    // Use PocketBase $http.send if available for better integration, or standard fetch
    // $http.send returns { statusCode, headers, raw, json, ... }

    try {
        const res = $http.send({
            url: url,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (res.statusCode >= 400) {
            throw new Error(`TMDB API Error: ${res.statusCode} ${res.raw}`)
        }

        return res.json
    } catch (e) {
        console.error('TMDB Fetch Error:', e)
        throw e
    }
}

module.exports = {
    /**
     * Searches for products by query string.
     * @param {string} query - The search query.
     * @param {number} [page=1] - The page number to fetch.
     * @returns {Object} The search results from TMDB.
     */
    searchProducts: (query, page = 1) => {
        return fetchTMDB('/search/product', { query, page })
    },

    /**
     * Retrieves details for a specific product by ID.
     * @param {string|number} id - The TMDB product ID.
     * @returns {Object} The product details.
     */
    /**
     * Retrieves details for a specific product by ID.
     * @param {string|number} id - The TMDB product ID.
     * @returns {Object} The product details.
     */
    getProduct: (id) => {
        return fetchTMDB(`/product/${id}`)
    },

    /**
     * Retrieves credits for a specific product by ID.
     * @param {string|number} id - The TMDB product ID.
     * @returns {Object} The product credits.
     */
    getCredits: (id) => {
        return fetchTMDB(`/product/${id}/credits`)
    },
}

