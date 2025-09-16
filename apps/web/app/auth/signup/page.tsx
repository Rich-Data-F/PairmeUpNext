export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Create an account</h1>
          <p className="text-gray-500 mt-2">Authentication isn’t configured yet. This page is a placeholder.</p>
        </div>
        <div className="space-y-3">
          <button className="w-full btn btn-primary" disabled>
            Continue
          </button>
          <p className="text-xs text-center text-gray-500">We’ll enable sign-up once auth is wired.</p>
        </div>
      </div>
    </div>
  );
}
