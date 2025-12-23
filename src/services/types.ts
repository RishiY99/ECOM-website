export interface SignUpData {
    name: string;
    email: string;
    password: string;
}

// Interface for seller login data
export interface LoginData {
    email: string;
    password: string;
}

export interface product {
    "name": string,
    "price": number,
    "quantity": number,
    "color": string,
    "description": string,
    "image": string,
    "id": string,
    product_id: undefined | string
}

export interface cart {
    "name": string,
    "price": number,
    "quantity": number,
    "color": string,
    "description": string,
    "image": string,
    "id": string | undefined,
    "user_id": string,
    "product_id": string

}


export interface priceSummary {
    price: number,
    tax: number,
    delivery: number,
    discount: number,
    total: number
}


export interface order {
    name: string,
    email: string,
    phone: string,
    address: string,
    user_id: string,
    total: number,
    id: string
}