import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { REWARD_DECIMALS } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatWalletAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatTokenAmount(amount: string, decimals: number = REWARD_DECIMALS): string {
  const value = parseFloat(amount) / Math.pow(10, decimals)
  return value.toFixed(2)
}

export function toBaseUnits(tokenAmount: string, decimals: number = REWARD_DECIMALS): string {
  const [whole, fraction = ''] = tokenAmount.split('.')
  const paddedFraction = (fraction + '0'.repeat(decimals)).slice(0, decimals)
  const multiplier = BigInt('1' + '0'.repeat(decimals))
  const base = BigInt(whole || '0') * multiplier
  const frac = BigInt(paddedFraction || '0')
  return (base + frac).toString()
}

export function generateRandomPosition(containerWidth: number, containerHeight: number, targetSize: number = 60) {
  const x = Math.random() * (containerWidth - targetSize)
  const y = Math.random() * (containerHeight - targetSize)
  return { x, y }
}

export function generateUniqueId(): string {
  return Math.random().toString(36).substr(2, 9)
} 