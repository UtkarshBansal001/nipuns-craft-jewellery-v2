import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminProducts.css";

const API_URL = import.meta.env.VITE_API_URL;

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

  const [formData, setFormData] = useState({
    ...emptyProduct,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Category filter
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  // Existing images already saved in database
  const [existingImages, setExistingImages] = useState([]);

  // New files selected from computer
  const [selectedImages, setSelectedImages] = useState([]);

  // Preview URLs for newly selected files
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  const productFormRef = useRef(null);

  const getAdminToken = () => {
  return localStorage.getItem("adminToken");
};

  /* =========================================================
     AUTH + FETCH PRODUCTS
  ========================================================= */

 useEffect(() => {
  const token = getAdminToken();

  if (!token) {
    navigate("/admin/login");
    return;
  }

  fetchProducts();
}, [navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/api/products`
      );

      if (response.data.success) {
        setProducts(response.data.products || []);
      }
    } catch (error) {
      console.error("Fetch products error:", error);

      setMessage(
        error.response?.data?.message ||
          "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     CATEGORY LIST
  ========================================================= */

  const categories = [
    "All",
    ...new Set(
      products
        .map((product) => product.category)
        .filter(Boolean)
    ),
  ];

  /* =========================================================
     FILTERED PRODUCTS
  ========================================================= */

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter(
          (product) =>
            product.category === selectedCategory
        );

  /* =========================================================
     SCROLL TO FORM
  ========================================================= */

  useEffect(() => {
    if (!showForm) return;

    const timer = setTimeout(() => {
      if (productFormRef.current) {
        productFormRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [showForm, editingId]);

  /* =========================================================
     HANDLE INPUT
  ========================================================= */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  /* =========================================================
     IMAGE URL HELPER
  ========================================================= */

  const getImageUrl = (image) => {
    if (!image) {
      return null;
    }

    if (typeof image === "string") {
      return image;
    }

    if (typeof image === "object") {
      if (image.url) {
        return image.url;
      }

      if (image.secure_url) {
        return image.secure_url;
      }

      if (image.path) {
        return image.path;
      }
    }

    return null;
  };

  /* =========================================================
     NEW IMAGE SELECT
  ========================================================= */

  const handleImageChange = (e) => {
    const files = Array.from(
      e.target.files || []
    );

    if (files.length === 0) {
      return;
    }

    const totalImages =
      existingImages.length + files.length;

    if (totalImages > 10) {
      setMessage(
        `Maximum 10 images allowed. You already have ${existingImages.length} existing image(s).`
      );

      e.target.value = "";
      return;
    }

    setSelectedImages(files);

    const previews = files.map((file) =>
      URL.createObjectURL(file)
    );

    setNewImagePreviews(previews);

    setMessage("");
  };

  /* =========================================================
     ADD PRODUCT
  ========================================================= */

  const openAddForm = () => {
    setEditingId(null);

    setFormData({
      ...emptyProduct,
    });

    setExistingImages([]);
    setSelectedImages([]);
    setNewImagePreviews([]);

    setMessage("");
    setShowForm(true);
  };

  /* =========================================================
     EDIT PRODUCT
  ========================================================= */

  const openEditForm = (product) => {
    const images = Array.isArray(
      product.images
    )
      ? product.images
          .map((image) =>
            getImageUrl(image)
          )
          .filter(Boolean)
      : [];

    setEditingId(product._id);

    setExistingImages(images);

    setSelectedImages([]);
    setNewImagePreviews([]);

    setFormData({
      name: product.name || "",

      productCode:
        product.productCode || "",

      description:
        product.description || "",

      price:
        product.price ?? "",

      salePrice:
        product.salePrice ?? "",

      category:
        product.category || "",

      stock:
        product.stock ?? "",

      images: images.join("\n"),

      isFeatured:
        product.isFeatured || false,

      isNewArrival:
        product.isNewArrival || false,

      isBestSeller:
        product.isBestSeller || false,
    });

    setMessage("");
    setShowForm(true);
  };

  /* =========================================================
     REMOVE EXISTING IMAGE
  ========================================================= */

  const removeExistingImage = (index) => {
    const updatedImages =
      existingImages.filter(
        (_, imageIndex) =>
          imageIndex !== index
      );

    setExistingImages(updatedImages);

    setFormData((previous) => ({
      ...previous,
      images:
        updatedImages.join("\n"),
    }));
  };

  /* =========================================================
     REMOVE NEW IMAGE
  ========================================================= */

  const removeNewImage = (index) => {
    const updatedFiles =
      selectedImages.filter(
        (_, fileIndex) =>
          fileIndex !== index
      );

    const updatedPreviews =
      newImagePreviews.filter(
        (_, previewIndex) =>
          previewIndex !== index
      );

    setSelectedImages(updatedFiles);
    setNewImagePreviews(
      updatedPreviews
    );
  };

  /* =========================================================
     SUBMIT PRODUCT
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setMessage(
        "Product name is required."
      );
      return;
    }

    if (!formData.productCode.trim()) {
      setMessage(
        "Product code is required."
      );
      return;
    }

    if (
      formData.price === "" ||
      Number(formData.price) < 0
    ) {
      setMessage(
        "Please enter a valid price."
      );
      return;
    }

    if (!formData.category.trim()) {
      setMessage(
        "Category is required."
      );
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const token = getAdminToken();

if (!token) {
  navigate("/admin/login");
  return;
}

      /* =====================================================
         OLD / EXISTING IMAGES
      ===================================================== */

      let finalImages = [
        ...existingImages,
      ];

      /* =====================================================
         UPLOAD NEW IMAGES
      ===================================================== */

      if (selectedImages.length > 0) {
        const imageData =
          new FormData();

        selectedImages.forEach(
          (file) => {
            imageData.append(
              "images",
              file
            );
          }
        );

        const uploadResponse =
          await axios.post(
            `${API_URL}/api/upload`,
            imageData,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (
          !uploadResponse.data
            .success
        ) {
          throw new Error(
            "Image upload failed."
          );
        }

        const newImages =
          uploadResponse.data
            .images || [];

        finalImages = [
          ...finalImages,
          ...newImages,
        ];
      }

      /* =====================================================
         PRODUCT DATA
      ===================================================== */

      const productData = {
        name:
          formData.name.trim(),

        productCode:
          formData.productCode
            .trim()
            .toUpperCase(),

        description:
          formData.description
            .trim(),

        price:
          Number(formData.price),

        salePrice:
          formData.salePrice === ""
            ? null
            : Number(
                formData.salePrice
              ),

        category:
          formData.category.trim(),

        stock:
          Number(
            formData.stock || 0
          ),

        images:
          finalImages,

        isFeatured:
          formData.isFeatured,

        isNewArrival:
          formData.isNewArrival,

        isBestSeller:
          formData.isBestSeller,
      };

      /* =====================================================
         UPDATE
      ===================================================== */

      if (editingId) {
        await axios.put(
          `${API_URL}/api/products/${editingId}`,
          productData,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        setMessage(
          "Product updated successfully."
        );
      }

      /* =====================================================
         ADD
      ===================================================== */

      else {
        await axios.post(
          `${API_URL}/api/products`,
          productData,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        setMessage(
          "Product added successfully."
        );
      }

      setShowForm(false);
      setEditingId(null);

      setFormData({
        ...emptyProduct,
      });

      setExistingImages([]);
      setSelectedImages([]);
      setNewImagePreviews([]);

      await fetchProducts();

    } catch (error) {
      console.error(
        "Save product error:",
        error
      );

      setMessage(
        error.response?.data
          ?.message ||
          "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     DELETE PRODUCT
  ========================================================= */

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this product?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/api/products/${id}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setMessage(
        "Product deleted successfully."
      );

      await fetchProducts();

    } catch (error) {
      console.error(
        "Delete product error:",
        error
      );

      setMessage(
        error.response?.data
          ?.message ||
          "Unable to delete product."
      );
    }
  };

  /* =========================================================
     CLOSE FORM
  ========================================================= */

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);

    setFormData({
      ...emptyProduct,
    });

    setExistingImages([]);
    setSelectedImages([]);
    setNewImagePreviews([]);
    setMessage("");
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="admin-products">
        <div className="admin-products-header">
          <h1>Products</h1>
        </div>

        <div className="loading-products">
          Loading products...
        </div>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="admin-products">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="admin-products-header">

  <div>
    <button
      type="button"
      className="admin-products-back-button"
      onClick={() => navigate(-1)}
    >
      ← Back
    </button>

    <h1>Products</h1>

    <p>
      Manage your jewellery products
    </p>
  </div>

        <button
          type="button"
          className="add-product-button"
          onClick={openAddForm}
        >
          + Add Product
        </button>

      </div>

      {/* =====================================================
          MESSAGE
      ===================================================== */}

      {message && (
        <div className="admin-message">
          {message}
        </div>
      )}

      {/* =====================================================
          PRODUCT FORM
      ===================================================== */}

      {showForm && (
        <div
          className="product-form-container"
          ref={productFormRef}
        >

          <div className="product-form-header">

            <h2>
              {editingId
                ? "Edit Product"
                : "Add New Product"}
            </h2>

            <button
              type="button"
              className="close-form-button"
              onClick={closeForm}
            >
              ×
            </button>

          </div>

          <form
            onSubmit={handleSubmit}
            className="product-form"
          >

            {/* Product Name */}

            <div className="form-group">

              <label>
                Product Name *
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
              />

            </div>

            {/* Product Code */}

            <div className="form-group">

              <label>
                Product Code *
              </label>

              <input
                type="text"
                name="productCode"
                value={
                  formData.productCode
                }
                onChange={handleChange}
                placeholder="Example: BR01"
              />

            </div>

            {/* Category */}

            <div className="form-group">

              <label>
                Category *
              </label>

              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Example: Bracelet"
              />

            </div>

            {/* Description */}

            <div className="form-group full-width">

              <label>
                Description
              </label>

              <textarea
                name="description"
                value={
                  formData.description
                }
                onChange={handleChange}
                placeholder="Enter product description"
                rows="4"
              />

            </div>

            {/* Price */}

            <div className="form-group">

              <label>
                Price *
              </label>

              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                placeholder="Enter price"
              />

            </div>

            {/* Sale Price */}

            <div className="form-group">

              <label>
                Sale Price
              </label>

              <input
                type="number"
                name="salePrice"
                value={
                  formData.salePrice
                }
                onChange={handleChange}
                min="0"
                placeholder="Optional"
              />

            </div>

            {/* Stock */}

            <div className="form-group">

              <label>
                Stock
              </label>

              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                placeholder="Enter stock"
              />

            </div>

            {/* Images */}

            <div className="form-group full-width">

              <label>
                Product Images
              </label>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
              />

              <small>
                Maximum 10 images per product.
              </small>

            </div>

            {/* Existing Images */}

            {existingImages.length > 0 && (
              <div className="image-preview-section full-width">

                <h3>
                  Existing Images
                </h3>

                <div className="image-preview-grid">

                  {existingImages.map(
                    (image, index) => (
                      <div
                        className="image-preview-item"
                        key={`${image}-${index}`}
                      >

                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeExistingImage(
                              index
                            )
                          }
                        >
                          ×
                        </button>

                      </div>
                    )
                  )}

                </div>

              </div>
            )}

            {/* New Images */}

            {newImagePreviews.length > 0 && (
              <div className="image-preview-section full-width">

                <h3>
                  New Images
                </h3>

                <div className="image-preview-grid">

                  {newImagePreviews.map(
                    (image, index) => (
                      <div
                        className="image-preview-item"
                        key={`${image}-${index}`}
                      >

                        <img
                          src={image}
                          alt={`New product ${index + 1}`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeNewImage(
                              index
                            )
                          }
                        >
                          ×
                        </button>

                      </div>
                    )
                  )}

                </div>

              </div>
            )}

            {/* Checkboxes */}

            <div className="checkbox-group full-width">

              <label>
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={
                    formData.isFeatured
                  }
                  onChange={handleChange}
                />

                Featured Product
              </label>

              <label>
                <input
                  type="checkbox"
                  name="isNewArrival"
                  checked={
                    formData.isNewArrival
                  }
                  onChange={handleChange}
                />

                New Arrival
              </label>

              <label>
                <input
                  type="checkbox"
                  name="isBestSeller"
                  checked={
                    formData.isBestSeller
                  }
                  onChange={handleChange}
                />

                Best Seller
              </label>

            </div>

            {/* Form Buttons */}

            <div className="form-buttons full-width">

              <button
                type="button"
                className="cancel-button"
                onClick={closeForm}
                disabled={saving}
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
                  : "Add Product"}
              </button>

            </div>

          </form>

        </div>
      )}

      {/* =====================================================
          PRODUCT LIST
      ===================================================== */}

      <div className="products-list-section">

        <div className="products-list-header">

          <div>

            <h2>
              {selectedCategory === "All"
                ? "All Products"
                : `${selectedCategory} Products`}
            </h2>

            <span className="product-count">
              {filteredProducts.length} product
              {filteredProducts.length !== 1
                ? "s"
                : ""}
            </span>

          </div>

          {/* CATEGORY FILTER */}

          <div className="category-filter">

            <label htmlFor="category-filter">
              Category:
            </label>

            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(
                  e.target.value
                )
              }
            >

              {categories.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                )
              )}

            </select>

          </div>

        </div>

        {/* =================================================
            NO PRODUCTS
        ================================================= */}

        {products.length === 0 ? (
          <div className="empty-products">

            <h3>
              No products yet
            </h3>

            <p>
              Add your first product to
              get started.
            </p>

            <button
              type="button"
              className="add-product-button"
              onClick={openAddForm}
            >
              + Add Product
            </button>

          </div>
        ) : filteredProducts.length === 0 ? (

          <div className="empty-products">

            <h3>
              No products in this category
            </h3>

            <p>
              Try selecting another
              category.
            </p>

          </div>

        ) : (

          /* =================================================
             PRODUCT TABLE
          ================================================= */

          <div className="products-table-wrapper">

            <table className="products-table">

              <thead>

                <tr>

                  <th>
                    Image
                  </th>

                  <th>
                    Product
                  </th>

                  <th>
                    Code
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Price
                  </th>

                  <th>
                    Stock
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredProducts.map(
                  (product) => {

                    const firstImage =
                      Array.isArray(
                        product.images
                      ) &&
                      product.images.length > 0
                        ? getImageUrl(
                            product.images[0]
                          )
                        : null;

                    return (
                      <tr
                        key={product._id}
                      >

                        {/* Image */}

                        <td>

                          <div className="product-table-image">

                            {firstImage ? (
                              <img
                                src={firstImage}
                                alt={
                                  product.name
                                }
                              />
                            ) : (
                              <div className="no-image">
                                No Image
                              </div>
                            )}

                          </div>

                        </td>

                        {/* Product */}

                        <td>

                          <div className="product-table-name">

                            <strong>
                              {product.name}
                            </strong>

                            {product.isFeatured && (
                              <span className="product-badge">
                                Featured
                              </span>
                            )}

                          </div>

                        </td>

                        {/* Product Code */}

                        <td>
                          {product.productCode ||
                            "-"}
                        </td>

                        {/* Category */}

                        <td>
                          {product.category ||
                            "-"}
                        </td>

                        {/* Price */}

                        <td>

                          {product.salePrice !==
                            null &&
                          product.salePrice !==
                            undefined &&
                          product.salePrice !==
                            "" ? (
                            <div>

                              <span className="sale-price">
                                ₹
                                {
                                  product.salePrice
                                }
                              </span>

                              <span className="original-price">
                                ₹
                                {
                                  product.price
                                }
                              </span>

                            </div>
                          ) : (
                            <span>
                              ₹
                              {
                                product.price
                              }
                            </span>
                          )}

                        </td>

                        {/* Stock */}

                        <td>

                          <span
                            className={
                              Number(
                                product.stock
                              ) > 0
                                ? "stock-in"
                                : "stock-out"
                            }
                          >
                            {Number(
                              product.stock
                            ) > 0
                              ? product.stock
                              : "Out of Stock"}
                          </span>

                        </td>

                        {/* Status */}

                        <td>

                          <div className="product-status">

                            {product.isNewArrival && (
                              <span>
                                New
                              </span>
                            )}

                            {product.isBestSeller && (
                              <span>
                                Best Seller
                              </span>
                            )}

                          </div>

                        </td>

                        {/* Actions */}

                        <td>

                          <div className="product-actions">

                            <button
                              type="button"
                              className="edit-button"
                              onClick={() =>
                                openEditForm(
                                  product
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="delete-button"
                              onClick={() =>
                                handleDelete(
                                  product._id
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default AdminProducts;