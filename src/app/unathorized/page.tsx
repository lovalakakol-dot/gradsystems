export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-4 text-center">
      <h1 className="text-lg font-semibold text-gray-900">Akses ditolak</h1>
      <p className="text-sm text-gray-500">Anda tidak punya akses ke halaman ini.</p>
    </div>
  );
}