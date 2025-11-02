import React from 'react';
import { Download } from 'lucide-react';
import { useTheme } from '../../../../../contexts/ThemeContext';
import { InvoiceItem } from '../types';

interface BillingHistorySectionProps {
  historyItems: InvoiceItem[];
  isLoading: boolean;
}

const formatAmount = (amount: number, currency: string) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

export const BillingHistorySection: React.FC<BillingHistorySectionProps> = ({
  historyItems,
  isLoading
}) => {
  const { theme } = useTheme();
  const colors = theme?.colors;

  if (!colors) return null;

  const handleDownload = (invoice: InvoiceItem) => {
    if (invoice.invoiceUrl) {
      window.open(invoice.invoiceUrl, '_blank');
    } else {
      alert('Invoice download will be available soon.');
    }
  };

  return (
    <div
      className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
      style={{
        background: colors.cardBackground,
        border: `1px solid ${colors.border}`,
      }}
    >
      <h3
        className="text-xl font-semibold mb-6"
        style={{ color: colors.primaryText }}
      >
        Billing History
      </h3>
      {isLoading ? (
        <p style={{ color: colors.secondaryText }}>Loading billing history…</p>
      ) : historyItems.length === 0 ? (
        <p style={{ color: colors.secondaryText }}>
          No invoices have been generated yet.
        </p>
      ) : (
        <div className="space-y-4">
          {historyItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-xl"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div>
                <p
                  className="font-semibold"
                  style={{ color: colors.primaryText }}
                >
                  {item.planName}
                </p>
                <p
                  className="text-sm"
                  style={{ color: colors.secondaryText }}
                >
                  {new Date(item.invoiceDate).toLocaleDateString()} • {item.status}
                </p>
              </div>
              <div className="text-right flex items-center gap-3">
                <p
                  className="font-semibold"
                  style={{ color: colors.primaryText }}
                >
                  {formatAmount(item.amount, item.currency)}
                </p>
                <button
                  className="p-2 rounded-lg transition-colors"
                  style={{
                    color: colors.primaryBlue,
                    border: `1px solid ${colors.border}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.hoverBackground;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = colors.cardBackground;
                  }}
                  onClick={() => handleDownload(item)}
                >
                  <Download size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

