import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2,
  ArrowUpDown
} from 'lucide-react';
import { getProducts } from '../services/dataService';
import type { Product } from '../types';

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
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

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-xl font-bold text-black">Loading Inventory...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-black">Inventory Management</h1>
          <p className="text-black text-sm mt-1">Manage and track all your warehouse products</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors font-medium">
          <Plus size={20} />
          Add New Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-black rounded-lg hover:bg-gray-100 text-black transition-colors">
              <Filter size={18} />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-black rounded-lg hover:bg-gray-100 text-black transition-colors">
              <ArrowUpDown size={18} />
              Sort
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-black text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Product Info</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold text-center">Stock</th>
                <th className="px-6 py-4 font-semibold">Unit Price</th>
                <th className="px-6 py-4 font-semibold">Reorder Level</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-black">{product.name}</span>
                      <span className="text-xs text-black">{product.sku}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-black rounded text-xs font-medium">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className={`font-bold ${product.quantity <= product.reorderLevel ? 'text-red-700' : 'text-black'}`}>
                        {product.quantity}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-black font-bold">
                    €{product.unitPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-black font-medium">
                    {product.reorderLevel}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-black hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-red-700 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-black">
          <p>Showing {filteredProducts.length} of {products.length} products</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 border border-black rounded hover:bg-gray-100 text-black">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
