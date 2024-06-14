import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";

const initialState = {
  cart: localStorage.getItem("cart")
    ? JSON.parse(localStorage.getItem("cart"))
    : [],

  total: localStorage.getItem("total")
    ? JSON.parse(localStorage.getItem("total"))
    : 0,

  totalItems: localStorage.getItem("totalItems")
    ? JSON.parse(localStorage.getItem("totalItems"))
    : 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState: initialState,
  reducers: {
    addToCart: (state, action) => {
      const course = action.payload; // course to be added to cart
      const index = state.cart.findIndex((item) => item.id === course.id);
      // if course already exist in cart
      if (index >= 0) {
        toast.error("Course already in cart");
      }
      // if doesn't exist then push it to cart
      state.cart.push(course);
      state.totalItems++;
      state.total += JSON.parse(course.price);
      // update local storage
      localStorage.setItem("cart", JSON.stringify(state.cart));
      localStorage.setItem("total", JSON.stringify(state.total));
      localStorage.setItem("totalItems", JSON.stringify(state.totalItems));

      toast.success("Course added to cart");
    },

    removeFromCart: (state, action) => {
      // get the course id
      const courseId = action.payload;
      const index = state.cart.findIndex((item) => item._id === courseId);
      // check if the course exist then delet it
      if (index >= 0) {
        state.totalItems--;
        state.total -= state.cart[index].price;
        state.cart.splice(index, 1);
        // update the localstorage
        localStorage.setItem("cart", JSON.stringify(state.cart));
        localStorage.setItem("total", JSON.stringify(state.total));
        localStorage.setItem("totalItems", JSON.stringify(state.totalItems));

        toast.success("Course removed from cart");
      }
    },

    resetCart: (state, action) => {
      // reset the cart
      state.cart = [];
      state.total = 0;
      state.totalItems = 0;
      // update local storage
      localStorage.removeItem("cart");
      localStorage.removeItem("total");
      localStorage.removeItem("totalItems");
    },
  },
});

export const { addToCart, removeFromCart, resetCart } = cartSlice.actions;
export default cartSlice.reducer;
