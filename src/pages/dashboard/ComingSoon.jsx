function ComingSoon({ title }) {
  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <div className="mt-6 bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center">
        <p className="text-gray-500">This section is coming soon.</p>
      </div>
    </div>
  )
}

export default ComingSoon
