/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export const Collections = {
	Authorigins: "_authOrigins",
	Externalauths: "_externalAuths",
	Mfas: "_mfas",
	Otps: "_otps",
	Superusers: "_superusers",
	Addresses: "addresses",
	CartItems: "cart_items",
	Carts: "carts",
	Categories: "categories",
	Coupons: "coupons",
	OrderItems: "order_items",
	Orders: "orders",
	Payments: "payments",
	ProductVariants: "product_variants",
	Products: "products",
	Reviews: "reviews",
	Shipments: "shipments",
	Users: "users",
} as const
export type Collections = typeof Collections[keyof typeof Collections]

// Alias types for improved usability
export type IsoDateString = string
export type IsoAutoDateString = string & { readonly autodate: unique symbol }
export type RecordIdString = string
export type FileNameString = string & { readonly filename: unique symbol }
export type HTMLString = string

type ExpandType<T> = unknown extends T
	? T extends unknown
		? { expand?: unknown }
		: { expand: T }
	: { expand: T }

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
} & ExpandType<T>

export type AuthSystemFields<T = unknown> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated: IsoAutoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated: IsoAutoDateString
}

export type MfasRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	method: string
	recordRef: string
	updated: IsoAutoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated: IsoAutoDateString
}

export type SuperusersRecord = {
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

export type AddressesRecord = {
	city: string
	country: string
	id: string
	is_default?: boolean
	state?: string
	street: string
	user: RecordIdString
	zip: string
}

export type CartItemsRecord = {
	cart: RecordIdString
	id: string
	quantity: number
	variant: RecordIdString
}

export type CartsRecord = {
	id: string
	session_id?: string
	user?: RecordIdString
}

export type CategoriesRecord = {
	id: string
	image?: FileNameString
	name: string
	parent?: RecordIdString
	slug: string
}

export const CouponsTypeOptions = {
	"percent": "percent",
	"fixed": "fixed",
} as const
export type CouponsTypeOptions = typeof CouponsTypeOptions[keyof typeof CouponsTypeOptions]
export type CouponsRecord = {
	code: string
	expires_at?: IsoDateString
	id: string
	is_active?: boolean
	max_uses?: number
	min_order?: number
	type: CouponsTypeOptions
	used_count?: number
	value: number
}

export type OrderItemsRecord = {
	id: string
	order: RecordIdString
	product_name: string
	quantity: number
	total_price: number
	unit_price: number
	variant?: RecordIdString
	variant_label?: string
}

export const OrdersStatusOptions = {
	"pending": "pending",
	"paid": "paid",
	"processing": "processing",
	"shipped": "shipped",
	"delivered": "delivered",
	"cancelled": "cancelled",
	"refunded": "refunded",
} as const
export type OrdersStatusOptions = typeof OrdersStatusOptions[keyof typeof OrdersStatusOptions]
export type OrdersRecord<Tshipping_address = unknown> = {
	coupon?: RecordIdString
	discount?: number
	id: string
	notes?: string
	shipping_address?: null | Tshipping_address
	shipping_cost?: number
	status: OrdersStatusOptions
	subtotal: number
	tax?: number
	total: number
	user: RecordIdString
}

export const PaymentsProviderOptions = {
	"stripe": "stripe",
	"paypal": "paypal",
	"manual": "manual",
	"other": "other",
} as const
export type PaymentsProviderOptions = typeof PaymentsProviderOptions[keyof typeof PaymentsProviderOptions]

export const PaymentsStatusOptions = {
	"pending": "pending",
	"paid": "paid",
	"failed": "failed",
	"refunded": "refunded",
} as const
export type PaymentsStatusOptions = typeof PaymentsStatusOptions[keyof typeof PaymentsStatusOptions]
export type PaymentsRecord = {
	amount: number
	id: string
	order: RecordIdString
	provider: PaymentsProviderOptions
	provider_tx_id?: string
	status: PaymentsStatusOptions
}

export type ProductVariantsRecord<Tattributes = unknown> = {
	attributes?: null | Tattributes
	compare_at_price?: number
	id: string
	price: number
	product: RecordIdString
	sku: string
	stock: number
	weight?: number
}

export const ProductsStatusOptions = {
	"active": "active",
	"draft": "draft",
	"archived": "archived",
} as const
export type ProductsStatusOptions = typeof ProductsStatusOptions[keyof typeof ProductsStatusOptions]
export type ProductsRecord = {
	category?: RecordIdString
	description?: string
	id: string
	images?: FileNameString[]
	name: string
	slug: string
	status: ProductsStatusOptions
}

export type ReviewsRecord = {
	body?: string
	id: string
	is_verified_purchase?: boolean
	product: RecordIdString
	rating: number
	title?: string
	user: RecordIdString
}

export const ShipmentsStatusOptions = {
	"preparing": "preparing",
	"shipped": "shipped",
	"out_for_delivery": "out_for_delivery",
	"delivered": "delivered",
	"failed": "failed",
} as const
export type ShipmentsStatusOptions = typeof ShipmentsStatusOptions[keyof typeof ShipmentsStatusOptions]
export type ShipmentsRecord = {
	carrier?: string
	delivered_at?: IsoDateString
	id: string
	order: RecordIdString
	shipped_at?: IsoDateString
	status: ShipmentsStatusOptions
	tracking_number?: string
}

export type UsersRecord = {
	avatar?: FileNameString
	bio?: string
	created: IsoAutoDateString
	deleted?: boolean
	email: string
	emailVisibility?: boolean
	id: string
	name?: string
	password: string
	shortHand?: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type AddressesResponse<Texpand = unknown> = Required<AddressesRecord> & BaseSystemFields<Texpand>
export type CartItemsResponse<Texpand = unknown> = Required<CartItemsRecord> & BaseSystemFields<Texpand>
export type CartsResponse<Texpand = unknown> = Required<CartsRecord> & BaseSystemFields<Texpand>
export type CategoriesResponse<Texpand = unknown> = Required<CategoriesRecord> & BaseSystemFields<Texpand>
export type CouponsResponse<Texpand = unknown> = Required<CouponsRecord> & BaseSystemFields<Texpand>
export type OrderItemsResponse<Texpand = unknown> = Required<OrderItemsRecord> & BaseSystemFields<Texpand>
export type OrdersResponse<Tshipping_address = unknown, Texpand = unknown> = Required<OrdersRecord<Tshipping_address>> & BaseSystemFields<Texpand>
export type PaymentsResponse<Texpand = unknown> = Required<PaymentsRecord> & BaseSystemFields<Texpand>
export type ProductVariantsResponse<Tattributes = unknown, Texpand = unknown> = Required<ProductVariantsRecord<Tattributes>> & BaseSystemFields<Texpand>
export type ProductsResponse<Texpand = unknown> = Required<ProductsRecord> & BaseSystemFields<Texpand>
export type ReviewsResponse<Texpand = unknown> = Required<ReviewsRecord> & BaseSystemFields<Texpand>
export type ShipmentsResponse<Texpand = unknown> = Required<ShipmentsRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	addresses: AddressesRecord
	cart_items: CartItemsRecord
	carts: CartsRecord
	categories: CategoriesRecord
	coupons: CouponsRecord
	order_items: OrderItemsRecord
	orders: OrdersRecord
	payments: PaymentsRecord
	product_variants: ProductVariantsRecord
	products: ProductsRecord
	reviews: ReviewsRecord
	shipments: ShipmentsRecord
	users: UsersRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	addresses: AddressesResponse
	cart_items: CartItemsResponse
	carts: CartsResponse
	categories: CategoriesResponse
	coupons: CouponsResponse
	order_items: OrderItemsResponse
	orders: OrdersResponse
	payments: PaymentsResponse
	product_variants: ProductVariantsResponse
	products: ProductsResponse
	reviews: ReviewsResponse
	shipments: ShipmentsResponse
	users: UsersResponse
}

// Utility types for create/update operations

type ProcessCreateAndUpdateFields<T> = Omit<{
	// Omit AutoDate fields
	[K in keyof T as Extract<T[K], IsoAutoDateString> extends never ? K : never]: 
		// Convert FileNameString to File
		T[K] extends infer U ? 
			U extends (FileNameString | FileNameString[]) ? 
				U extends any[] ? File[] : File 
			: U
		: never
}, 'id'>

// Create type for Auth collections
export type CreateAuth<T> = {
	id?: RecordIdString
	email: string
	emailVisibility?: boolean
	password: string
	passwordConfirm: string
	verified?: boolean
} & ProcessCreateAndUpdateFields<T>

// Create type for Base collections
export type CreateBase<T> = {
	id?: RecordIdString
} & ProcessCreateAndUpdateFields<T>

// Update type for Auth collections
export type UpdateAuth<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof AuthSystemFields>
> & {
	email?: string
	emailVisibility?: boolean
	oldPassword?: string
	password?: string
	passwordConfirm?: string
	verified?: boolean
}

// Update type for Base collections
export type UpdateBase<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof BaseSystemFields>
>

// Get the correct create type for any collection
export type Create<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? CreateAuth<CollectionRecords[T]>
		: CreateBase<CollectionRecords[T]>

// Get the correct update type for any collection
export type Update<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? UpdateAuth<CollectionRecords[T]>
		: UpdateBase<CollectionRecords[T]>

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = {
	collection<T extends keyof CollectionResponses>(
		idOrName: T
	): RecordService<CollectionResponses[T]>
} & PocketBase
