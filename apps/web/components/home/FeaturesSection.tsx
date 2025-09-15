export function FeaturesSection() {
  return (
    <div className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Secure Marketplace</h3>
            <p className="text-gray-600">Buy and sell with confidence using our verified user system.</p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Lost & Found Registry</h3>
            <p className="text-gray-600">Smart matching algorithm to reunite you with lost items.</p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Legal Compliance</h3>
            <p className="text-gray-600">Full legal compliance for found items with jurisdiction-specific workflows.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
