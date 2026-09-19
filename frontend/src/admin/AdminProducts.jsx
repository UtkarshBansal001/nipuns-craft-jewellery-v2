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

  // Existing images already saved in database
  const [existingImages, setExistingImages] = useState([]);

  // New files selected from computer
  const [selectedImages, setSelectedImages] = useState([]);

  // Preview URLs for newly selected files
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  const productFormRef = useRef(null);

  const token = localStorage.getItem("adminToken");

  /* =========================================================
     AUTH + FETCH PRODUCTS
  ========================================================= */

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

    /*
      Existing images + new images should not exceed 10
    */

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
     alert("EDIT BUTTON WORKING");
    console.log("EDIT BUTTON CLICKED", product);

    

    /*
      Convert DB images into normal URLs
    */

    const images = Array.isArray(
      product.images
    )
      ? product.images
          .map((image) =>
            getImageUrl(image)
          )
          .filter(Boolean)
      : [];

    console.log(
      "EXISTING IMAGES:",
      images
    );

    setEditingId(product._id);

    /*
      Existing images remain separate
    */

    setExistingImages(images);

    /*
      New images reset
    */

    setSelectedImages([]);
    setNewImagePreviews([]);

    /*
      Fill product form
    */

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

      /*
        Existing image URLs are also stored here.
        This helps preserve them during update.
      */

      images: images.join("\n"),

      isFeatured:
        product.isFeatured || false,

      isNewArrival:
        product.isNewArrival || false,

      isBestSeller:
        product.isBestSeller || false,
    });

    setMessage("");

    /*
      Opening form triggers scroll
    */

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

    /*
      Update textarea-style stored URLs too
    */

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

        /*
          Old images + new uploaded images
        */

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

      console.log(
        "FINAL PRODUCT DATA:",
        productData
      );

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

      /* =====================================================
         RESET
      ===================================================== */

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
  };

  /* =========================================================
     JSX
  ========================================================= */

  return (
    <div className="products-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="products-header">

        <div>

          <button
            className="back-button"
            onClick={() =>
              navigate("/admin")
            }
          >
            ← Dashboard
          </button>

          <p>
            STORE MANAGEMENT
          </p>

          <h1>
            Products
          </h1>

        </div>

        <button
          className="add-product-button"
          onClick={openAddForm}
        >
          + Add Product
        </button>

      </header>

      {/* =====================================================
          MESSAGE
      ===================================================== */}

      {message && (
        <div className="product-message">
          {message}
        </div>
      )}

      {/* =====================================================
          PRODUCT FORM
      ===================================================== */}

      {showForm && (

        <section
          ref={productFormRef}
          className="product-form-card"
        >

          {/* FORM HEADER */}

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
              type="button"
              className="close-form"
              onClick={closeForm}
            >
              ×
            </button>

          </div>

          {/* FORM */}

          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              {/* PRODUCT NAME */}

              <div className="input-group">

                <label>
                  Product Name *
                </label>

                <input
                  name="name"
                  value={
                    formData.name
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="e.g. Pearl Drop Earrings"
                />

              </div>

              {/* PRODUCT CODE */}

              <div className="input-group">

                <label>
                  Product Code *
                </label>

                <input
                  name="productCode"
                  value={
                    formData.productCode
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="NCJ001"
                />

              </div>

              {/* DESCRIPTION */}

              <div className="input-group full">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Describe your jewellery product..."
                  rows="4"
                />

              </div>

              {/* ORIGINAL PRICE */}

              <div className="input-group">

                <label>
                  Original Price (₹) *
                </label>

                <input
                  type="number"
                  name="price"
                  min="0"
                  value={
                    formData.price
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="999"
                />

              </div>

              {/* SALE PRICE */}

              <div className="input-group">

                <label>
                  Sale Price (₹)
                </label>

                <input
                  type="number"
                  name="salePrice"
                  min="0"
                  value={
                    formData.salePrice
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="799"
                />

              </div>

              {/* CATEGORY */}

              <div className="input-group">

                <label>
                  Category *
                </label>

                <input
                  name="category"
                  value={
                    formData.category
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Earrings"
                />

              </div>

              {/* STOCK */}

              <div className="input-group">

                <label>
                  Stock
                </label>

                <input
                  type="number"
                  name="stock"
                  min="0"
                  value={
                    formData.stock
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="10"
                />

              </div>

              {/* =================================================
                  IMAGES
              ================================================= */}

              <div className="input-group full">

                <label>
                  Product Images
                </label>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={
                    handleImageChange
                  }
                />

                <small>
                  Maximum 10 images.
                </small>

                {/* =================================================
                    EXISTING IMAGES
                ================================================= */}

                {existingImages.length >
                  0 && (

                  <div>

                    <p
                      style={{
                        margin:
                          "15px 0 8px",
                        fontWeight:
                          "600",
                      }}
                    >
                      Existing Images
                    </p>

                    <div className="image-preview-grid">

                      {existingImages.map(
                        (
                          src,
                          index
                        ) => (

                          <div
                            className="image-preview"
                            key={`existing-${index}`}
                            style={{
                              position:
                                "relative",
                            }}
                          >

                            <img
                              src={src}
                              alt={`Existing ${
                                index +
                                1
                              }`}
                              onError={(
                                e
                              ) => {
                                console.error(
                                  "Existing image failed:",
                                  src
                                );

                                e.currentTarget.style.display =
                                  "none";
                              }}
                            />

                            <button
                              type="button"
                              onClick={() =>
                                removeExistingImage(
                                  index
                                )
                              }
                              style={{
                                position:
                                  "absolute",
                                top:
                                  "5px",
                                right:
                                  "5px",
                                width:
                                  "26px",
                                height:
                                  "26px",
                                border:
                                  "none",
                                borderRadius:
                                  "50%",
                                cursor:
                                  "pointer",
                                fontSize:
                                  "16px",
                              }}
                            >
                              ×
                            </button>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )}

                {/* =================================================
                    NEW IMAGE PREVIEWS
                ================================================= */}

                {newImagePreviews.length >
                  0 && (

                  <div>

                    <p
                      style={{
                        margin:
                          "15px 0 8px",
                        fontWeight:
                          "600",
                      }}
                    >
                      New Images
                    </p>

                    <div className="image-preview-grid">

                      {newImagePreviews.map(
                        (
                          src,
                          index
                        ) => (

                          <div
                            className="image-preview"
                            key={`new-${index}`}
                            style={{
                              position:
                                "relative",
                            }}
                          >

                            <img
                              src={src}
                              alt={`New ${
                                index +
                                1
                              }`}
                            />

                            <button
                              type="button"
                              onClick={() =>
                                removeNewImage(
                                  index
                                )
                              }
                              style={{
                                position:
                                  "absolute",
                                top:
                                  "5px",
                                right:
                                  "5px",
                                width:
                                  "26px",
                                height:
                                  "26px",
                                border:
                                  "none",
                                borderRadius:
                                  "50%",
                                cursor:
                                  "pointer",
                                fontSize:
                                  "16px",
                              }}
                            >
                              ×
                            </button>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )}

              </div>

            </div>

            {/* =================================================
                PRODUCT OPTIONS
            ================================================= */}

            <div className="product-options">

              <label>

                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={
                    formData.isFeatured
                  }
                  onChange={
                    handleChange
                  }
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
                  onChange={
                    handleChange
                  }
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
                  onChange={
                    handleChange
                  }
                />

                Best Seller

              </label>

            </div>

            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="form-actions">

              <button
                type="button"
                className="cancel-button"
                onClick={closeForm}
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

      {/* =====================================================
          PRODUCTS LIST
      ===================================================== */}

      <section className="products-list-card">

        <div className="list-heading">

          <div>

            <p>
              CATALOG
            </p>

            <h2>

              All Products

              <span>
                {products.length}
              </span>

            </h2>

          </div>

        </div>

        {/* LOADING */}

        {loading ? (

          <div className="empty-products">
            Loading products...
          </div>

        ) : products.length === 0 ? (

          /* =================================================
             EMPTY
          ================================================= */

          <div className="empty-products">

            <div className="empty-icon">
              ◇
            </div>

            <h3>
              No products yet
            </h3>

            <p>
              Add your first jewellery
              product to start building
              your catalogue.
            </p>

            <button
              onClick={openAddForm}
              className="empty-add-button"
            >
              + Add First Product
            </button>

          </div>

        ) : (

          /* =================================================
             TABLE
          ================================================= */

          <div className="products-table-wrapper">

            <table className="products-table">

              <thead>

                <tr>

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
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {products.map(
                  (product) => {

                    const displayPrice =
                      product.salePrice ??
                      product.price;

                    return (

                      <tr
                        key={
                          product._id
                        }
                      >

                        {/* PRODUCT */}

                        <td>

                          <div className="product-name-cell">

                            <div className="product-thumbnail">

                              {product
                                .images
                                ?.length >
                              0 ? (

                                <img
                                  src={getImageUrl(
                                    product
                                      .images[0]
                                  )}
                                  alt={
                                    product.name
                                  }
                                />

                              ) : (

                                <span>
                                  ◇
                                </span>

                              )}

                            </div>

                            <div>

                              <strong>
                                {
                                  product.name
                                }
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

                        {/* CODE */}

                        <td>

                          <span className="product-code">

                            {
                              product.productCode
                            }

                          </span>

                        </td>

                        {/* CATEGORY */}

                        <td>
                          {
                            product.category
                          }
                        </td>

                        {/* PRICE */}

                        <td>

                          <div className="price-cell">

                            {product.salePrice ? (

                              <>

                                <strong>
                                  ₹
                                  {
                                    displayPrice
                                  }
                                </strong>

                                <del>
                                  ₹
                                  {
                                    product.price
                                  }
                                </del>

                              </>

                            ) : (

                              <strong>
                                ₹
                                {
                                  product.price
                                }
                              </strong>

                            )}

                          </div>

                        </td>

                        {/* STOCK */}

                        <td>

                          <span
                            className={
                              product.stock ===
                              0
                                ? "stock out"
                                : product.stock <=
                                  5
                                ? "stock low"
                                : "stock"
                            }
                          >
                            {
                              product.stock
                            }
                          </span>

                        </td>

                        {/* ACTIONS */}

                        <td>

                          <div className="table-actions">

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

      </section>

    </div>
  );
}

export default AdminProducts;