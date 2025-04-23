import userModel from "../models/userModel.js";
export const addToCart = async (req, res) => {
    try {
      const { itemId} = req.body;
      const user = await userModel.findById(req.user.id);
  
      if (!user) return res.status(404).json({ success: false, message: "User not found" });
  
      let cart = { ...user.cartData };
      if (!cart[itemId]) cart[itemId] = 1;
      
      user.cartData = cart;
      await user.save();
  
      res.status(200).json({ success: true, message: "Item added to cart" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  
  export const updateCart = async (req, res) => {
    try {
      const { itemId, quantity } = req.body;
      const user = await userModel.findById(req.user.id);
  
      if (!user) return res.status(404).json({ success: false, message: "User not found" });
  
      let cart = { ...user.cartData };
      if (!cart[itemId]) cart[itemId] = {};
      cart[itemId] = quantity;
  
      user.cartData = cart;
      await user.save();
  
      res.status(200).json({ success: true, message: "Cart updated" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  
  export const getCart = async (req, res) => {
    try {
      const user = await userModel.findById(req.user.id);
  
      if (!user) return res.status(404).json({ success: false, message: "User not found" });
  
      res.status(200).json({ success: true, cartData: user.cartData || {} });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
 
