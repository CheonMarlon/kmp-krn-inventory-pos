import React, { useEffect, useState } from "react";
import "./VoidOrders.css";
import { supabase } from "../../microservices/supabaseClient";
import { X } from "lucide-react";

const VoidOrders = ({ onClose }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch only recent non-voided orders
  const fetchRecentOrders = async () => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .gte("order_date", oneWeekAgo.toISOString())
        .neq("status", "Voided")
        .order("order_date", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error("❌ Error fetching recent orders:", err.message);
    }
  };

  // ✅ Fetch order details (with joined product info)
  const fetchOrderDetails = async (orderId) => {
    try {
      const { data, error } = await supabase
        .from("order_details")
        .select("*, products(product_name, stock_quantity)")
        .eq("order_id", orderId);

      if (error) throw error;
      setOrderDetails(data || []);
    } catch (err) {
      console.error("❌ Error fetching order details:", err.message);
    }
  };

  // ✅ Void an order (restore stock + remove from dashboard)
  const voidOrder = async () => {
    if (!selectedOrder) return;
    const confirmVoid = window.confirm(
      `Are you sure you want to void Order #${selectedOrder.order_number}?`
    );
    if (!confirmVoid) return;

    setLoading(true);

    try {
      console.log("🧾 Attempting to void order:", selectedOrder);

      // Step 1: Mark order as voided
      const { error: orderError } = await supabase
        .from("orders")
        .update({ status: "Voided" })
        .eq("id", Number(selectedOrder.id)); // ✅ ensure numeric id

      if (orderError) throw orderError;

      console.log(`✅ Order #${selectedOrder.order_number} status updated to "Voided"`);

      // Step 2: Restore stock quantities
      for (let detail of orderDetails) {
        const productId = detail.product_id;
        const qty = detail.quantity;

        const { data: productData, error: fetchError } = await supabase
          .from("products")
          .select("stock_quantity")
          .eq("id", productId)
          .single();

        if (fetchError) throw fetchError;

        const newStock = (productData?.stock_quantity || 0) + qty;

        const { error: updateError } = await supabase
          .from("products")
          .update({
            stock_quantity: newStock,
            status: newStock > 0 ? "In Stock" : "Out of Stock",
            last_updated: new Date().toISOString(),
          })
          .eq("id", productId);

        if (updateError) throw updateError;

        console.log(`↩️ Restored ${qty} units for product ID ${productId}`);
      }

      // Step 3: Remove related sales record (if exists)
      const { error: deleteSalesError } = await supabase
        .from("sales")
        .delete()
        .eq("order_id", selectedOrder.id);

      if (deleteSalesError) {
        console.warn("⚠️ No sales data found for this order. Skipping delete.");
      } else {
        console.log(`🗑️ Removed sales record for order ID ${selectedOrder.id}`);
      }

      // Step 4: Refresh the list and reset state
      alert(`✅ Order #${selectedOrder.order_number} has been voided successfully.`);
      setSelectedOrder(null);
      setOrderDetails([]);
      fetchRecentOrders();
    } catch (err) {
      console.error("❌ Error voiding order:", err.message);
      alert("❌ Failed to void the order. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentOrders();
  }, []);

  return (
    <div className="void-overlay" onClick={onClose}>
      <div className="void-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <X />
        </button>

        <h2>🧾 Void Orders (Past 7 Days)</h2>

        {!selectedOrder ? (
          <div className="order-list">
            {orders.length === 0 ? (
              <p className="empty">No recent orders found.</p>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="order-item"
                  onClick={() => {
                    console.log("📦 Selected order:", order);
                    setSelectedOrder(order);
                    fetchOrderDetails(order.id);
                  }}
                >
                  <div>
                    <strong>{order.order_number}</strong>
                    <p>₱{Number(order.total_amount).toLocaleString()}</p>
                  </div>
                  <small>{new Date(order.order_date).toLocaleString()}</small>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="order-details">
            <button className="back-btn" onClick={() => setSelectedOrder(null)}>
              ← Back to Orders
            </button>

            <h3>
              {selectedOrder.order_number} – ₱
              {Number(selectedOrder.total_amount).toLocaleString()}
            </h3>

            <div className="detail-list">
              {orderDetails.length === 0 ? (
                <p>Loading order details...</p>
              ) : (
                orderDetails.map((d) => (
                  <div key={d.id} className="detail-item">
                    <span>{d.products?.product_name}</span>
                    <span>x{d.quantity}</span>
                  </div>
                ))
              )}
            </div>

            <button className="void-btn" onClick={voidOrder} disabled={loading}>
              {loading ? "Voiding..." : "Void This Order"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoidOrders;
