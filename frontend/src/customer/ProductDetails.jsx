import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import "./CustomerHome.css";

const API_URL = "http://localhost:5000";

function ProductDetails() {
const { id } = useParams();
const navigate = useNavigate();

const [product, setProduct] = useState(null);
const [loading, setLoading] = useState(true);
const [selectedImage, setSelectedImage] = useState(0);
const [isWishlisted, setIsWishlisted] = useState(false);

useEffect(() => {
fetchProduct();


const savedWishlist = JSON.parse(
  localStorage.getItem("nipunsWishlist") || "[]"
);

setIsWishlisted(
  savedWishlist.some((item) => item._id === id)
);


}, [id]);

const fetchProduct = async () => {
try {
const response = await axios.get(
`${API_URL}/api/products/${id}`
);


  if (response.data.success) {
    setProduct(response.data.product);
  }
} catch (error) {
  console.error("Fetch product error:", error);
} finally {
  setLoading(false);
}


};

const handleWishlist = () => {
const existingWishlist = JSON.parse(
localStorage.getItem("nipunsWishlist") || "[]"
);


const alreadyAdded = existingWishlist.some(
  (item) => item._id === product._id
);

if (alreadyAdded) {
  const updatedWishlist = existingWishlist.filter(
    (item) => item._id !== product._id
  );

  localStorage.setItem(
    "nipunsWishlist",
    JSON.stringify(updatedWishlist)
  );

  setIsWishlisted(false);
} else {
  const updatedWishlist = [
    ...existingWishlist,
    product,
  ];

  localStorage.setItem(
    "nipunsWishlist",
    JSON.stringify(updatedWishlist)
  );

  setIsWishlisted(true);
}

window.dispatchEvent(
  new Event("wishlistUpdated")
);


};

const handleAddToCart = () => {
const existingCart = JSON.parse(
localStorage.getItem("nipunsCart") || "[]"
);


const existingItem = existingCart.find(
  (item) => item._id === product._id
);

let updatedCart;

if (existingItem) {
  updatedCart = existingCart.map((item) =>
    item._id === product._id
      ? {
          ...item,
          quantity: Math.min(
            item.quantity + 1,
            product.stock
          ),
        }
      : item
  );
} else {
  updatedCart = [
    ...existingCart,
    {
      ...product,
      quantity: 1,
    },
  ];
}

localStorage.setItem(
  "nipunsCart",
  JSON.stringify(updatedCart)
);

window.dispatchEvent(
  new Event("cartUpdated")
);

navigate("/cart");


};

if (loading) {
return (
<> <Navbar />


    <main className="product-detail-page">
      <div className="product-detail-loading">
        Loading product...
      </div>
    </main>
  </>
);


}

if (!product) {
return (
<> <Navbar />


    <main className="product-detail-page">
      <div className="product-detail-loading">
        <h2>Product Not Found</h2>

        <button
          className="product-detail-back-home"
          onClick={() => navigate("/")}
        >
          BACK TO COLLECTION
        </button>
      </div>
    </main>
  </>
);


}

return (
<> <Navbar />


  <main className="product-detail-page">

    <button
      className="product-detail-back"
      onClick={() => navigate(-1)}
    >
      ← BACK
    </button>

    <div className="product-detail-container">

      <div className="product-detail-gallery">

        <div className="product-main-image">

          {product.images?.[selectedImage] ? (
            <img
              src={product.images[selectedImage]}
              alt={product.name}
            />
          ) : (
            <div className="product-detail-no-image">
              NO IMAGE
            </div>
          )}

        </div>

        {product.images?.length > 1 && (
          <div className="product-thumbnails">

            {product.images.map((image, index) => (
              <button
                key={index}
                className={`thumbnail ${
                  selectedImage === index
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setSelectedImage(index)
                }
              >
                <img
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                />
              </button>
            ))}

          </div>
        )}

      </div>

      <div className="product-detail-info">

        <div className="product-detail-top">

          {product.isNewArrival && (
            <span className="detail-badge">
              NEW ARRIVAL
            </span>
          )}

          {!product.isNewArrival &&
            product.isBestSeller && (
              <span className="detail-badge">
                BEST SELLER
              </span>
            )}

          <p className="detail-category">
            {product.category}
          </p>

          <h1>{product.name}</h1>

          <p className="detail-code">
            PRODUCT CODE: {product.productCode}
          </p>

        </div>

        <div className="detail-price">

          {product.salePrice ? (
            <>
              <span>
                ₹{product.salePrice.toLocaleString("en-IN")}
              </span>

              <del>
                ₹{product.price.toLocaleString("en-IN")}
              </del>

              <small>
                SALE PRICE
              </small>
            </>
          ) : (
            <span>
              ₹{product.price.toLocaleString("en-IN")}
            </span>
          )}

        </div>

        {product.description && (
          <div className="detail-description">

            <p className="detail-section-label">
              ABOUT THE PIECE
            </p>

            <p className="detail-description-text">
              {product.description}
            </p>

          </div>
        )}

        <div className="detail-stock">

          {product.stock > 0 ? (
            <>
              <span className="detail-stock-dot"></span>
              <span>
                IN STOCK
              </span>
            </>
          ) : (
            <>
              <span className="detail-stock-dot out"></span>
              <span>
                OUT OF STOCK
              </span>
            </>
          )}

        </div>

        <div className="product-detail-actions">

          <button
            className={`wishlist-button ${
              isWishlisted
                ? "wishlist-added"
                : ""
            }`}
            onClick={handleWishlist}
          >
            {isWishlisted
              ? "♥  SAVED TO WISHLIST"
              : "♡  ADD TO WISHLIST"}
          </button>

          <button
            className="add-cart-button"
            disabled={product.stock <= 0}
            onClick={handleAddToCart}
          >
            {product.stock > 0
              ? "ADD TO CART"
              : "OUT OF STOCK"}
          </button>

        </div>

        <div className="product-detail-note">

          <div>
            <strong>SECURE SHOPPING</strong>
            <span>Safe & secure checkout</span>
          </div>

          <div>
            <strong>QUALITY CRAFT</strong>
            <span>Made with attention to detail</span>
          </div>

          <div>
            <strong>FAST DELIVERY</strong>
            <span>Reliable order delivery</span>
          </div>

        </div>

      </div>

    </div>

  </main>
</>

);
}

export default ProductDetails;
