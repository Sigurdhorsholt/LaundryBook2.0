import { IconBrand } from './icons'
import { colors } from './theme'

interface BrandLogoProps {
  size?: number
}

export function BrandLogo({ size = 22 }: BrandLogoProps) {
  return <IconBrand size={size} color={colors.primary} />
}
