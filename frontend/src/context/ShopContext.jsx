import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "₹";
  const delivery_fee = 10;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [cartData, setCartData] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const [cartItems, setCartItems] = useState(() => {
    // Initialize cartItems from localStorage or empty object
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : {}; // Parse if available or empty
  });

  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(null);
  const [userName, setUserName] = useState(null);
  const [loadingToken, setLoadingToken] = useState(true);

  const navigate = useNavigate();

  // Fetch product data
  const getProductsData = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list");
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Load products on page load
  useEffect(() => {
    getProductsData();
  }, []);

  // Load cart data from localStorage on page load
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedCart = JSON.parse(localStorage.getItem("cartItems")) || {};
    setCartItems(storedCart); // Use local storage cart for guests
  
    if (storedToken) {
      setToken(storedToken);
      // Fetch userName from localStorage (if stored there)
      const savedUserName = localStorage.getItem("userName");
      if (savedUserName) {
        setUserName(savedUserName);
      } else {
        // Alternatively, you can fetch the username from your backend
        axios
          .get(backendUrl + "/api/user/profile", {
            headers: { token: storedToken },
          })
          .then((response) => {
            if (response.data.success) {
              setUserName(response.data.user.name);
              localStorage.setItem("userName", response.data.user.name); // Save to localStorage for future
            }
          })
          .catch((error) => {
            toast.error("Failed to fetch user info");
          });
      }
    }
  
    setLoadingToken(false);
  }, []);
  

  const addToCart = async (itemId) => {
    if (!token) {
      toast.info("Please login to add items to your cart.");
      navigate("/login");
      return;
    }
  
    setCartItems((prev) => {
      const newCart = { ...prev, [itemId]: (prev[itemId] || 0) + 1 };
      localStorage.setItem("cartItems", JSON.stringify(newCart));
      return newCart;
    });
  
    try {
      await axios.post(
        backendUrl + "/api/cart/add",
        { itemId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Item added to cart!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add to cart");
    }
  };
  
  // Update quantity of an item in the cart
  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) {
      setCartItems((prev) => {
        const newCart = { ...prev };
        delete newCart[itemId]; // Remove item if quantity is 0 or less
        localStorage.setItem("cartItems", JSON.stringify(newCart));
        return newCart;
      });
    } else {
      setCartItems((prev) => {
        const newCart = { ...prev, [itemId]: quantity };
        localStorage.setItem("cartItems", JSON.stringify(newCart)); // Save to localStorage
        return newCart;
      });
    }

    // Sync with backend if logged in
    if (token) {
      try {
        await axios.post(backendUrl + "/api/cart/update", { itemId, quantity }, { headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to update cart");
      }
    }
  };

  // Get cart count (sum of all items in the cart)
  const getCartCount = () => {
    return Object.keys(cartItems).filter((key) => cartItems[key] > 0).length;
  };
  

  // Get the subtotal amount of the cart
  const getCartAmount = () => {
    return Object.entries(cartItems).reduce((total, [itemId, quantity]) => {
      const itemInfo = products.find((product) => product._id === itemId);
      return total + (itemInfo?.price || 0) * quantity; // Total price for the cart
    }, 0);
  };

  // Get total including shipping
  const getTotalAmount = () => {
    return getCartAmount() + delivery_fee;
  };

  // Save token to localStorage on token change
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);
  const fetchUserCart = async () => {
    if (!token) return;
    try {
      const response = await axios.get(backendUrl + "/api/cart/get", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setCartItems(response.data.cartData || {}); // <-- Fix here
        localStorage.setItem("cartItems", JSON.stringify(response.data.cartData || {})); // <-- Fix here
      }
    } catch (error) {
      toast.error("Failed to fetch updated cart");
    }
  };
  useEffect(() => {
    if (token) {
      fetchUserCart();
    }
  }, [token]);
  
  
  const logout = () => {
    setToken(null);
    setUserName(null);
    setCartItems({}); 
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("cartItems");
    toast.success("Logged out successfully");
    navigate('/login');
  };
  
  const value = {
    products,
    logout,
    currency,
    delivery_fee,
    search,
    setSearch,
    fetchUserCart,
    showSearch,
    setShowSearch,
    cartItems,
    setCartItems,
    cartData, setCartData,
      selectedItems, setSelectedItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    getTotalAmount,
    navigate,
    backendUrl,
    token,
    setToken,
    userName,
    setUserName,
    loadingToken,
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
