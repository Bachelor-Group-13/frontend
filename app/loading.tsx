/**
 * A loading spinner component.
 * Used as a fallback UI during page transitions and data fetching.
 *
 * @returns {JSX.Element} The rendered loading spinner
 */
export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500" />
    </div>
  );
}
