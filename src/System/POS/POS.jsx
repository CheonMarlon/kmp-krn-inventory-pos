import React, { useEffect, useState } from "react";
import "./POS.css";
import { supabase } from "../../microservices/supabaseClient";
import { X, Printer, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import VoidOrders from "../VoidOrders/VoidOrders";

const POS = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [cart, setCart] = useState([]);
  const [qtyInput, setQtyInput] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const [showVoid, setShowVoid] = useState(false);

  const categories = [
    "All",
    "Meats",
    "Chilled Sauce and Side Dish",
    "Drinks",
    "Groceries",
    "Hotpot",
  ];

  // 🧠 Fetch products from Supabase
  const fetchItems = async () => {
    try {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error("Error fetching products:", err.message);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // 🛒 Add item to cart
  const addToCart = (item, qty) => {
    if (!qty || qty < 1) return alert("Quantity must be at least 1");
    if (qty > item.stock_quantity)
      return alert(`Cannot add more than ${item.stock_quantity} in stock`);

    const existing = cart.find((c) => c.id === item.id);
    if (existing) {
      setCart(
        cart.map((c) =>
          c.id === item.id
            ? { ...c, quantity: Math.min(c.quantity + qty, item.stock_quantity) }
            : c
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: qty }]);
    }

    setSelectedItem(null);
    setQtyInput(1);
  };

  const removeItem = (id) => setCart(cart.filter((c) => c.id !== id));

  // 💰 Total calculation
  const total = cart.reduce(
    (acc, c) => acc + (Number(c.unit_price) || 0) * c.quantity,
    0
  );

  // ✅ Handle checkout
  const handleSubmit = async () => {
    if (cart.length === 0) return alert("🛒 No items in the cart.");

    setLoading(true);

    try {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([{ total_amount: total }])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderId = orderData.id;

      const orderDetails = cart.map((item) => ({
        order_id: orderId,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
      }));

      const { error: detailsError } = await supabase
        .from("order_details")
        .insert(orderDetails);

      if (detailsError) throw detailsError;

      for (let item of cart) {
        const newStock = item.stock_quantity - item.quantity;
        const newStatus = newStock <= 0 ? "Out of Stock" : "In Stock";

        const { error: stockError } = await supabase
          .from("products")
          .update({
            stock_quantity: newStock,
            status: newStatus,
            last_updated: new Date().toISOString(),
          })
          .eq("id", item.id);

        if (stockError) throw stockError;
      }

      alert(`🧾 Transaction complete! Order #${orderData.order_number}`);
      setCart([]);
      await fetchItems();
    } catch (err) {
      console.error("⚠️ Error completing transaction:", err.message);
      alert("Something went wrong during the transaction.");
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Filter items by category
  const filteredItems =
    selectedCategory === "All"
      ? items
      : items.filter((i) => i.category === selectedCategory);

  // 🔒 Logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("❌ Logout failed");
      console.error(error);
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="pos-layout">
      {/* LEFT PANEL */}
      <div className="pos-left">
        <header className="pos-header">
          <h1 className="pos-title">POS SYSTEM</h1>
          <button className="pos-nav" onClick={() => navigate("/inventory")}>
            Go to Inventory
          </button>
          <button className="pos-nav" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </header>

        {/* CATEGORY BAR */}
        <div className="category-bar">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-btn ${
                selectedCategory === cat ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* PRODUCT GRID */}
        <div className="product-grid">
          {filteredItems.length === 0 ? (
            <p className="empty">No products found in this category.</p>
          ) : (
            filteredItems.map((i) => {
              const price = Number(i.unit_price) || 0;
              return (
                <div
                  key={i.id}
                  className={`product-card ${
                    i.status === "Out of Stock" ? "sold-out" : ""
                  }`}
                  onClick={() => {
                    if (i.status !== "Out of Stock") {
                      setSelectedItem(i);
                      setQtyInput(1);
                    }
                  }}
                >
              {/* IMAGE */}
              <img
                src={i.img_url || "/src/assets/stickers/placeholder.png"}
                alt={i.product_name}
                className="product-image"
              />


                  <h3>{i.product_name}</h3>
                  <p>₱{price.toLocaleString()}</p>
                  {i.status === "Out of Stock" && (
                    <span className="sold-out-badge">SOLD OUT</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="pos-right">
        <h2>Receipt</h2>
        <div className="receipt-list">
          {cart.length === 0 ? (
            <p className="empty">No items yet</p>
          ) : (
            cart.map((c) => (
              <div className="receipt-item" key={c.id}>
                <div className="info">
                  <strong>{c.product_name}</strong>
                  <small>
                    ₱{Number(c.unit_price)} × {c.quantity}
                  </small>
                </div>
                <div className="price">
                  ₱{((Number(c.unit_price) || 0) * c.quantity).toLocaleString()}
                </div>
                <button className="remove-btn" onClick={() => removeItem(c.id)}>
                  <X size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="receipt-footer">
          <h3>Total: ₱{total.toLocaleString()}</h3>
          <div className="func-btn">
              <button
                className="print-btn"
                onClick={handleSubmit}
                disabled={loading}
              >
                <Printer />
                {loading ? "Processing..." : "Print / Submit"}
              </button>

              <button className="void-order-btn" onClick={() => setShowVoid(true)}>
                Void Order
              </button>

              {showVoid && <VoidOrders onClose={() => setShowVoid(false)} />}
          </div>


        </div>
      </div>

      {/* MODAL */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-modal"
              onClick={() => setSelectedItem(null)}
            >
              <X />
            </button>
            <h2>{selectedItem.product_name}</h2>
            <p>₱{Number(selectedItem.unit_price)}</p>
            <p>Available: {selectedItem.stock_quantity}</p>

            <input
              type="number"
              min="1"
              max={selectedItem.stock_quantity}
              value={qtyInput}
              onChange={(e) => setQtyInput(Number(e.target.value))}
              className="qty-input"
            />

            <button
              className="add-btn"
              onClick={() => addToCart(selectedItem, qtyInput)}
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
