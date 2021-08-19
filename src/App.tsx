import { useState } from "react";
import { useQuery } from "react-query";
// Components
import { Drawer, LinearProgress, Grid, Badge } from "@material-ui/core";
import { AddShoppingCart } from "@material-ui/icons";
import Cart from "./Cart/Cart";
// Styles
import { Wrapper, StyledButton } from "./App.styles";
import Item from "./Item/Item";
// Types
export type CartItemType = {
  id: number;
  category: string;
  description: string;
  image: string;
  price: number;
  title: string;
  amount: number;
};

const getProducts = async (): Promise<CartItemType[]> =>
  await (await fetch("https://fakestoreapi.com/products")).json();

const App = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([] as CartItemType[]);

  const { data, isLoading, error } = useQuery<CartItemType[]>(
    "products",
    getProducts
  );
  const getTotalItems = (items: CartItemType[]) =>
    items.reduce((ack: number, item) => ack + item.amount, 0);

  const handleAddToCart = (clickedItem: CartItemType) => {
    setCartItems((old) => {
      const isItemInCart = old.find((item) => item.id === clickedItem.id);

      if (isItemInCart) {
        return old.map((item) =>
          item.id === clickedItem.id
            ? { ...item, amount: item.amount + 1 }
            : item
        );
      }

      return [...old, { ...clickedItem, amount: 1 }];
    });
  };

  const handleRemoveFromCart = (id: number) => {
    setCartItems((old) =>
      old.reduce((ack, item) => {
        if (item.id === id) {
          if (item.amount === 1) return ack;
          return [...ack, { ...item, amount: item.amount - 1 }];
        } else {
          return [...ack, item];
        }
      }, [] as CartItemType[])
    );
  };

  if (isLoading) return <LinearProgress />;

  if (error) return <div>Something goes wrong...</div>;

  return (
    <Wrapper>
      <Drawer
        anchor='right'
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      >
        <Cart
          cartItems={cartItems}
          addToCart={handleAddToCart}
          removeFromCart={handleRemoveFromCart}
        />
      </Drawer>
      <StyledButton onClick={() => setIsCartOpen(true)}>
        <Badge badgeContent={getTotalItems(cartItems)} color='error'>
          <AddShoppingCart />
        </Badge>
      </StyledButton>
      <Grid container spacing={3}>
        {data?.map((item) => (
          <Grid item key={item.id} xs={12} sm={4}>
            <Item item={item} handleAddToCart={handleAddToCart} />
          </Grid>
        ))}
      </Grid>
    </Wrapper>
  );
};

export default App;
