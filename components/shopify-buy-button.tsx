"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    ShopifyBuy?: any;
  }
}

export default function ShopifyBuyButton() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const scriptURL =
      "https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js";

    const initializeShopify = () => {
      if (!window.ShopifyBuy?.UI) return;

      const client = window.ShopifyBuy.buildClient({
        domain: "5b6p1p-dr.myshopify.com",
        storefrontAccessToken:
          "PASTE_THE_STOREFRONT_ACCESS_TOKEN_FROM_YOUR_SHOPIFY_CODE_HERE",
      });

      window.ShopifyBuy.UI.onReady(client).then((ui: any) => {
        if (!container) return;

        ui.createComponent("product", {
          id: "10359691641024",
          node: container,
          moneyFormat: "Rs.%20%7B%7Bamount%7D%7D",
          options: {
            product: {
              styles: {
                product: {
                  "@media (min-width: 601px)": {
                    "max-width": "calc(25% - 20px)",
                    "margin-left": "20px",
                    "margin-bottom": "50px",
                  },
                },
                title: {
                  "font-size": "20px",
                  color: "#000000",
                },
                button: {
                  ":hover": {
                    "background-color": "#000000",
                  },
                  "background-color": "#000000",
                  ":focus": {
                    "background-color": "#000000",
                  },
                  "border-radius": "40px",
                  "padding-left": "51px",
                  "padding-right": "51px",
                },
                price: {
                  "font-weight": "bold",
                  color: "#000000",
                },
              },
              text: {
                button: "Add to cart",
              },
            },
            modalProduct: {
              contents: {
                img: false,
                imgWithCarousel: true,
                button: false,
                buttonWithQuantity: true,
              },
              text: {
                button: "Add to cart",
              },
            },
            option: {},
            cart: {
              text: {
                total: "Subtotal",
                button: "Checkout",
              },
            },
            toggle: {
              styles: {
                toggle: {
                  "background-color": "#000000",
                  ":hover": {
                    "background-color": "#000000",
                  },
                  ":focus": {
                    "background-color": "#000000",
                  },
                },
              },
            },
          },
        });
      });
    };

    if (window.ShopifyBuy?.UI) {
      initializeShopify();
    } else {
      const script = document.createElement("script");

      script.async = true;
      script.src = scriptURL;
      script.onload = initializeShopify;

      document.head.appendChild(script);
    }

    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, []);

  return <div ref={containerRef} />;
}
