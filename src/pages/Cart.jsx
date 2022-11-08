import { Box, Button, useToast, Text } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import CartProduct from "../components/CartProduct";
import {
  ADD_COUNT_ITEM,
  REMOVE_CART_ITEMS,
  SET_CART_ITEMS,
  SUBTRACT_COUNT_ITEM,
} from "../store/slicers/cart";
import { ADD_ORDER_ITEMS } from "../store/slicers/orders";
import { UPDATE_ITEM_STOCK } from "../store/slicers/products";
import { isAuthenticated } from "../libs/helpers/auth";

const Cart = () => {
  const products = useSelector((state) => state.cartItems.cartItems);
  const allProducts = useSelector((state) =>
    state.products.products.length > 0
      ? state.products.products
      : JSON.parse(localStorage.getItem("allProducts"))
  );
  const dispatch = useDispatch();
  const toast = useToast();

  const subTotal = () =>
    products.reduce((result, item) => result + item.price * item.count, 0);

  const tax = () => parseFloat((subTotal() * (1 / 100)).toFixed(2));

  const totalPayment = () => parseFloat((subTotal() + tax()).toFixed(2));

  const handleClickSubtract = (id) => {
    dispatch(SUBTRACT_COUNT_ITEM(id));
    const product = allProducts.find((product) => product.id === id);
    dispatch(UPDATE_ITEM_STOCK({ id: id, stock: product.stock + 1 }));
    const item = products.find((item) => item.id === id);
    if (!item) {
      toast({
        title: "Remove item successful",
        status: "success",
        duration: 3000,
        position: "top",
        isClosable: true,
      });
    }
  };

  const handleClickAdd = (id) => {
    dispatch(ADD_COUNT_ITEM({ id: id, count: 1 }));
    const product = allProducts.find((product) => product.id === id);
    dispatch(UPDATE_ITEM_STOCK({ id: id, stock: product.stock - 1 }));
  };

  const handleRemoveItem = (id) => {
    dispatch(REMOVE_CART_ITEMS(id));
    toast({
      title: "Remove item success",
      status: "success",
      duration: 3000,
      position: "top",
      isClosable: true,
    });
  };

  const handleBuyItem = () => {
    dispatch(SET_CART_ITEMS([]));
    dispatch(ADD_ORDER_ITEMS(products));
    localStorage.setItem("cartItems", JSON.stringify([]));
    toast({
      title: "Checkout was success.",
      status: "success",
      duration: 3000,
      position: "top",
      isClosable: true,
    });
  };

  useEffect(() => {
    const testCart = async () => {
      try {
        const localCart = JSON.parse(localStorage.getItem("cartItems"));
        if (localCart && localCart.length > 0 && products.length === 0) {
          return dispatch(SET_CART_ITEMS(localCart));
        }
        if (!isAuthenticated()) window.location.href = "/login";
      } catch (e) {
        //
      }
    };
    testCart();
  }, []);

  return (
    <div className="w-full p-2 md:p-12 lg:p-12 xl:p-12 space-y-8 md:space-y-16 lg:space-y-16 xl:space-y-16">
      <h1 className="text-xl font-semibold text-gray-600">Cart</h1>
      <div className="flex flex-col lg:flex-row space-y-5 lg:space-y-0 lg:space-x-10">
        <div className="space-y-3 w-full lg:w-7/12">
          {products.length > 0 ? (
            products.map((product) => (
              <CartProduct
                key={product.id}
                image={product.image}
                title={product.title}
                price={product.price}
                id={product.id}
                count={product.count}
                stock={product.stock}
                handleClickAdd={handleClickAdd}
                handleClickSubtract={handleClickSubtract}
                handleRemoveItem={handleRemoveItem}
              />
            ))
          ) : (
            <p className="text-2xl font-semibold">Anda belum memilih item</p>
          )}
        </div>
        {products.length > 0 && (
          <Box
            width={["100%", "40%"]}
            className="flex flex-col space-y-1 text-gray-700 h-80"
          >
            <Box className="space-y-3 w-full shadow-lg rounded-lg p-4">
              <Text className="font-bold text-gray-600" fontSize="30px">
                Order summary
              </Text>
              <div className="border-b border-gray-800" />
              {products.length > 0 &&
                products.map((product) => {
                  return (
                    <div
                      className="flex flex-row items-center space-x-3"
                      key={product.id}
                    >
                      <p className="font-xs flex-grow text-gray-600">{`${product.title} x ${product.count}`}</p>
                      <p className="font-xs text-gray-600 text-right">{`$${(
                        product.price * product.count
                      ).toFixed(2)}`}</p>
                    </div>
                  );
                })}
              <div className="border-b border-gray-800" />
              <div className="flex flex-row items-center">
                <p className="font-sm flex-grow text-gray-600">{`Subtotal `}</p>
                <p className="font-sm text-gray-600">{`$ ${subTotal().toFixed(
                  2
                )}`}</p>
              </div>
              <div className="flex flex-row items-center">
                <p className="font-sm flex-grow text-gray-600">{`Tax `}</p>
                <p className="font-sm text-gray-600">{`$ ${tax()}`}</p>
              </div>
              <div className="flex flex-row items-center">
                <p className="font-semibold flex-grow text-gray-600">{`Total `}</p>
                <p className="font-semibold text-gray-600">{`$ ${totalPayment()}`}</p>
              </div>
              <Button
                backgroundColor="#C6CFFF"
                width="full"
                variant="solid"
                children="Beli"
                onClick={handleBuyItem}
              />
            </Box>
          </Box>
        )}
      </div>
    </div>
  );
};

export default Cart;
