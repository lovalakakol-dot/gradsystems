export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className="p-6">
      <h2 className="mb-2 text-base font-semibold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500">Fitur ini akan dibangun di tahap berikutnya.</p>
    </div>
  );
}