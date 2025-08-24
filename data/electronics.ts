export interface Electronic {
  id: number
  price: string
  brand: string
  model: string
  specs: string
  condition: string
  image: string
}

export const electronicsData: Electronic[] = [
  {
    id: 1,
    price: "Frw 1,200,000",
    brand: "Apple",
    model: "iPhone 15 Pro",
    specs: "256GB",
    condition: "Brand New • Unlocked",
    image: "/iphone-15-pro.png",
  },
  {
    id: 2,
    price: "Frw 2,800,000",
    brand: "Apple",
    model: "MacBook Pro",
    specs: "M3 Chip",
    condition: "2024 • 16GB RAM • 512GB SSD",
    image: "/macbook-pro-laptop-computer.png",
  },
  {
    id: 3,
    price: "Frw 850,000",
    brand: "Samsung",
    model: '55" Smart TV',
    specs: "4K UHD",
    condition: "2023 • HDR • WiFi Enabled",
    image: "/samsung-55-inch-smart-tv-television.png",
  },
  {
    id: 4,
    price: "Frw 650,000",
    brand: "Sony",
    model: "PlayStation 5",
    specs: "825GB",
    condition: "Brand New • 2 Controllers",
    image: "/playstation-5-console.png",
  },
]
