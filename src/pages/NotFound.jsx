import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-4">
      <p className="text-brand-orange font-bold text-lg">404</p>
      <h1 className="text-3xl font-bold text-gray-900 mt-2">Page not found</h1>
      <p className="text-gray-600 mt-2 max-w-sm">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to="/">
        <Button className="mt-6">Back to Home</Button>
      </Link>
    </div>
  )
}

export default NotFound
