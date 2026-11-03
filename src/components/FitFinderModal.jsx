import React, { useEffect, useRef, useState } from 'react';
import { recommendProductSize } from '../engine/fitFinderEngine';
import { saveFitProfileToAPI, deleteFitProfileFromAPI } from '../services/api';

function FitDialog({
  product,
  fitProfile,
  onClose,
  onSaveProfile,
  onDeleteProfile,
  onSelectSize,
}) {
  const dialog = useRef(null);
  const [chest, setChest] = useState(fitProfile?.measurements?.chestCm ?? '');
  const [waist, setWaist] = useState(fitProfile?.measurements?.waistCm ?? '');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const values = {
    chest: chest === '' ? null : Number(chest),
    waist: waist === '' ? null : Number(waist),
  };
  const { recommendedSize } = recommendProductSize(values, product);
  useEffect(() => {
    const node = dialog.current;
    node.showModal();
    return () => node.close();
  }, []);
  async function update(remove) {
    setBusy(true);
    setNotice('');
    try {
      if (remove) {
        await deleteFitProfileFromAPI();
        onDeleteProfile?.();
        setChest('');
        setWaist('');
        setNotice('Your saved measurements were deleted.');
      } else {
        const saved = await saveFitProfileToAPI({
          ...values,
          consentGiven: true,
        });
        onSaveProfile?.(saved);
        setNotice('Measurements saved for your next visit.');
      }
    } catch (error) {
      setNotice(
        error.message || 'Unable to update measurements. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      className="fit-dialog"
      aria-labelledby="fit-title"
      onCancel={onClose}
    >
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="atelier-kicker">Atelier services / Fit</p>
          <h2 id="fit-title">Find your size</h2>
        </div>
        <button
          type="button"
          aria-label="Close fit finder"
          onClick={onClose}
          className="fit-close"
        >
          ×
        </button>
      </div>
      <p className="mt-3 text-sm">
        Measure around your body with the tape level. Enter your{' '}
        {product?.slot === 'bottom' ? 'waist' : 'chest or waist'} to compare
        with the garment chart.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          update(false);
        }}
      >
        <div className="grid grid-cols-2 gap-3 my-5">
          {[
            [chest, setChest, 'Chest', 20, 165],
            [waist, setWaist, 'Waist', 18, 160],
          ].map(([value, setter, label, min, max]) => (
            <label key={label} className="text-sm font-semibold">
              {label} (cm)
              <input
                type="number"
                min={min}
                max={max}
                step="0.1"
                value={value}
                onChange={(e) => {
                  setter(e.target.value);
                  setNotice('');
                }}
              />
            </label>
          ))}
        </div>
        <section className="fit-result" aria-live="polite">
          <p className="atelier-kicker">{product?.name || 'Size chart'}</p>
          <strong>
            {recommendedSize
              ? 'Suggested size · ' + recommendedSize
              : chest || waist
                ? 'No matching chart range'
                : 'Enter a measurement'}
          </strong>
          {recommendedSize && onSelectSize && (
            <button
              type="button"
              className="underline block mt-2"
              onClick={() => {
                onSelectSize(recommendedSize);
                onClose();
              }}
            >
              Use size {recommendedSize}
            </button>
          )}
        </section>
        <p className="mt-4 mb-2 text-xs">
          Choose Save to keep these measurements for another visit.
        </p>
        <button className="fit-action" disabled={busy || (!chest && !waist)}>
          Save my measurements
        </button>
        {fitProfile && (
          <button
            type="button"
            disabled={busy}
            className="mt-3 text-xs underline"
            onClick={() => update(true)}
          >
            Delete saved measurements
          </button>
        )}
        <p role="status" className="mt-2 text-sm">
          {notice}
        </p>
      </form>
    </dialog>
  );
}
export default function FitFinderModal({ isOpen, ...props }) {
  return isOpen ? <FitDialog {...props} /> : null;
}
