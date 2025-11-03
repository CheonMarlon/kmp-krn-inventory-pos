import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Inventory.css";
import { supabase } from "../../supabaseClient";
import {
  Plus,
  Trash,
  Save,
  X,
  PackagePlus,
  Search,
  Pencil,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";

const ITEMS_PER_PAGE = 6;

const Inventory = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [form, setForm] = useState({
    product_name: "",
    category: "",
    unit_price: "",
    stock_quantity: "",
    status: "Available",
  });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addStockValue, setAddStockValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch products
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });
    if (error) console.error(error);
    else {
      setProducts(data || []);
      setFiltered(data || []);
      setCurrentPage(1);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) alert("❌ Logout failed");
    else navigate("/login");
  };

  // Search filter
  useEffect(() => {
    if (!search.trim()) setFiltered(products);
    else {
      const lower = search.toLowerCase();
      setFiltered(
        products.filter(
          (p) =>
            p.product_name.toLowerCase().includes(lower) ||
            p.category?.toLowerCase().includes(lower)
        )
      );
      setCurrentPage(1);
    }
  }, [search, products]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset form
  const resetForm = () => {
    setForm({
      product_name: "",
      category: "",
      unit_price: "",
      stock_quantity: "",
      status: "Available",
    });
    setEditingId(null);
  };

  // Add or update product
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.product_name || !form.unit_price || !form.stock_quantity) {
      return alert("Please fill in all required fields.");
    }

    setLoading(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from("products")
          .update({
            product_name: form.product_name,
            category: form.category,
            unit_price: Number(form.unit_price),
            stock_quantity: Number(form.stock_quantity),
            status: form.status,
          })
          .eq("id", editingId);
        if (error) throw error;
        alert("✅ Product updated!");
      } else {
        const { error } = await supabase.from("products").insert([
          {
            product_name: form.product_name,
            category: form.category,
            unit_price: Number(form.unit_price),
            stock_quantity: Number(form.stock_quantity),
            status: form.status,
          },
        ]);
        if (error) throw error;
        alert("🆕 Product added!");
      }
      resetForm();
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("❌ Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Edit
  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      product_name: product.product_name,
      category: product.category,
      unit_price: product.unit_price,
      stock_quantity: product.stock_quantity,
      status: product.status,
    });
    setShowModal(true);
  };

  // Delete
  const handleDelete = async (product) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", product.id);
    if (error) {
      console.error(error);
      alert("❌ Failed to delete product.");
    } else {
      alert("🗑️ Product deleted.");
      setSelectedProduct(null);
      fetchProducts();
    }
  };

  // Open Stock Modal
  const openStockModal = () => {
    if (!selectedProduct) return alert("Select a product first.");
    setAddStockValue("");
    setShowStockModal(true);
  };

  // Add stock
  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!addStockValue || Number(addStockValue) <= 0) return alert("Enter a valid amount.");
    const newStock = Number(selectedProduct.stock_quantity) + Number(addStockValue);
    const newStatus = newStock > 0 ? "Available" : "Out of Stock";
    const { error } = await supabase
      .from("products")
      .update({ stock_quantity: newStock, status: newStatus })
      .eq("id", selectedProduct.id);

    if (error) {
      console.error(error);
      alert("❌ Failed to update stock.");
    } else {
      alert(`📦 Added ${addStockValue} stock to ${selectedProduct.product_name}`);
      setShowStockModal(false);
      fetchProducts();
    }
  };

  return (
    <div className="inventory-layout">
      <h1 className="inv-title">Kampo Karne Inventory</h1>

      {/* Navigation */}
      <div className="inventory-nav">
        <div className="nav-center">
          <button className="nav-btn" onClick={() => navigate("/pos")}>
            🛒 POS
          </button>
          <button className="nav-btn" onClick={() => navigate("/dashboard")}>
            📊 Dashboard
          </button>
        </div>
        <div className="nav-right">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <hr className="nav-hr" />

      <div className="inventory-main">
        {/* LEFT: Product Table */}
        <div className="inventory-table-container">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No products found.
                  </td>
                </tr>
              ) : (
                currentItems.map((p) => (
                  <tr
                    key={p.id}
                    className={selectedProduct?.id === p.id ? "selected-row" : ""}
                    onClick={() => setSelectedProduct(p)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{p.id}</td>
                    <td>{p.product_name}</td>
                    <td>{p.category}</td>
                    <td>₱{p.unit_price}</td>
                    <td>{p.stock_quantity}</td>
                    <td className={p.status === "Out of Stock" ? "status-out" : "status-avail"}>
                      {p.status}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Page number */}
          {totalPages > 1 && (
            <div className="page-number">
              Page {currentPage} of {totalPages}
            </div>
          )}
        </div>

        {/* RIGHT: Controls */}
        <div className="inventory-controls">
          {/* Search */}
          <div className="search-bar">
            <Search color="black" />
            <input
              type="text"
              placeholder="Search product or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Add Product */}
          <button className="add-btn" onClick={() => setShowModal(true)}>
            <Plus color="black" /> Add Product
          </button>

          {/* Selected Product Card + Actions */}
          {selectedProduct && (
            <div className="selected-product-card">
              <h4>{selectedProduct.product_name}</h4>
              <p>Category: {selectedProduct.category}</p>
              <p>Price: ₱{selectedProduct.unit_price}</p>
              <p>Stock: {selectedProduct.stock_quantity}</p>
              <p>
                Status:{" "}
                <span
                  className={
                    selectedProduct.status === "Out of Stock" ? "status-out" : "status-avail"
                  }
                >
                  {selectedProduct.status}
                </span>
              </p>

              <div className="control-actions">
                <button className="stock-btn" onClick={openStockModal}>
                  <PackagePlus size={16} /> Add Stock
                </button>
                <button className="edit-btn" onClick={() => handleEdit(selectedProduct)}>
                  <Pencil size={16} /> Edit
                </button>
                <button className="delete-btn" onClick={() => handleDelete(selectedProduct)}>
                  <Trash size={16} /> Delete
                </button>
              </div>
            </div>
          )}

          {/* Pagination Buttons */}
          {totalPages > 1 && (
            <div className="pagination-controls">
              <button
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft /> Prev
              </button>
              <button
                className="page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next <ChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PRODUCT MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingId ? "Edit Product" : "Add Product"}</h2>
            <form onSubmit={handleSubmit} className="modal-form">
              <input
                type="text"
                placeholder="Product Name"
                value={form.product_name}
                onChange={(e) => setForm({ ...form, product_name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
              <input
                type="number"
                placeholder="Unit Price"
                value={form.unit_price}
                onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Stock Quantity"
                value={form.stock_quantity}
                onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                required
              />
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="Available">Available</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>

              <div className="modal-actions">
                <button type="submit" disabled={loading}>
                  <Save color="black" /> {editingId ? "Save Changes" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  <X color="black" /> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD STOCK MODAL */}
      {showStockModal && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add Stock – {selectedProduct.product_name}</h2>
            <form onSubmit={handleAddStock} className="modal-form">
              <p>Current Stock: {selectedProduct.stock_quantity}</p>
              <input
                type="number"
                min="1"
                placeholder="Enter amount to add"
                value={addStockValue}
                onChange={(e) => setAddStockValue(e.target.value)}
                required
              />
              <div className="modal-actions">
                <button type="submit">
                  <Save color="black" /> Save
                </button>
                <button type="button" onClick={() => setShowStockModal(false)}>
                  <X color="black" /> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
