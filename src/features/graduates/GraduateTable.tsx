import { Trash2, MessageSquare, ExternalLink } from 'lucide-react';
import EmptyState from '@/shared/components/EmptyState';
import { countryNameFor } from './countries';
import {
  ATTIRE_LABELS,
  GENDER_LABELS,
  SHIRT_SIZE_LABELS,
  VERIFICATION_LABELS,
  type GraduateRow,
} from './types';

function whatsappHref(number: string | null): string | null {
  return number ? `https://wa.me/${number}` : null;
}

export default function GraduateTable({
  graduates,
  emptyMessage,
  deletingId,
  onRequestDelete,
}: {
  graduates: GraduateRow[];
  emptyMessage: string;
  deletingId: string | null;
  onRequestDelete: (graduate: GraduateRow) => void;
}) {
  if (graduates.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white/70 shadow-sm backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200/80 bg-gray-50/50 text-xs uppercase font-semibold text-gray-500 tracking-wider">
              <th className="whitespace-nowrap px-4 py-3.5 w-12 text-center">No.</th>
              <th className="whitespace-nowrap px-4 py-3.5">Nama Lengkap</th>
              <th className="whitespace-nowrap px-4 py-3.5">Jenis Kelamin</th>
              <th className="whitespace-nowrap px-4 py-3.5">Asal Negara</th>
              <th className="whitespace-nowrap px-4 py-3.5">WhatsApp</th>
              <th className="whitespace-nowrap px-4 py-3.5">Atribut Wisuda</th>
              <th className="whitespace-nowrap px-4 py-3.5">Ukuran Baju</th>
              <th className="whitespace-nowrap px-4 py-3.5">Status Berkas</th>
              <th className="whitespace-nowrap px-4 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {graduates.map((g, index) => {
              const href = whatsappHref(g.whatsapp_number);
              const isDeleting = deletingId === g.id;

              return (
                <tr
                  key={g.id}
                  className="group transition-colors duration-150 hover:bg-slate-50/80"
                >
                  {/* Nomor */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-center text-xs font-medium text-gray-400">
                    {index + 1}
                  </td>

                  {/* Nama Lengkap */}
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col">
                      <span
                        dir="rtl"
                        className="text-right font-semibold text-gray-900 text-base leading-snug font-['Amiri',serif]"
                      >
                        {g.full_name_ar ?? g.full_name}
                      </span>
                      {g.full_name_ar && (
                        <span className="text-right text-xs text-gray-400 font-normal">
                          {g.full_name}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Jenis Kelamin */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-gray-600">
                    {g.gender ? GENDER_LABELS[g.gender] : <span className="text-gray-300">—</span>}
                  </td>

                  {/* Asal Negara */}
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <span dir="rtl" className="text-gray-800 font-medium font-['Amiri',serif] text-base">
                      {countryNameFor(g.country_code)}
                    </span>
                  </td>

                  {/* WhatsApp */}
                  <td className="whitespace-nowrap px-4 py-3.5">
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md border border-[#7A1E33]/20 bg-[#7A1E33]/5 px-2.5 py-1 text-xs font-medium text-[#7A1E33] transition-all hover:bg-[#7A1E33] hover:text-white"
                      >
                        <MessageSquare className="h-3 w-3" />
                        <span>{g.whatsapp_number}</span>
                        <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                      </a>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>

                  {/* Atribut Wisuda */}
                  <td className="whitespace-nowrap px-4 py-3.5">
                    {g.attire ? (
                      <span className="inline-flex items-center rounded-md bg-[#7A1E33]/10 px-2.5 py-1 text-xs font-medium text-[#7A1E33] ring-1 ring-inset ring-[#7A1E33]/20">
                        {ATTIRE_LABELS[g.attire]}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>

                  {/* Ukuran Baju */}
                  <td className="whitespace-nowrap px-4 py-3.5">
                    {g.shirt_size ? (
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700 border border-gray-200">
                        {SHIRT_SIZE_LABELS[g.shirt_size]}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>

                  {/* Status Berkas */}
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        g.verification_status === 'done'
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                          : 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          g.verification_status === 'done' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                      {VERIFICATION_LABELS[g.verification_status]}
                    </span>
                  </td>

                  {/* Aksi */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-right">
                    <button
                      onClick={() => onRequestDelete(g)}
                      disabled={isDeleting}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Hapus Wisudawan"
                    >
                      <Trash2 className={`h-3.5 w-3.5 ${isDeleting ? 'animate-pulse' : ''}`} />
                      <span>{isDeleting ? 'Menghapus...' : 'Hapus'}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}