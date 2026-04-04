import { TreePine } from 'lucide-react'

export function BrandHeader() {
  return (
    <div className="brand">
      <TreePine className="brand-icon" aria-hidden="true" />
      <div>
        <div className="brand-name">TodoTree</div>
        <div className="brand-sub">Infinite hierarchy · Focused execution</div>
      </div>
    </div>
  )
}
