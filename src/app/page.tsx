export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🚀 BP Frontend
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          Next.js 16.0.1 + Django Backend
        </p>
        <p className="text-sm text-gray-500">Faz 3: Root Layout - Minimal ✅</p>
        <div className="mt-8 p-4 bg-white rounded-lg shadow-md">
          <p className="text-sm text-gray-700">
            API URL:{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">
              {process.env.NEXT_PUBLIC_API_URL || "Not set"}
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
