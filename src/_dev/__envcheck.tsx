import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/__envcheck')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/__envcheck"!</div>
}
