/**
 * @file Common utility functions and constants for PocketBase hooks.
 * @module common
 */

/**
 * PocketBase Table Name Constants.
 * Use these to avoid hardcoding table names throughout the codebase.
 * @constant {Object<string, string>}
 * @property {string} USERS - The users table
 * @property {string} LISTS - The watchlists/lists table
 * @property {string} LIST_USER - The list-user relationship table for invites
 * @property {string} PRODUCTS - The products table
 * @property {string} WATCHED_HISTORY - The watch history table (list-product relationship)
 * @property {string} WATCH_HISTORY_USER - The user attendance/ratings table
 * @property {string} WATCHLIST - The personal watchlist table
 */
const TABLES = {
    USERS: 'users',
    LISTS: 'lists',
    LIST_USER: 'list_user',
    PRODUCTS: 'products',
    WATCHED_HISTORY: 'watched_history',
    WATCH_HISTORY_USER: 'watch_history_user',
    WATCHLIST: 'watchlist'
};

/**
 * PocketBase Column Name Constants.
 * Use these to avoid hardcoding column names throughout the codebase.
 * @constant {Object<string, string>}
 */
const COLS = {
    /** @type {string} Primary key column */
    ID: 'id',
    /** @type {string} List reference column */
    LIST: 'list',
    /** @type {string} Product reference column */
    PRODUCT: 'product',
    /** @type {string} User reference column */
    USER: 'user',
    /** @type {string} Owner reference column */
    OWNER: 'owner',
    /** @type {string} Created timestamp column */
    CREATED: 'created',
    /** @type {string} Watched date column */
    WATCHED: 'watched',
    /** @type {string} Soft delete flag column */
    IS_DELETED: 'is_deleted',
    /** @type {string} Private flag column */
    IS_PRIVATE: 'is_private',
    /** @type {string} User rating column (0-10 scale) */
    RATING: 'rating',
    /** @type {string} User review text column */
    REVIEW: 'review',
    /** @type {string} Product title column */
    TITLE: 'title',
    /** @type {string} List title column */
    LIST_TITLE: 'list_title',
    /** @type {string} TMDB ID column */
    TMDB_ID: 'tmdb_id',
    /** @type {string} Poster path column */
    POSTER_PATH: 'poster_path',
    /** @type {string} Backdrop path column */
    BACKDROP_PATH: 'backdrop_path',
    /** @type {string} Release date column */
    RELEASE_DATE: 'release_date',
    /** @type {string} Runtime in minutes column */
    RUNTIME: 'runtime',
    /** @type {string} Product overview/synopsis column */
    OVERVIEW: 'overview',
    /** @type {string} Product tagline column */
    TAGLINE: 'tagline',
    /** @type {string} IMDB ID column */
    IMDB_ID: 'imdb_id',
    /** @type {string} Product status column */
    STATUS: 'status',
    /** @type {string} TMDB score column */
    TMDB_SCORE: 'tmdb_score',
    /** @type {string} IMDB score column */
    IMDB_SCORE: 'imdb_score',
    /** @type {string} Rotten Tomatoes score column */
    RT_SCORE: 'rt_score',
    /** @type {string} User display name column */
    NAME: 'name',
    /** @type {string} Username column */
    USERNAME: 'username',
    /** @type {string} Avatar column */
    AVATAR: 'avatar',
    /** @type {string} User shorthand/initials column */
    SHORTHAND: 'shortHand',
    /** @type {string} Invited user reference column */
    INVITED_USER: 'invited_user',
    /** @type {string} User permission level column */
    USER_PERMISSION: 'user_permission',
    /** @type {string} Failed attendance flag column */
    FAILED: 'failed',
    /** @type {string} Description column */
    DESCRIPTION: 'description',
    /** @type {string} Watch history reference column */
    WATCH_HISTORY: 'watch_history'
};

module.exports = {
    // Export constants
    TABLES,
    COLS,

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

            // Try request.formValue if context.request exists (standard net/http wrapper)
            if (context.request && typeof context.request.formValue === 'function') {
                // This is harder to iterate all keys without knowing them.
                // So often we rely on body() if formData() failed.
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
    },

    /**
     * Fetch all watchlists (owned and shared) for a user.
     * @param {any} client - The initialized PocketBase client
     * @param {any} user - The user object
     * @returns {Array<{id: string, title: string, is_private: boolean}>} Array of watchlist objects
     */
    getWatchlists: function (client, user) {
        if (!user) return []

        let lists = []
        try {
            // 1. Owned lists
            let ownedLists = []
            try {
                // Use server-side search to bypass API rules
                const records = $app.findRecordsByFilter(
                    'lists',
                    `owner = '${user.id}' && (is_deleted = false || is_deleted = null)`,
                    '-created'
                )
                ownedLists = records.map(r => ({
                    id: r.id,
                    list_title: r.getString('list_title'),
                    description: r.getString('description'),
                    is_private: r.getBool('is_private'),
                    owner: r.getString('owner'),
                    created: r.getString('created'),
                    updated: r.getString('updated'),
                    is_deleted: r.getBool('is_deleted')
                }))
            } catch (e) {
                console.error('[common.js] Failed to fetch owned lists:', e)
            }

            // 2. Shared lists
            let sharedLists = []
            try {
                const sharedInvites = $app.findRecordsByFilter(
                    'list_user',
                    `invited_user = '${user.id}'`,
                    '-created'
                )
                $app.expandRecords(sharedInvites, ['list'])

                sharedLists = sharedInvites
                    .map((invite) => {
                        const list = invite.expandedOne('list')
                        if (list && !list.getBool('is_deleted')) {
                            return {
                                id: list.id,
                                list_title: list.getString('list_title'),
                                description: list.getString('description'),
                                is_private: list.getBool('is_private'),
                                owner: list.getString('owner'),
                                created: list.getString('created'),
                                updated: list.getString('updated'),
                                is_deleted: list.getBool('is_deleted')
                            }
                        }
                        return null
                    })
                    .filter(Boolean)
            } catch (e) {
                console.error('[common.js] Failed to fetch shared lists:', e)
            }

            // Combine and deduplicate
            const allLists = [...ownedLists, ...sharedLists]
            const seenIds = new Set()

            lists = allLists.filter((list) => {
                if (seenIds.has(list.id)) return false
                seenIds.add(list.id)
                return true
            })
        } catch (e) {
            console.error('[common.js] Failed to load watchlists:', e)
        }
        return lists
    },

    /**
     * Fetch a watchlist by ID and check access permissions.
     * @param {string} listId - The watchlist ID
     * @param {any} user - The user object (or null)
     * @returns {{list: any, hasAccess: boolean, isOwner: boolean, error: string|null}}
     */
    getWatchlistWithAccess: function (listId, user) {
        let list = null
        let hasAccess = false
        let isOwner = false
        let error = null

        try {
            list = $app.findFirstRecordByFilter('lists', `id = '${listId}' && is_deleted != true`)
            if (!list) {
                return { list: null, hasAccess: false, isOwner: false, error: "List not found" }
            }
        } catch (e) {
            return { list: null, hasAccess: false, isOwner: false, error: "List not found" }
        }

        const isPrivate = list.getBool('is_private')
        const owner = list.getString('owner')
        isOwner = (user && owner === user.id)

        // Check access
        if (!isPrivate) {
            hasAccess = true
        } else if (isOwner) {
            hasAccess = true
        } else if (user) {
            try {
                const invite = $app.findFirstRecordByFilter(
                    'list_user',
                    `list = '${list.id}' && invited_user = '${user.id}'`
                )
                if (invite) hasAccess = true
            } catch (ignore) { }
        }

        if (!hasAccess) {
            error = "You do not have permission to view this list."
        }

        return { list, hasAccess, isOwner, error }
    },

    /**
     * Fetch products for a watchlist.
     * @param {string} listId - The watchlist ID
     * @param {object} options - Fetch options { limit: 20, offset: 0, sort: '-created' }
     * @returns {Array} Array of product objects with history data
     */
    fetchWatchlistProducts: function (listId, options = {}) {
        const limit = options.limit || 20
        const offset = options.offset || 0
        const sort = options.sort || '-created'

        try {
            const historyRecords = $app.findRecordsByFilter(
                'watched_history',
                `list = '${listId}'`,
                sort,
                limit,
                offset
            )

            $app.expandRecords(historyRecords, ['product'])

            const results = historyRecords.map((item) => {
                const m = item.expandedOne('product')
                if (m) {
                    return {
                        id: m.id,
                        tmdb_id: m.getString('tmdb_id'),
                        title: m.getString('title'),
                        release_date: m.getString('release_date'),
                        runtime: m.getInt('runtime'),
                        poster_path: m.getString('poster_path'),
                        backdrop_path: m.getString('backdrop_path'),
                        overview: m.getString('overview'),
                        tagline: m.getString('tagline'),
                        imdb_id: m.getString('imdb_id'),
                        status: m.getString('status'),
                        history_id: item.id,
                        history_created: item.getString('created'),
                        watched_at: item.getString('watched'),
                        tmdb_score: item.getFloat('tmdb_score'),
                        imdb_score: item.getFloat('imdb_score'),
                        rt_score: item.getInt('rt_score'),
                    }
                }
                return null
            }).filter(Boolean)

            // Attach metadata to the array to help with pagination
            results.totalFetched = historyRecords.length
            return results
        } catch (e) {
            console.error('[common.js] Failed to load list items:', e)
            return []
        }
    },

    /**
     * Fetch potential users to invite to a watchlist.
     * @param {string} excludeUserId - User ID to exclude (current user)
     * @param {boolean} isOwner - Whether current user is owner
     * @param {string} listId - The list ID to check for existing invites
     * @returns {Array} Array of users with is_invited flag and current_permission
     */
    fetchPotentialInviteUsers: function (excludeUserId, isOwner, listId) {
        if (!isOwner || !excludeUserId) return []

        try {
            // 1. Fetch potential users
            const users = $app.findRecordsByFilter(
                'users',
                `id != '${excludeUserId}'`,
                'email',
                50,
                0
            )

            // 2. If listId is provided, check who is already added and their permission
            const invitedUserMap = new Map() // userId -> permission
            if (listId) {
                try {
                    const existingInvites = $app.findRecordsByFilter(
                        'list_user',
                        `list = '${listId}'`,
                        '-created',
                        100,
                        0
                    )
                    existingInvites.forEach(invite => {
                        invitedUserMap.set(invite.getString('invited_user'), invite.getString('user_permission'))
                    })
                } catch (ignore) {
                    // Ignore errors if list_user fetch fails
                }
            }

            return users.map(u => ({
                id: u.id,
                email: u.getString('email'),
                is_invited: invitedUserMap.has(u.id),
                current_permission: invitedUserMap.get(u.id) || 'view' // Default to view if not found
            }))
        } catch (e) {
            console.error("[common.js] Failed to fetch users", e)
            return []
        }
    },
    /**
     * Fetch all members of a list (owner + invited users).
     * @param {string} listId - The list ID
     * @param {string} ownerId - The owner's User ID
     * @returns {Array<{id: string, name: string, avatar: string, is_owner: boolean}>}
     */
    fetchListMembers: function (listId, ownerId) {
        const members = []
        const seenIds = new Set()

        // 1. Add Owner
        if (ownerId) {
            try {
                const owner = $app.findRecordById("users", ownerId)
                members.push({
                    id: owner.id,
                    name: owner.getString('name') || owner.getString('username'),
                    avatar: owner.getString('avatar'),
                    is_owner: true
                })
                seenIds.add(ownerId)
            } catch (e) { }
        }

        // 2. Add Invited Users
        try {
            const invites = $app.findRecordsByFilter("list_user", `list = '${listId}'`)
            invites.forEach(invite => {
                const uid = invite.getString('invited_user')
                if (!seenIds.has(uid)) {
                    try {
                        const u = $app.findRecordById("users", uid)
                        members.push({
                            id: u.id,
                            name: u.getString('name') || u.getString('username'),
                            avatar: u.getString('avatar'),
                            is_owner: false
                        })
                        seenIds.add(uid)
                    } catch (e) { }
                }
            })
        } catch (e) { }

        return members
    },

    /**
     * Attach attendance data to products.
     * @param {Array} products - Array of product objects (must have history_id)
     * @param {string} listId - The list ID (for optimization if needed, currently unused as we filter by history IDs)
     */
    attachAttendance: function (products, listId) {
        if (!products || products.length === 0) return

        const historyIds = products.map(m => m.history_id).filter(Boolean)
        if (historyIds.length === 0) return

        // Construct filter: watch_history = 'id1' || watch_history = 'id2' ...
        const filter = historyIds.map(id => `watch_history = '${id}'`).join(' || ')

        const attendanceMap = {} // history_id -> { user_id: { ... } }

        try {
            const records = $app.findRecordsByFilter("watch_history_user", filter)
            records.forEach(rec => {
                const hid = rec.getString('watch_history')
                const uid = rec.getString('user')

                if (!attendanceMap[hid]) attendanceMap[hid] = {}

                attendanceMap[hid][uid] = {
                    id: rec.id,
                    rating: rec.getFloat('rating'),
                    review: rec.getString('review'),
                    failed: rec.getBool('failed'),
                    created: rec.getString('created')
                }
            })
        } catch (e) {
            console.error('[common.js] Failed to fetch attendance:', e)
        }

        // Attach to products
        products.forEach(m => {
            m.attendance = attendanceMap[m.history_id] || {}
        })
    },

    /**
     * Map a PocketBase product record to a standardized product object.
     * Creates a consistent product data structure from raw PocketBase records.
     * @param {any} productRecord - The expanded product record from PocketBase
     * @param {any} [historyRecord=null] - Optional history record for additional data like scores
     * @returns {ProductObject|null} Standardized product object or null if productRecord is falsy
     * @typedef {Object} ProductObject
     * @property {string} id - PocketBase record ID
     * @property {string} tmdb_id - TMDB product ID
     * @property {string} title - Product title
     * @property {string} release_date - Release date string
     * @property {number} runtime - Runtime in minutes
     * @property {string} poster_path - TMDB poster path
     * @property {string} backdrop_path - TMDB backdrop path
     * @property {string} overview - Product synopsis
     * @property {string} tagline - Product tagline
     * @property {string} imdb_id - IMDB ID
     * @property {string} status - Product status
     * @property {string} [history_id] - Watch history record ID (if historyRecord provided)
     * @property {string} [watched_at] - Watch date (if historyRecord provided)
     * @property {number} [tmdb_score] - TMDB score (if historyRecord provided)
     * @property {number} [imdb_score] - IMDB score (if historyRecord provided)
     * @property {number} [rt_score] - Rotten Tomatoes score (if historyRecord provided)
     */
    mapProductFromRecord: function (productRecord, historyRecord = null) {
        if (!productRecord) return null

        const product = {
            id: productRecord.id,
            tmdb_id: productRecord.getString(COLS.TMDB_ID),
            title: productRecord.getString(COLS.TITLE),
            release_date: productRecord.getString(COLS.RELEASE_DATE),
            runtime: productRecord.getInt(COLS.RUNTIME),
            poster_path: productRecord.getString(COLS.POSTER_PATH),
            backdrop_path: productRecord.getString(COLS.BACKDROP_PATH),
            overview: productRecord.getString(COLS.OVERVIEW),
            tagline: productRecord.getString(COLS.TAGLINE),
            imdb_id: productRecord.getString(COLS.IMDB_ID),
            status: productRecord.getString(COLS.STATUS)
        }

        // Add history data if provided
        if (historyRecord) {
            product.history_id = historyRecord.id
            product.history_created = historyRecord.getString(COLS.CREATED)
            product.watched_at = historyRecord.getString(COLS.WATCHED)
            product.tmdb_score = historyRecord.getFloat(COLS.TMDB_SCORE)
            product.imdb_score = historyRecord.getFloat(COLS.IMDB_SCORE)
            product.rt_score = historyRecord.getInt(COLS.RT_SCORE)
        }

        return product
    },

    /**
     * Get top lists by product count using the PocketBase query builder.
     * Uses SQL GROUP BY and COUNT for efficient aggregation.
     * @param {number} [limit=3] - Maximum number of top lists to return
     * @returns {Array<TopListObject>} Array of list objects sorted by product count descending
     * @typedef {Object} TopListObject
     * @property {string} id - List ID
     * @property {string} title - List title
     * @property {number} count - Number of products in the list
     * @property {string[]} posters - Array of up to 3 poster paths from the list's products
     * @example
     * const topLists = common.getTopListsByProductCount(4)
     * // Returns: [{ id: 'abc', title: 'Best Comedies', count: 25, posters: [...] }, ...]
     */
    getTopListsByProductCount: function (limit = 3) {
        try {
            const listCountResult = arrayOf(new DynamicModel({
                "list": "",
                "count": 0
            }))

            $app.db()
                .select("wh.list", "COUNT(*) as count")
                .from(`${TABLES.WATCHED_HISTORY} wh`)
                .innerJoin(`${TABLES.LISTS} w`, $dbx.exp("w.id = wh.list"))
                .where($dbx.exp("wh.list != ''"))
                .andWhere($dbx.hashExp({ [`w.${COLS.IS_DELETED}`]: false }))
                .andWhere($dbx.hashExp({ [`w.${COLS.IS_PRIVATE}`]: false }))
                .groupBy("wh.list")
                .orderBy("count DESC")
                .limit(limit)
                .all(listCountResult)

            const topLists = []
            for (const row of listCountResult) {
                const listId = row.list
                const count = row.count

                const listRecord = $app.findRecordById(TABLES.LISTS, listId)
                if (!listRecord) continue

                // Get up to 3 product posters for this list
                const listHistory = $app.findRecordsByFilter(
                    TABLES.WATCHED_HISTORY,
                    `${COLS.LIST} = "${listId}"`,
                    `-${COLS.WATCHED}`,
                    3,
                    0
                )
                $app.expandRecords(listHistory, [COLS.PRODUCT])

                const posters = []
                for (const h of listHistory) {
                    const product = h.expandedOne(COLS.PRODUCT)
                    if (product) {
                        const posterPath = product.getString(COLS.POSTER_PATH)
                        if (posterPath && !posters.includes(posterPath)) {
                            posters.push(posterPath)
                        }
                    }
                }

                topLists.push({
                    id: listId,
                    title: listRecord.getString(COLS.LIST_TITLE),
                    description: listRecord.getString(COLS.DESCRIPTION),
                    count: count,
                    posters: posters
                })
            }

            return topLists
        } catch (e) {
            console.error('[common.js] Failed to get top lists:', e)
            return []
        }
    },

    /**
     * Get recent unique products from the watch history.
     * Fetches recent additions and deduplicates by product ID.
     * @param {number} [limit=6] - Maximum number of unique products to return
     * @returns {Array<RecentProductObject>} Array of recent product objects sorted by watch date
     * @typedef {Object} RecentProductObject
     * @property {string} id - PocketBase product record ID
     * @property {string} tmdb_id - TMDB product ID
     * @property {string} title - Product title
     * @property {string} poster_path - TMDB poster path
     * @property {string} watched_at - Watch date timestamp
     * @example
     * const recentProducts = common.getRecentProducts(6)
     * // Returns: [{ id: 'abc', tmdb_id: '123', title: 'Product', poster_path: '/path.jpg', watched_at: '2026-02-01' }, ...]
     */
    getRecentProducts: function (limit = 6) {
        try {
            // Fetch more records than limit to account for duplicates
            const recentHistory = $app.findRecordsByFilter(
                TABLES.WATCHED_HISTORY,
                "",
                `-${COLS.WATCHED}`,
                limit * 4,
                0
            )
            $app.expandRecords(recentHistory, [COLS.PRODUCT])

            const seenProducts = new Set()
            const recentProducts = []

            for (const h of recentHistory) {
                const product = h.expandedOne(COLS.PRODUCT)
                if (product && recentProducts.length < limit && !seenProducts.has(product.id)) {
                    recentProducts.push({
                        id: product.id,
                        tmdb_id: product.getString(COLS.TMDB_ID),
                        title: product.getString(COLS.TITLE),
                        poster_path: product.getString(COLS.POSTER_PATH),
                        watched_at: h.getString(COLS.WATCHED)
                    })
                    seenProducts.add(product.id)
                }
            }

            return recentProducts
        } catch (e) {
            console.error('[common.js] Failed to get recent products:', e)
            return []
        }
    },

    /**
     * Get recent activity (product adds and reviews/ratings).
     * Combines recent list additions and user ratings into a single activity feed.
     * @param {number} [limit=4] - Maximum number of activity items to return
     * @returns {Array<ActivityObject>} Array of activity objects sorted by created date
     * @typedef {Object} ActivityObject
     * @property {'add'|'review'|'rating'} type - Type of activity
     * @property {string} created - Creation timestamp
     * @property {string} productTitle - Title of the product
     * @property {string} productId - TMDB ID of the product
     * @property {string} [listTitle] - List title (for 'add' type)
     * @property {string} [listId] - List ID (for 'add' type)
     * @property {string} [userName] - User's display name (for 'review'/'rating' type)
     * @property {string} [userInitials] - User's initials (for 'review'/'rating' type)
     * @property {number} [rating] - Rating on 0-5 scale (for 'review'/'rating' type)
     * @property {string} [review] - Review text (for 'review' type)
     * @example
     * const activity = common.getRecentActivity(4)
     * // Returns: [{ type: 'add', productTitle: 'Product', listTitle: 'List', ... }, ...]
     */
    getRecentActivity: function (limit = 4) {
        const recentActivity = []

        try {
            // Recent product adds
            const recentAdds = $app.findRecordsByFilter(
                TABLES.WATCHED_HISTORY,
                `${COLS.LIST} != ''`,
                `-${COLS.CREATED}`,
                limit,
                0
            )
            $app.expandRecords(recentAdds, [COLS.PRODUCT, COLS.LIST])

            for (const r of recentAdds) {
                const product = r.expandedOne(COLS.PRODUCT)
                const list = r.expandedOne(COLS.LIST)
                if (product && list && !list.getBool(COLS.IS_DELETED) && !list.getBool(COLS.IS_PRIVATE)) {
                    recentActivity.push({
                        type: 'add',
                        created: r.getString(COLS.CREATED),
                        productTitle: product.getString(COLS.TITLE),
                        productId: product.getString(COLS.TMDB_ID),
                        listTitle: list.getString(COLS.LIST_TITLE),
                        listId: list.id
                    })
                }
            }
        } catch (e) {
            console.error('[common.js] Failed to get recent adds:', e)
        }

        try {
            // Recent reviews
            const recentReviews = $app.findRecordsByFilter(
                TABLES.WATCH_HISTORY_USER,
                `${COLS.REVIEW} != '' || ${COLS.RATING} > 0`,
                `-${COLS.CREATED}`,
                limit,
                0
            )
            $app.expandRecords(recentReviews, [COLS.USER, COLS.WATCH_HISTORY])

            for (const r of recentReviews) {
                const user = r.expandedOne(COLS.USER)
                const watchHistory = r.expandedOne(COLS.WATCH_HISTORY)
                if (user && watchHistory) {
                    $app.expandRecords([watchHistory], [COLS.PRODUCT])
                    const product = watchHistory.expandedOne(COLS.PRODUCT)
                    if (product) {
                        const rating = r.getFloat(COLS.RATING)
                        const review = r.getString(COLS.REVIEW)
                        recentActivity.push({
                            type: review ? 'review' : 'rating',
                            created: r.getString(COLS.CREATED),
                            userName: user.getString(COLS.NAME) || user.getString(COLS.USERNAME) || 'User',
                            userInitials: (user.getString(COLS.SHORTHAND) || user.getString(COLS.NAME) || 'U').substring(0, 2).toUpperCase(),
                            productTitle: product.getString(COLS.TITLE),
                            productId: product.getString(COLS.TMDB_ID),
                            rating: Math.round(rating) / 2,
                            review: review
                        })
                    }
                }
            }
        } catch (e) {
            console.error('[common.js] Failed to get recent reviews:', e)
        }

        // Sort by created date and take top items
        recentActivity.sort((a, b) => new Date(b.created) - new Date(a.created))
        return recentActivity.slice(0, limit)
    }
}
