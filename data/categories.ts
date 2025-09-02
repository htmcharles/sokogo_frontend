export const categories = {
  MOTORS: {
    label: "Motors",
    subcategories: [
      { value: "CARS", label: "Cars" },
      { value: "sedan", label: "Sedan" },
      { value: "suv", label: "SUV" },
      { value: "truck", label: "Truck" },
    ],
    features: {
      fuelTypes: ["petrol", "diesel", "hybrid", "electric"],
      transmissions: ["manual", "automatic", "cvt"],
      exteriorColors: ["white", "black", "silver", "red", "blue"],
      interiorColors: ["black", "beige", "gray", "brown"],
      doors: ["2", "4", "5"],
      steeringSides: ["left", "right"],
      horsePowerRanges: ["under-100", "100-200", "200-300", "300+"],
      seatingCapacities: ["2", "4", "5", "7", "8+"],
    },
  },
} as const

export type CategoryKey = keyof typeof categories
