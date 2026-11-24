import { lazy, Suspense, type ComponentType } from "react"
import { useParams } from "react-router"

import { Skeleton } from "@aries/ui/ui/skeleton"
import { Toaster } from "@aries/ui/ui/sonner"
import { componentCategories } from "./categories"
import { BadgeColorsDemo } from "./BadgeColorsDemo"
import { ChartShowcase } from "./ChartShowcase"
import { DataTableDemo } from "./DataTableDemo"
import "./components-preview.css"

type ExampleModule = { default: ComponentType }
const loaders = import.meta.glob<ExampleModule>("./examples/*.tsx")

// Created once at module level so each example keeps a stable component type.
const examples = Object.fromEntries(
  Object.entries(loaders).map(([path, load]) => [
    path.replace("./examples/", "").replace(".tsx", ""),
    lazy(load),
  ])
)

const titleOf = (name: string) =>
  name
    .split("-")
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join(" ")

function ExampleSection({ name }: { name: string }) {
  const Example = examples[name]

  return (
    <section
      className="component-section"
      id={`component-${name}`}
      aria-labelledby={`component-${name}-title`}
    >
      <h2 id={`component-${name}-title`}>{titleOf(name)}</h2>
      {name === "table" && <DataTableDemo />}
      {name === "badge" && <BadgeColorsDemo />}
      {name === "chart" && <ChartShowcase />}
      {Example && (
        <Suspense fallback={<Skeleton className="h-40 w-full" />}>
          <Example />
        </Suspense>
      )}
    </section>
  )
}

/** One second-level page: the official examples of every component in a category. */
export function ComponentCategoryPage({ slug }: { slug: string }) {
  const params = useParams()
  const category = componentCategories.find(
    (item) => item.slug === (params.category ?? slug)
  )
  if (!category) return null

  return (
    <div className="components-page">
      {category.components.map((name) => (
        <ExampleSection key={name} name={name} />
      ))}
      <Toaster />
    </div>
  )
}
