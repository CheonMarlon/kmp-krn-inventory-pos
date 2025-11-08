import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Stack,
  Divider,
  TextField,
  Pagination,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { motion } from "framer-motion";
import { supabase } from "../../microservices/supabaseClient";
import "./ProductShowcase.css";

function toTitleCase(str = "") {
  return str
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function ProductShowcase() {
  const [products, setProducts] = useState([]);
  const [tab, setTab] = useState(0);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const [fullImage, setFullImage] = useState(null);

  // Fetch all categories once
  const [allCategories, setAllCategories] = useState([]);

  // Load categories once from Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("category");

      if (error) {
        console.error("Error fetching categories:", error);
        return;
      }

      const normalizedSet = new Map();
      for (const p of data) {
        const cat = p?.category?.toString().trim().toUpperCase();
        if (!cat) continue;
        if (!normalizedSet.has(cat)) normalizedSet.set(cat, cat);
      }

      const normalizedArray = Array.from(normalizedSet.keys());
      const displayArray = normalizedArray.map((n) =>
        toTitleCase(n.toLowerCase())
      );

      setAllCategories(["All", ...displayArray]);
    };

    fetchCategories();
  }, []);

  const activeCategory = allCategories[tab] || "All";

  // Fetch products from Supabase with search + category filter
  useEffect(() => {
    const controller = new AbortController();
    const fetchProducts = async () => {
      setLoading(true);
      let queryBuilder = supabase
        .from("products")
        .select(
          "id, product_name, category, stock_quantity, last_updated, status, img_url"
        )
        .order("category", { ascending: true });

      // Category filter
      if (activeCategory !== "All") {
        queryBuilder = queryBuilder.ilike(
          "category",
          `%${activeCategory}%`
        );
      }

      // Search filter
      if (query.trim()) {
        queryBuilder = queryBuilder.ilike(
          "product_name",
          `%${query.trim()}%`
        );
      }

      const { data, error } = await queryBuilder;

      if (error) console.error("Error fetching products:", error);
      else setProducts(data || []);
      setLoading(false);
    };

    // debounce search to reduce API load
    const delay = setTimeout(() => {
      fetchProducts();
    }, 400);

    return () => {
      clearTimeout(delay);
      controller.abort();
    };
  }, [activeCategory, query]);

  const totalPages = Math.max(1, Math.ceil(products.length / itemsPerPage));
  const paginatedItems = products.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  useEffect(() => {
    setPage(1);
  }, [activeCategory, query]);

  const handleImageError = (e) => {
    e.target.src = "/assets/products/placeholder.png";
  };

  return (
    <Box className="product-showcase">
      <div className="header">
        <h1>Product Showcase</h1>
        <p>Here are the products available at our store</p>
      </div>

      {/* Tabs + Search */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => {
            setTab(v);
            setPage(1);
          }}
          variant="scrollable"
          scrollButtons
          allowScrollButtonsMobile
          className="category-tabs"
        >
          {allCategories.map((c, i) => (
            <Tab key={i} label={c} />
          ))}
        </Tabs>

        {/* Search Input */}
        <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
          <TextField
            fullWidth
            placeholder="Search products..."
            size="small"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Stack>

      <Divider className="divider" />

      {/* Product Grid */}
      <Grid container spacing={3}>
        {loading ? (
          <Grid item xs={12}>
            <Typography align="center" sx={{ py: 4 }}>
              Loading products...
            </Typography>
          </Grid>
        ) : paginatedItems.length > 0 ? (
          paginatedItems.map((item, idx) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id || idx}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.02 }}
              >
                <Card
                  className="product-card"
                  onClick={() => setSelected(item)}
                >
                  <Box className="image-box" sx={{ height: 160 }}>
                    <img
                      src={
                        item.img_url || "/src/assets/stickers/placeholder.png"
                      }
                      alt={item.product_name}
                      onError={handleImageError}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "1rem 1rem 0 0",
                      }}
                    />
                  </Box>
                  <CardContent>
                    <Typography className="product-name" noWrap>
                      {item.product_name}
                    </Typography>
                    <Typography
                      className="product-note"
                      sx={{ color: "text.secondary", mt: 0.5 }}
                    >
                      Stock: {item.stock_quantity}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box className="no-products">
              <Typography variant="h6">No products found</Typography>
              <Typography variant="body2">
                Try another search or switch category.
              </Typography>
            </Box>
          </Grid>

        )}
      </Grid>

      {/* Pagination */}
      {products.length > itemsPerPage && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}

      {/* Product Dialog */}
      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          className="dialog-title"
          sx={{ display: "flex", justifyContent: "space-between" }}
        >
          {selected?.product_name}
          <IconButton onClick={() => setSelected(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Category: {selected?.category}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Stock: {selected?.stock_quantity}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Status: {selected?.status}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Last Updated:{" "}
            {selected?.last_updated
              ? new Date(selected.last_updated).toLocaleString()
              : "N/A"}
          </Typography>

          <Box
            className="dialog-image"
            sx={{ mt: 2, cursor: "pointer" }}
            onClick={() => setFullImage(selected?.img_url)}
          >
            <img
              src={selected?.img_url || "/src/assets/stickers/placeholder.png"}
              alt={selected?.product_name}
              onError={handleImageError}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "1rem",
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Full Image Modal */}
      <Dialog
        open={!!fullImage}
        onClose={() => setFullImage(null)}
        maxWidth="md"
        fullWidth
      >
        <IconButton
          sx={{ position: "absolute", top: 8, right: 8, zIndex: 2 }}
          onClick={() => setFullImage(null)}
        >
          <CloseIcon />
        </IconButton>

        <Box sx={{ p: 2, pt: 6 }}>
          <img
            src={fullImage}
            alt="Full size"
            style={{
              width: "100%",
              height: "auto",
              borderRadius: "1rem",
              display: "block",
              margin: "0 auto",
            }}
            onError={handleImageError}
          />
        </Box>
      </Dialog>
    </Box>
  );
}
