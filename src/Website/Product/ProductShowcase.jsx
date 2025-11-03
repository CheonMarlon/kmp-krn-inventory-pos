import React, { useMemo, useState } from "react";
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { motion } from "framer-motion";
import productsData from "/src/data/products.json";
import "./ProductShowcase.css";

export default function ProductShowcase() {
  const categories = Object.keys(productsData);
  const [tab, setTab] = useState(0);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const activeCategory = categories[tab];

  const items = useMemo(() => {
    const list = productsData[activeCategory] || [];
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter((i) => i.name.toLowerCase().includes(q));
  }, [activeCategory, query]);

  const handleImageError = (e) => {
    e.target.src = "/src/assets/stickers/placeholder.png";
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
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons
          allowScrollButtonsMobile
          className="category-tabs"
        >
          {categories.map((c, i) => (
            <Tab key={i} label={c} />
          ))}
        </Tabs>
        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            placeholder="Search products..."
            size="small"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
              ),
            }}
          />
        </Box>
      </Stack>

      <Divider className="divider" />

      {/* Product Grid */}
      <Grid container spacing={3}>
        {items.map((item, idx) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item.id || idx}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.02 }}
            >
              <Card
                className="product-card"
                onClick={() =>
                  setSelected({ ...item, category: activeCategory })
                }
              >
                <Box className="image-box">
                  <img
                    src={item.image || "/assets/products/placeholder.png"}
                    alt={item.name}
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
                  <Typography className="product-name">{item.name}</Typography>
                  {item.note && (
                    <Typography className="product-note">
                      {item.note}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}

        {items.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                No products found
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Try another search or switch category.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Product Detail Dialog */}
      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle className="dialog-title">
          {selected?.name}
          <IconButton onClick={() => setSelected(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Category: {selected?.category}
          </Typography>
          {selected?.note && (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Note: {selected?.note}
            </Typography>
          )}
          <Box className="dialog-image">
            <img
              src={selected?.image || "/assets/products/placeholder.png"}
              alt={selected?.name}
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
    </Box>
  );
}
