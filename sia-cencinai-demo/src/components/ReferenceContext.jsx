import React from 'react';
import { referenceIdentityRows } from '../utils/references';

export default function ReferenceContext({ context }) {
  return <dl className="grid sm:grid-cols-2 gap-x-5 gap-y-3 text-sm">
    {referenceIdentityRows(context).map(([label, value]) => <div key={label}>
      <dt className="text-xs text-stone-500">{label}</dt>
      <dd className="mt-0.5 break-words">{value || '—'}</dd>
    </div>)}
  </dl>;
}
