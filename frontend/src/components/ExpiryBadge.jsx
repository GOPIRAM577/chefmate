import React from 'react';

const ExpiryBadge = ({ expiryDate }) => {
  if (!expiryDate) return null;

  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let statusClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  let text = 'Good';

  if (diffDays < 0) {
    statusClass = 'bg-red-500/20 text-red-300 border-red-500/30';
    text = 'Expired';
  } else if (diffDays <= 2) {
    statusClass = 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    text = 'Expiring Soon';
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border backdrop-blur-sm ${statusClass}`}>
      {text} ({diffDays}d)
    </span>
  );
};

export default ExpiryBadge;
