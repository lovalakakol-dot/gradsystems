'use client';

import { useState, type FormEvent } from 'react';
import Input from '@/shared/components/Input';
import Select from '@/shared/components/Select';
import Button from '@/shared/components/Button';
import InlineAlert from '@/shared/components/InlineAlert';
import { useCashbookMutations } from './Usecashbookmutations';
import { DIVISIONS, TYPE_LABEL, type Division, type Currency, type TransactionType } from './types';

const CURRENCIES: Currency[] = ['EGP', 'IDR'];

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function CashbookForm({ onSuccess }: { onSuccess: () => void }) {
  const { createEntry, isCreating } = useCashbookMutations();

  const [transactionDate, setTransactionDate] = useState(todayIso());
  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [division, setDivision] = useState<Division>(DIVISIONS[0]);
  const [currency, setCurrency] = useState<Currency>('IDR');
  const [amount, setAmount] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!transactionDate) {
      setFormError('Tanggal transaksi wajib diisi.');
      return;
    }
    if (!description.trim()) {
      setFormError('Keterangan transaksi wajib diisi.');
      return;
    }

    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      setFormError('Nominal harus lebih besar dari 0.');
      return;
    }

    const trimmedUrl = attachmentUrl.trim();
    if (trimmedUrl && !isValidUrl(trimmedUrl)) {
      setFormError('Link bukti nota harus berupa URL yang valid (diawali http:// atau https://).');
      return;
    }

    // category/payment_method are NOT NULL in the database but have
    // no form field per requirement — category is genuinely derived
    // from `type` (not arbitrary); payment_method is a documented
    // fixed placeholder. amount is always stored positive — the
    // sign/direction comes from `type`, never from a negative number.
    const { error } = await createEntry({
      transaction_date: transactionDate,
      type,
      category: TYPE_LABEL[type],
      description: description.trim(),
      division,
      amount: amountNum,
      currency,
      payment_method: 'Tidak dicatat',
      attachment_url: trimmedUrl || null,
    });

    if (error) {
      setFormError(error);
      return;
    }

    setDescription('');
    setAmount('');
    setAttachmentUrl('');
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        label="Tanggal Transaksi"
        type="date"
        value={transactionDate}
        onChange={(e) => setTransactionDate(e.target.value)}
        disabled={isCreating}
        required
      />
      <Select
        label="Tipe Transaksi"
        value={type}
        onChange={(e) => setType(e.target.value as TransactionType)}
        disabled={isCreating}
      >
        <option value="income">Pemasukan</option>
        <option value="expense">Pengeluaran</option>
      </Select>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-gray-700">Keterangan Transaksi</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isCreating}
          rows={2}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#7A1E33] focus:outline-none focus:ring-1 focus:ring-[#7A1E33] disabled:opacity-60"
          required
        />
      </label>
      <Select
        label="Divisi"
        value={division}
        onChange={(e) => setDivision(e.target.value as Division)}
        disabled={isCreating}
      >
        {DIVISIONS.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </Select>
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Mata Uang"
          value={currency}
          onChange={(e) => setCurrency(e.target.value as Currency)}
          disabled={isCreating}
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Input
          label="Nominal"
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isCreating}
          required
        />
      </div>
      <Input
        label="Bukti Nota (URL Google Drive)"
        type="url"
        placeholder="https://drive.google.com/..."
        value={attachmentUrl}
        onChange={(e) => setAttachmentUrl(e.target.value)}
        disabled={isCreating}
      />

      {formError && <InlineAlert message={formError} />}

      <Button type="submit" isLoading={isCreating} className="w-full">
        {isCreating ? 'Menyimpan...' : 'Tambah Transaksi'}
      </Button>
    </form>
  );
}