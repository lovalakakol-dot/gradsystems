'use client';

import { useState, type FormEvent } from 'react';
import Input from '@/shared/components/Input';
import Select from '@/shared/components/Select';
import Button from '@/shared/components/Button';
import InlineAlert from '@/shared/components/InlineAlert';
import { useRabItemMutations } from './Userabitemmutations';
import { DIVISIONS, type Division, type Currency } from './types';

const CURRENCIES: Currency[] = ['EGP', 'IDR'];

export default function RABForm({ onSuccess }: { onSuccess: () => void }) {
  const { createRabItem, isCreating } = useRabItemMutations();

  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [division, setDivision] = useState<Division>(DIVISIONS[0]);
  const [currency, setCurrency] = useState<Currency>('IDR');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const quantityNum = Number(quantity);
    const costNum = Number(estimatedCost);

    if (!itemName.trim()) {
      setFormError('Nama item anggaran wajib diisi.');
      return;
    }
    if (!Number.isFinite(quantityNum) || quantityNum <= 0) {
      setFormError('Quantity harus lebih besar dari 0.');
      return;
    }
    if (!unit.trim()) {
      setFormError('Unit wajib diisi.');
      return;
    }
    if (!Number.isFinite(costNum) || costNum <= 0) {
      setFormError('Estimasi biaya harus lebih besar dari 0.');
      return;
    }

    // estimated_cost is the item's TOTAL estimate, entered
    // directly by the user — never computed as quantity × a
    // per-unit price, since unit_price does not exist in the
    // database by design (Step 7).
    const { error } = await createRabItem({
      item_name: itemName.trim(),
      quantity: quantityNum,
      unit: unit.trim(),
      division,
      currency,
      estimated_cost: costNum,
      description: description.trim() || null,
    });

    if (error) {
      setFormError(error);
      return;
    }

    setItemName('');
    setQuantity('');
    setUnit('');
    setEstimatedCost('');
    setDescription('');
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        label="Nama Item Anggaran"
        value={itemName}
        onChange={(e) => setItemName(e.target.value)}
        disabled={isCreating}
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Quantity"
          type="number"
          step="0.01"
          min="0"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          disabled={isCreating}
          required
        />
        <Input
          label="Unit"
          placeholder="Pcs, Kg, Liter, ..."
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          disabled={isCreating}
          required
        />
      </div>
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
          label="Estimasi Biaya"
          type="number"
          step="0.01"
          min="0"
          value={estimatedCost}
          onChange={(e) => setEstimatedCost(e.target.value)}
          disabled={isCreating}
          required
        />
      </div>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-gray-700">Catatan/Keterangan</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isCreating}
          rows={3}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#7A1E33] focus:outline-none focus:ring-1 focus:ring-[#7A1E33] disabled:opacity-60"
        />
      </label>

      {formError && <InlineAlert message={formError} />}

      <Button type="submit" isLoading={isCreating} className="w-full">
        {isCreating ? 'Menyimpan...' : 'Tambah Item'}
      </Button>
    </form>
  );
}