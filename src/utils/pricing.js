export const FREE_SHIPPING_THRESHOLD = 15000;
export function priceOrder(subtotal) {
  const shippingFee =
    subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD ? 250 : 0;
  return {
    subtotal,
    shippingFee,
    discountAmount: 0,
    finalTotal: subtotal + shippingFee,
  };
}
