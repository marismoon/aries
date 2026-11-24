import { FrostCard } from "@aries/ui/shared/FrostCard"
import { specPreviews } from "./previews-spec"
import "./components-preview.css"

/** The component standard: sizes, radii, type scale and colours. */
export function ComponentsPage() {
  return (
    <div className="components-page">
      <div className="components-grid">
        {specPreviews.map((item) => (
          <FrostCard
            key={item.id}
            className="component-card"
            data-wide={item.wide || undefined}
            id={`preview-${item.id}`}
            role="group"
            aria-label={item.title}
          >
            <header>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </header>
            {item.usage && (
              <code className="component-usage">{item.usage}</code>
            )}
            <div
              className="component-demo"
              data-stack={item.stack || undefined}
            >
              {item.node}
            </div>
          </FrostCard>
        ))}
      </div>
    </div>
  )
}
