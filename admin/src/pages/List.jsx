import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

const List = ({ token }) => {
  const [listProducts, setListProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchListProducts = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list");
      if (response.data.success) {
        setListProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch products");
    }
  };

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/product/remove",
        { id },
        { headers: { Authorization: `Bearer ${token}` }
      }
      );

      if (response.data.success) {
        toast.info(response.data.message);
        await fetchListProducts();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove product");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        backendUrl + "/api/product/edit",
        {
          productId: editingProduct._id,
          name: editingProduct.name,
          description: editingProduct.description,
          price: editingProduct.price,
          category: editingProduct.category,
          
          bestSeller: editingProduct.bestSeller,
        },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Product updated");
        setEditingProduct(null);
        await fetchListProducts();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update product");
    }
  };

  useEffect(() => {
    fetchListProducts();
  }, []);

  const openEdit = (product) => {
    setEditingProduct({ ...product }); // Clone to avoid direct state mutation
  };

  const updateField = (field, value) => {
    setEditingProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="hidden md:grid grid-cols-[0.5fr_1fr_1.5fr_0.5fr_0.5fr_0.5fr_0.5fr] items-center py-1 px-2 border bg-gray-200 text-xl text-center">
          <b>Image</b>
          <b>Name</b>
          <b>Description</b>
          <b>Category</b>
          <b>Price</b>
          <b>Action</b>
        </div>

        {listProducts.map((item, index) => (
          <div
            className="grid grid-cols-[0.5fr_1fr_1.5fr_0.5fr_0.5fr_0.5fr_0.5fr] items-center gap-2 py-1 px-2 border text-sm text-center"
            key={index}
          >
            <img className="w-12" src={item.image[0]} alt="Product" />
            <p className="text-left">{item.name}</p>
            <p className="text-left">{item.description}</p>
            <p>{item.category}</p>
            <p>{currency(item.price)}</p>
            <button
              onClick={() => openEdit(item)}
              className="bg-blue-500 text-white px-2 py-1 rounded"
            >
              Edit
            </button>
            <p
              onClick={() => removeProduct(item._id)}
              className="font-bold text-white bg-red-500 rounded-full cursor-pointer px-2 py-1"
            >
              X
            </p>
          </div>
        ))}
      </div>

      {editingProduct && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex justify-center items-center z-10">
          <form
            onSubmit={handleEditSubmit}
            className="bg-white p-6 rounded shadow-md w-[90%] max-w-md"
          >
            <h2 className="text-xl font-bold mb-4">Edit Product</h2>
            <input
              type="text"
              placeholder="Name"
              value={editingProduct.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="w-full mb-2 p-2 border rounded"
              required
            />
            <textarea
              placeholder="Description"
              value={editingProduct.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="w-full mb-2 p-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Category"
              value={editingProduct.category}
              onChange={(e) => updateField("category", e.target.value)}
              className="w-full mb-2 p-2 border rounded"
              required
            />
            <input
              type="number"
              placeholder="Price"
              value={editingProduct.price}
              onChange={(e) => updateField("price", e.target.value)}
              className="w-full mb-2 p-2 border rounded"
              required
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="bg-gray-400 text-white px-3 py-1 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default List;
