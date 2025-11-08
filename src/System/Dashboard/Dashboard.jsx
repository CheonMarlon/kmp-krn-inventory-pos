import React, { useEffect, useState } from "react";
import { supabase } from "../../microservices/supabaseClient";
import { Printer } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "./Dashboard.css";

const Dashboard = () => {
  const [sales, setSales] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [filter, setFilter] = useState("month");
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalQty: 0,
    avgOrder: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchSales();
  }, [filter]);

  // === FETCH SALES DATA ===
  const fetchSales = async () => {
    const now = new Date();
    let fromDate = new Date();

    // === Determine date range based on filter ===
    switch (filter) {
      case "day":
        fromDate.setHours(0, 0, 0, 0);
        now.setHours(23, 59, 59, 999);
        break;
      case "week": {
        const currentDay = now.getDay();
        const diffToMonday = currentDay === 0 ? 6 : currentDay - 1;
        fromDate.setDate(now.getDate() - diffToMonday);
        fromDate.setHours(0, 0, 0, 0);
        now.setDate(fromDate.getDate() + 6);
        now.setHours(23, 59, 59, 999);
        break;
      }
      case "month":
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
        now.setMonth(now.getMonth() + 1, 0);
        now.setHours(23, 59, 59, 999);
        break;
      case "year":
        fromDate = new Date(now.getFullYear(), 0, 1);
        now.setFullYear(now.getFullYear(), 11, 31);
        now.setHours(23, 59, 59, 999);
        break;
      default:
        break;
    }

    // === Fetch only COMPLETED orders (exclude voided/cancelled) ===
    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, total_amount, order_date, status")
      .gte("order_date", fromDate.toISOString())
      .lte("order_date", now.toISOString())
      .eq("status", "Completed"); // ✅ ensures voided orders are ignored

    if (error) {
      console.error(error);
      return;
    }

    if (!orders || orders.length === 0) {
      setSales([]);
      setTopItems([]);
      setSummary({ totalSales: 0, totalOrders: 0, totalQty: 0, avgOrder: 0 });
      return;
    }

    const totalSales = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const totalOrders = orders.length;
    const avgOrder = totalOrders ? totalSales / totalOrders : 0;
    const orderIds = orders.map((o) => o.id);

    // === Fetch order details for item quantities ===
    const { data: details, error: detailsErr } = await supabase
      .from("order_details")
      .select("order_id, product_id, quantity")
      .in("order_id", orderIds);

    if (detailsErr) {
      console.error(detailsErr);
      return;
    }

    const totalQty = details.reduce((sum, d) => sum + d.quantity, 0);

    const grouped = details.reduce((acc, d) => {
      acc[d.product_id] = (acc[d.product_id] || 0) + d.quantity;
      return acc;
    }, {});

    const top = Object.entries(grouped)
      .map(([product_id, qty]) => ({ product_id, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    const ids = top.map((t) => t.product_id);
    const { data: products } = await supabase
      .from("products")
      .select("id, product_name")
      .in("id", ids);

    const topItemsData = top.map((t) => {
      const prod = products?.find((p) => String(p.id) === String(t.product_id));
      return {
        name: prod ? prod.product_name : `Product #${t.product_id}`,
        qty: t.qty,
      };
    });

    // === Build trend data for chart ===
    const trendData = {};
    orders.forEach((o) => {
      const dateObj = new Date(o.order_date);
      let key;
      if (filter === "day") key = `${String(dateObj.getHours()).padStart(2, "0")}:00`;
      else if (filter === "week") key = dateObj.toLocaleDateString([], { weekday: "short" });
      else if (filter === "month") key = `Week ${Math.ceil(dateObj.getDate() / 7)}`;
      else if (filter === "year") key = dateObj.toLocaleString("default", { month: "short" });
      else key = dateObj.toLocaleDateString();
      trendData[key] = (trendData[key] || 0) + Number(o.total_amount);
    });

    let orderedTrend = [];
    if (filter === "day") {
      const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);
      orderedTrend = hours.map((hour) => ({ date: hour, amount: trendData[hour] || 0 }));
    } else if (filter === "week") {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      orderedTrend = days.map((day) => ({ date: day, amount: trendData[day] || 0 }));
    } else if (filter === "month") {
      const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
      orderedTrend = weeks.map((wk) => ({ date: wk, amount: trendData[wk] || 0 }));
    } else if (filter === "year") {
      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
      orderedTrend = months.map((m) => ({ date: m, amount: trendData[m] || 0 }));
    } else {
      orderedTrend = Object.entries(trendData).map(([label, amount]) => ({
        date: label,
        amount,
      }));
    }

    setSales(orderedTrend);
    setTopItems(topItemsData);
    setSummary({ totalSales, totalOrders, totalQty, avgOrder });
  };

  // === EXPORT PDF REPORT ===
  const handlePrint = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("KAMPO KARNE K MART", pageWidth / 2, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text("Sales Report Summary", pageWidth / 2, 28, { align: "center" });
    doc.text(`Filter: ${filter.toUpperCase()}`, 14, 40);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 46);

    autoTable(doc, {
      startY: 60,
      head: [["Total Sales", "Total Orders", "Items Sold", "Average Order"]],
      body: [[
        summary.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 }),
        summary.totalOrders,
        summary.totalQty,
        summary.avgOrder.toLocaleString(undefined, { minimumFractionDigits: 2 }),
      ]],
      theme: "grid",
      headStyles: { fillColor: [40, 53, 147] },
    });

    const topY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text("Top-Selling Products", 14, topY - 5);
    autoTable(doc, {
      startY: topY,
      head: [["Product Name", "Quantity Sold"]],
      body: topItems.map((t) => [t.name, t.qty]),
      theme: "grid",
      headStyles: { fillColor: [76, 175, 80] },
    });

    const trendY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text("Sales Trend", 14, trendY - 5);
    autoTable(doc, {
      startY: trendY,
      head: [[
        filter === "day" ? "Time" :
        filter === "week" ? "Day" :
        filter === "month" ? "Week" : "Month",
        "Total Sales (₱)"
      ]],
      body: sales.map((s) => [
        s.date,
        s.amount.toLocaleString(undefined, { minimumFractionDigits: 2 }),
      ]),
      theme: "grid",
      headStyles: { fillColor: [33, 150, 243] },
    });

    doc.save(`KampoKarne_Sales_Report_${filter}_${Date.now()}.pdf`);
  };

  // === LOGOUT ===
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout failed:", error.message);
      return;
    }
    navigate("/");
  };

  return (
    <div className="dashboard-container">
    {/* === TITLE === */}
    <h1 className="inv-title">Kampo Karne Dashboard</h1>

    <div className="inventory-nav">
      <div className="nav-center">
        <button className="nav-btn" onClick={() => navigate("/inventory")}>
          Go to Inventory
        </button>
        <button className="nav-btn" onClick={() => navigate("/pos")}>
          Go to POS
        </button>
        <button className="nav-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </div>

      <hr className="nav-hr" />

      <div className="action">
          <div className="filter">
            <label>Filter:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>

          <button className="print-btn" onClick={handlePrint}>
            <Printer /> Export PDF
          </button>
      </div>

      {/* === SUMMARY === */}
      <section className="summary-grid">
        <div className="card">
          <h3>Total Sales</h3>
          <p>₱{summary.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="card">
          <h3>Total Orders</h3>
          <p>{summary.totalOrders}</p>
        </div>
        <div className="card">
          <h3>Items Sold</h3>
          <p>{summary.totalQty}</p>
        </div>
        <div className="card">
          <h3>Avg. Order Value</h3>
          <p>₱{summary.avgOrder.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
      </section>

      {/* === SALES TREND CHART === */}
      <section className="chart-section">
        <h2>📈 Sales Trend</h2>
        {sales.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>No sales data available.</p>
        )}
      </section>

      {/* === TOP PRODUCTS === */}
      <section className="chart-section">
        <h2>🔥 Top-Selling Products</h2>
        {topItems.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topItems}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="qty" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p>No top products yet.</p>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
