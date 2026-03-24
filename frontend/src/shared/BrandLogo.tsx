import { IconBrand } from './icons'

interface BrandLogoProps {
  size?: number
}

export function BrandLogo({ size = 22 }: BrandLogoProps) {
  return <IconBrand size={size} />
}
