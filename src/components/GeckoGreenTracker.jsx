import React, { useState, useMemo } from 'react';
import { DollarSign, TrendingUp, Plus, Trash2, Award } from 'lucide-react';

export default function SimpleCommissionCalculator() {
  const [sales, setSales] = useState([]);
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState(null);

  const tiers = [
    { threshold: 3000, rate: 0.03 },
    { threshold: 4000, rate: 0.04 },
    { threshold: 5000, rate: 0.05 },
    { threshold: 6000, rate: 0.06 },
    { threshold: 7000, rate: 0.07 },
    { threshold: 8000, rate: 0.08 },
    { threshold: 9000, rate: 0.09 },
  ];

  const getCurrentTier = (revenue) => {
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (revenue >= tiers[i].threshold) return tiers[i];
    }
    return null;
  };

  const getPrepayPercentage = (sales) => {
    if (sales.length === 0) return 0;
    const prepayCount = sales.filter(s => s.paymentType === 'Prepay').length;
    return (prepayCount / sales.length) * 100;
  };

  const getPrepayBonus = (sales, revenue) => {
    const tier = getCurrentTier(revenue);
    if (!tier) return 0;
    const prepayPercent = getPrepayPercentage(sales);
    if (prepayPercent >= 40) return 0.03;
    if (prepayPercent >= 25) return 0.02;
    return 0;
  };

  const totalRevenue = useMemo(
    () => sales.reduce((sum, s) => sum + s.amount, 0),
    [sales]
  );

  const currentTier = getCurrentTier(totalRevenue);
  const prepayBonus = getPrepayBonus(sales, totalRevenue);
  const totalRate = (currentTier?.rate || 0) + prepayBonus;
  const totalCommission = totalRevenue * totalRate;
  const prepayPercent = getPrepayPercentage(sales);

  const addSale = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !paymentType) return;
    setSales([...sales, { id: Date.now(), amount: amt, paymentType }]);
    setAmount('');
    setPaymentType(null);
  };

  const deleteSale = (id) => setSales(sales.filter(s => s.id !== id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-6">
        <h1 className="text-3xl font-bold text-green-700 mb-4 text-center">
          Gecko Green Calculator 🦎
        </h1>

        {/* Add Sale */}
        <div className="mb-6">
          <div className="flex gap-2 mb-3">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Sale amount"
              className="flex-1 border-2 border-gray-200 rounded-xl p-3 focus:border-green-500"
            />
          </div>

          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setPaymentType('Ezpay')}
              className={`flex-1 p-3 rounded-xl border-2 font-medium ${
                paymentType === 'Ezpay'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200'
              }`}
            >
              Ezpay
            </button>
            <button
              onClick={() => setPaymentType('Prepay')}
              className={`flex-1 p-3 rounded-xl border-2 font-medium ${
                paymentType === 'Prepay'
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200'
              }`}
            >
              Prepay ⭐
            </button>
          </div>

          <button
            onClick={addSale}
            disabled={!paymentType || !amount}
            className={`w-full py-3 rounded-xl font-medium transition-all ${
              paymentType && amount
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-black hover:from-green-600 hover:to-emerald-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Plus className="inline w-5 h-5 mr-2" />
            Add Sale
          </button>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <DollarSign className="mx-auto w-5 h-5 mb-1" />
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-green-700">
              ${totalRevenue.toLocaleString()}
            </p>
          </div>

          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <TrendingUp className="mx-auto w-5 h-5 mb-1" />
            <p className="text-sm text-gray-600">Commission</p>
            <p className="text-2xl font-bold text-purple-700">
              ${totalCommission.toFixed(0)}
            </p>
          </div>
        </div>

        {/* Rate Info */}
        <div className="bg-amber-50 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-1">
            <p className="font-semibold text-gray-700">Current Rate</p>
            <p className="font-bold text-green-700">
              {(currentTier?.rate || 0) * 100}%
              {prepayBonus > 0 && (
                <span className="text-amber-600"> +{prepayBonus * 100}%</span>
              )}
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Prepay Rate: {prepayPercent.toFixed(0)}%
          </p>
        </div>

        {/* Sales List */}
        {sales.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-4">
            <h2 className="font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <Award className="w-4 h-4" /> Sales
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sales.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between bg-white rounded-lg p-3 border"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      ${s.amount.toLocaleString()}
                    </p>
                    <p
                      className={`text-xs ${
                        s.paymentType === 'Prepay'
                          ? 'text-amber-600'
                          : 'text-blue-600'
                      }`}
                    >
                      {s.paymentType}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteSale(s.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
