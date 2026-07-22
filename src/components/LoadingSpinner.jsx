export default function LoadingSpinner({ size = 'h-12 w-12' }) {
  return (
    <div className="flex justify-center items-center">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${size}`}></div>
    </div>
  );
}