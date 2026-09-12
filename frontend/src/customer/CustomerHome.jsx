import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import "./CustomerHome.css";

const API_URL = import.meta.env.VITE_API_URL;

function CustomerHome() {
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);
const [searchQuery, setSearchQuery] = useState("");
const [searchParams] = useSearchParams();
const [selectedCategory, setSelectedCategory] = useState("All");
const [sortBy, setSortBy] = useState("default");

const newArrivals = products.filter(
(product) => product.isNewArrival
);

const bestSellers = products.filter(
(product) => product.isBestSeller
);

const categories = [
"All",
...new Set(
products
.map((product) => product.category)
.filter(Boolean)
),
];

const filteredProducts = products
.filter((product) => {
const query = searchQuery.toLowerCase().trim();

  const matchesSearch =
    !query ||
    product.name?.toLowerCase().includes(query) ||
    product.category?.toLowerCase().includes(query) ||
    product.productCode?.toLowerCase().includes(query);

  const matchesCategory =
    selectedCategory === "All" ||
    product.category === selectedCategory;

  return matchesSearch && matchesCategory;
})
.sort((a, b) => {
  if (sortBy === "price-low") {
    return (
      (a.salePrice || a.price) -
      (b.salePrice || b.price)
    );
  }

  if (sortBy === "price-high") {
    return (
      (b.salePrice || b.price) -
      (a.salePrice || a.price)
    );
  }

  if (sortBy === "newest") {
    return (
      new Date(b.createdAt || 0) -
      new Date(a.createdAt || 0)
    );
  }

  return 0;
});

useEffect(() => {
fetchProducts();
}, []);

useEffect(() => {
  const search = searchParams.get("search") || "";

  setSearchQuery(search);

  if (search) {
    setTimeout(() => {
      document
        .querySelector(".search-result-heading")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  }
}, [searchParams]);

const fetchProducts = async () => {
try {
const response = await axios.get(
`${API_URL}/api/products`
);

if (response.data.success) {
  setProducts(response.data.products);
}

} catch (error) {
console.error(
"Fetch customer products error:",
error
);
} finally {
setLoading(false);
}
};

const ProductCard = ({ product }) => {
const price =
product.salePrice || product.price;

return (
  <Link
    to={`/product/${product._id}`}
    className="product-card"
  >
    <div className="product-card-image-wrap">

      {product.isNewArrival && (
        <span className="product-badge">
          NEW
        </span>
      )}

      {!product.isNewArrival &&
        product.isBestSeller && (
          <span className="product-badge">
            BEST SELLER
          </span>
        )}

      {product.stock === 0 && (
        <span className="out-of-stock-badge">
          OUT OF STOCK
        </span>
      )}

      <div className="product-image">

        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
          />
        ) : (
          <div className="product-no-image">
            NO IMAGE
          </div>
        )}

        <div className="product-view-overlay">
          VIEW PIECE
        </div>

      </div>

    </div>

    <div className="product-info">

      <p className="product-category">
        {product.category}
      </p>

      <h3>{product.name}</h3>

      <div className="product-price">

        <span>
          ₹{price.toLocaleString("en-IN")}
        </span>

        {product.salePrice && (
          <del>
            ₹
            {product.price.toLocaleString(
              "en-IN"
            )}
          </del>
        )}

      </div>

    </div>
  </Link>
);

};

return (
<>
<Navbar />

  <main className="customer-home">

    <section className="hero-section">

      <div className="hero-content">

        <p className="hero-small-title">
          HANDCRAFTED WITH LOVE
        </p>

        <h1>
          Jewellery That
          <span>Tells Your Story</span>
        </h1>

        <p className="hero-description">
          Discover timeless handcrafted jewellery
          designed to make every moment beautifully
          unforgettable.
        </p>

        <a
          href="#collection"
          className="hero-button"
        >
          SHOP COLLECTION
        </a>

      </div>

      <div className="hero-image">

        <img
  src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1200&q=85"
  alt="Nipun's Craft Jewellery"
/>

      

      </div>

    </section>

    <section
      id="collection"
      className="collection-section"
    >

      <div className="section-heading">

        <p>OUR COLLECTION</p>

        <h2>
          Timeless
          <span>Pieces</span>
        </h2>

        <div className="section-heading-line"></div>

      </div>

      <div className="collection-controls">

        <div className="category-filters">

          {categories.map((category) => (
            <button
              key={category}
              className={
                selectedCategory === category
                  ? "category-button active"
                  : "category-button"
              }
              onClick={() =>
                setSelectedCategory(category)
              }
            >
              {category}
            </button>
          ))}

        </div>

        <select
          className="sort-select"
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value)
          }
        >
          <option value="default">
            Sort By
          </option>

          <option value="newest">
            Newest
          </option>

          <option value="price-low">
            Price: Low to High
          </option>

          <option value="price-high">
            Price: High to Low
          </option>
        </select>

      </div>

      {searchQuery && (
        <div className="search-result-heading">

          <span>SEARCH RESULTS</span>

          <strong>
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1
              ? "PIECE"
              : "PIECES"}{" "}
            FOUND FOR "{searchQuery}"
          </strong>

        </div>
      )}

      {loading ? (
        <div className="home-loading">
          Loading collection...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="no-products">
          <p>NO PIECES FOUND</p>

          <h3>
            Nothing matched your search
          </h3>

          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
          >
            VIEW ALL PIECES
          </button>
        </div>
      ) : (
        <div className="product-grid">

          {filteredProducts.map(
            (product) => (
              <ProductCard
                key={product._id}
                product={product}
              />
            )
          )}

        </div>
      )}

    </section>

    {newArrivals.length > 0 && (
      <section
        id="new-arrivals"
        className="collection-section featured-section"
      >

        <div className="section-heading">

          <p>JUST ARRIVED</p>

          <h2>
            New
            <span>Arrivals</span>
          </h2>

          <div className="section-heading-line"></div>

        </div>

        <div className="product-grid">

          {newArrivals.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
            />
          ))}

        </div>

      </section>
    )}

    {bestSellers.length > 0 && (
      <section
        id="best-sellers"
        className="collection-section featured-section"
      >

        <div className="section-heading">

          <p>MOST LOVED</p>

          <h2>
            Best
            <span>Sellers</span>
          </h2>

          <div className="section-heading-line"></div>

        </div>

        <div className="product-grid">

          {bestSellers.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
            />
          ))}

        </div>

      </section>
    )}

  </main>

  
</>

);
}

export default CustomerHome;