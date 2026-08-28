export default function ErrorState({ message = 'Terjadi kesalahan.' }: { message?: string }) {
  return <div className="py-12 text-center text-sm text-red-600">{message}</div>;
}