export const formatCurrency = (value: number) => {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  })
}

export const formatPercentage = (value: number) => {
  return value.toFixed(2) + "%"
}

export const formatDate = (date: Date) => {
  return date.toLocaleDateString()
}

export const cn = (...inputs: (string | undefined)[]) => {
  return inputs.filter(Boolean).join(" ")
}
