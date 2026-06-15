import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Save, Search } from 'lucide-react';
import { getProducts } from '../services/dataService';
import type { Product } from '../types';

const StockOut = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Stock Out Recorded: ${quantity} units removed from ${selectedProduct}`);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-xl font-bold text-black">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-red-100 text-red-600 p-2 rounded-lg">
            <ArrowUpRight size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black">Stock Outbound</h1>
            <p className="text-black text-sm">Record items leaving the warehouse</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Select Product</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select 
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black appearance-none bg-white text-black"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  required
                >
                  <option value="">Choose a product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.name}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Quantity</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black text-black"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Destination/Reference</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black text-black"
                  placeholder="Order #5678 or Customer Name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">Notes</label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black h-32 text-black"
                placeholder="Reason for stock removal..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-black">
                Cancel
              </button>
              <button type="submit" className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors font-medium">
                <Save size={20} />
                Record Stock Out
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StockOut;
