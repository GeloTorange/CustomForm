import type { HTMLAttributes } from 'react'

/**
 * Свойства бренд-блока продукта.
 */
type CloudFabricBrandProps = HTMLAttributes<HTMLDivElement>

/**
 * Брендовый логотип в текстовом виде с компактным SVG-символом.
 *
 * @param props Дополнительные HTML-свойства контейнера.
 * @returns JSX-элемент логотипа продукта.
 */
export const CloudFabricBrand = ({ className, ...props }: CloudFabricBrandProps) => (
  <div className={className} {...props}>
    <svg
      width="45"
      height="28"
      viewBox="0 0 45 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4 4H17.4L12.5 9.2H8.8V24H4V4Z"
        fill="#5DAA2E"
      />
      <path
        d="M17.8 4H24.5L19 10.2L25.7 24H20L15.9 14.5L17.8 4Z"
        fill="#5DAA2E"
        opacity="0.9"
      />
      <path
        d="M29.3 4.5L24.1 10.3H34.4L39.8 4.5H29.3Z"
        fill="#0F1A14"
        opacity="0.12"
      />
    </svg>
    <span className="cloud-fabric-brand__x5">X5</span>
    <span className="cloud-fabric-brand__title">Cloud Fabric Manager</span>
  </div>
)
