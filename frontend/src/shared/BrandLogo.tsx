import { IconBrand } from './icons'
import { colors } from './theme'

interface BrandLogoProps {
  size?: number
  color?: string
}

export function BrandLogo({ size = 22, color = colors.primary }: BrandLogoProps) {
  return <IconBrand size={size} color={color} />
}
