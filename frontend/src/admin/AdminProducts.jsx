import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminProducts.css";

const API_URL = "http://localhost:5000";

const emptyProduct = {
  name: "",
  productCode: "",
  description: "",
  price: "",
  salePrice: "",
  category: "",
  stock: "",
  images: "",
  isFeatured: false,
  isNewArrival: true,
  isBestSeller: false,
};

function AdminProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyProduct);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    fetchProducts();
  }, [token, navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/api/products`
      );

      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error("Fetch products error:", error.message);
      setMessage("Unable to load products.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
  const files = Array.from(e.target.files);

  if (files.length > 10) {
    setMessage("You can select maximum 10 images.");
    return;
  }

  setSelectedImages(files);

  const previews = files.map((file) => URL.createObjectURL(file));
  setImagePreviews(previews);

  setMessage("");
};

  const openAddForm = () => {
    setEditingId(null);
    setSelectedImages([]);
    setImagePreviews([]);
    setFormData(emptyProduct);
    setMessage("");
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditingId(product._id);
    setSelectedImages([]);
    setImagePreviews([]);

    setFormData({
      name: product.name || "",
      productCode: product.productCode || "",
      description: product.description || "",
      price: product.price ?? "",
      salePrice: product.salePrice ?? "",
      category: product.category || "",
      stock: product.stock ?? "",
      images: product.images?.join("\n") || "",
      isFeatured: product.isFeatured || false,
      isNewArrival: product.isNewArrival || false,
      isBestSeller: product.isBestSeller || false,
    });

    setMessage("");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setMessage("Product name is required.");
      return;
    }

    if (!formData.productCode.trim()) {
      setMessage("Product code is required.");
      return;
    }


    if (!formData.price || Number(formData.price) < 0) {
      setMessage("Please enter a valid price.");
      return;
    }

    if (!formData.category.trim()) {
      setMessage("Category is required.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      // Upload selected images to Cloudinary
let uploadedImages = formData.images
  ? formData.images
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean)
  : [];

if (selectedImages.length > 0) {
  const imageData = new FormData();

  selectedImages.forEach((file) => {
    imageData.append("images", file);
  });

  const uploadResponse = await axios.post(
    `${API_URL}/api/upload`,
    imageData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!uploadResponse.data.success) {
    throw new Error("Image upload failed.");
  }

uploadedImages = [
  ...uploadResponse.data.images,
  ...uploadedImages,
];

}

      const productData = {
        name: formData.name.trim(),
        productCode: formData.productCode.trim().toUpperCase(),
        description: formData.description.trim(),
        price: Number(formData.price),
        salePrice:
          formData.salePrice === ""
            ? null
            : Number(formData.salePrice),
        category: formData.category.trim(),
        stock: Number(formData.stock || 0),

        images: uploadedImages,

        isFeatured: formData.isFeatured,
        isNewArrival: formData.isNewArrival,
        isBestSeller: formData.isBestSeller,
      };

      if (editingId) {
        await axios.put(
          `${API_URL}/api/products/${editingId}`,
          productData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setMessage("Product updated successfully.");
      } else {
        await axios.post(
          `${API_URL}/api/products`,
          productData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setMessage("Product added successfully.");
      }

      setShowForm(false);
      setEditingId(null);
      setFormData(emptyProduct);

      await fetchProducts();
    } catch (error) {
      console.error("Save product error:", error);

      setMessage(
        error.response?.data?.message ||
          "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API_URL}/api/products/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Product deleted successfully.");
      await fetchProducts();
    } catch (error) {
      console.error("Delete product error:", error.message);

      setMessage(
        error.response?.data?.message ||
          "Unable to delete product."
      );
    }
  };

  return (
    <div className="products-page">

      {/* Header */}
      <header className="products-header">

        <div>
          <button
            className="back-button"
            onClick={() => navigate("/admin")}
          >
            ← Dashboard
          </button>

          <p>STORE MANAGEMENT</p>

          <h1>Products</h1>
        </div>

        <button
          className="add-product-button"
          onClick={openAddForm}
        >
          + Add Product
        </button>

      </header>

      {message && (
        <div className="product-message">
          {message}
        </div>
      )}

      {/* Product Form */}
      {showForm && (
        <section className="product-form-card">

          <div className="form-header">

            <div>
              <p>
                {editingId
                  ? "EDIT PRODUCT"
                  : "NEW PRODUCT"}
              </p>

              <h2>
                {editingId
                  ? "Edit Product"
                  : "Add New Product"}
              </h2>
            </div>

            <button
              className="close-form"
              onClick={() => setShowForm(false)}
            >
              ×
            </button>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              <div className="input-group">
                <label>Product Name *</label>

                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Pearl Drop Earrings"
                />
              </div>

              <div className="input-group">
                <label>Product Code *</label>

                <input
                  name="productCode"
                  value={formData.productCode}
                  onChange={handleChange}
                  placeholder="NCJ001"
                />
              </div>

              <div className="input-group full">
                <label>Description</label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your jewellery product..."
                  rows="4"
                />
              </div>

              <div className="input-group">
                <label>Original Price (₹) *</label>

                <input
                  type="number"
                  name="price"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="999"
                />
              </div>

              <div className="input-group">
                <label>Sale Price (₹)</label>

                <input
                  type="number"
                  name="salePrice"
                  min="0"
                  value={formData.salePrice}
                  onChange={handleChange}
                  placeholder="799"
                />
              </div>

              <div className="input-group">
                <label>Category *</label>

                <input
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Earrings"
                />
              </div>

              <div className="input-group">
                <label>Stock</label>

                <input
                  type="number"
                  name="stock"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="10"
                />
              </div>

              <div className="input-group full">
  <label>Product Images</label>

  <input
    type="file"
    accept="image/*"
    multiple
    onChange={handleImageChange}
  />

  <small>
    Select up to 10 product images from your computer.
  </small>

  {imagePreviews.length > 0 && (
    <div className="image-preview-grid">
      {imagePreviews.map((src, index) => (
        <div className="image-preview" key={index}>
          <img src={src} alt={`Preview ${index + 1}`} />
        </div>
      ))}
    </div>
  )}
</div>

            </div>

            <div className="product-options">

              <label>
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                />
                Featured Product
              </label>

              <label>
                <input
                  type="checkbox"
                  name="isNewArrival"
                  checked={formData.isNewArrival}
                  onChange={handleChange}
                />
                New Arrival
              </label>

              <label>
                <input
                  type="checkbox"
                  name="isBestSeller"
                  checked={formData.isBestSeller}
                  onChange={handleChange}
                />
                Best Seller
              </label>

            </div>

            <div className="form-actions">

              <button
                type="button"
                className="cancel-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-product-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Product"
                  : "Save Product"}
              </button>

            </div>

          </form>

        </section>
      )}

      {/* Products */}
      <section className="products-list-card">

        <div className="list-heading">
          <div>
            <p>CATALOG</p>
            <h2>
              All Products
              <span>{products.length}</span>
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="empty-products">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="empty-products">

            <div className="empty-icon">◇</div>

            <h3>No products yet</h3>

            <p>
              Add your first jewellery product to
              start building your catalogue.
            </p>

            <button
              onClick={openAddForm}
              className="empty-add-button"
            >
              + Add First Product
            </button>

          </div>
        ) : (
          <div className="products-table-wrapper">

            <table className="products-table">

              <thead>
                <tr>
                  <th>Product</th>
                  <th>Code</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {products.map((product) => {

                  const displayPrice =
                    product.salePrice ??
                    product.price;

                  return (
                    <tr key={product._id}>

                      <td>
                        <div className="product-name-cell">

                          <div className="product-thumbnail">

                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                              />
                            ) : (
                              <span>◇</span>
                            )}

                          </div>

                          <div>
                            <strong>
                              {product.name}
                            </strong>

                            <small>
                              {product.isBestSeller
                                ? "Best Seller"
                                : product.isNewArrival
                                ? "New Arrival"
                                : ""}
                            </small>
                          </div>

                        </div>
                      </td>

                      <td>
                        <span className="product-code">
                          {product.productCode}
                        </span>
                      </td>

                      <td>
                        {product.category}
                      </td>

                      <td>
                        <div className="price-cell">

                          {product.salePrice ? (
                            <>
                              <strong>
                                ₹{displayPrice}
                              </strong>

                              <del>
                                ₹{product.price}
                              </del>
                            </>
                          ) : (
                            <strong>
                              ₹{product.price}
                            </strong>
                          )}

                        </div>
                      </td>

                      <td>
                        <span
                          className={
                            product.stock === 0
                              ? "stock out"
                              : product.stock <= 5
                              ? "stock low"
                              : "stock"
                          }
                        >
                          {product.stock}
                        </span>
                      </td>

                      <td>
                        <div className="table-actions">

                          <button
                            onClick={() =>
                              openEditForm(product)
                            }
                            className="edit-button"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(product._id)
                            }
                            className="delete-button"
                          >
                            Delete
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        )}

      </section>

    </div>
  );
}


export default AdminProducts;