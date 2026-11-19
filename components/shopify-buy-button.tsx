'use client';

import { useEffect, useRef } from 'react';

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
      'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';

    const init = () => {
      const ShopifyBuy = window.ShopifyBuy;
      if (!ShopifyBuy?.UI) return;

      const client = ShopifyBuy.buildClient({
        domain: '5b6p1p-dr.myshopify.com',
        storefrontAccessToken: '7f1c279fcacd06f2513ddb50b2865a4b',
      });

      ShopifyBuy.UI.onReady(client).then((ui: any) => {
        if (!container) return;

        ui.createComponent('product', {
          id: '10359691641024',
          node: container,
          moneyFormat: 'Rs.%20%7B%7Bamount%7D%7D',
          options: {
            product: {
              styles: {
                product: {
                  '@media (min-width: 601px)': {
                    'max-width': 'calc(25% - 20px)',
                    'margin-left': '20px',
                    'margin-bottom': '50px',
                  },
                },
              },
              text: {
                button: 'Add to cart',
              },
            },
            productSet: {
              styles: {
                products: {
                  '@media (min-width: 601px)': {
                    'margin-left': '-20px',
                  },
                },
              },
            },
            modalProduct: {
              contents: {
                img: false,
                imgWithCarousel: true,
                button: false,
                buttonWithQuantity: true,
              },
              styles: {
                product: {
                  '@media (min-width: 601px)': {
                    'max-width': '100%',
                    'margin-left': '0px',
                    'margin-bottom': '0px',
                  },
                },
              },
              text: {
                button: 'Add to cart',
              },
            },
            option: {},
            cart: {
              text: {
                total: 'Subtotal',
                button: 'Checkout',
              },
            },
            toggle: {},
          },
        });
      });
    };

    if (window.ShopifyBuy?.UI) {
      init();
    } else {
      const script = document.createElement('script');
      script.async = true;
      script.src = scriptURL;
      script.onload = init;
      document.head.appendChild(script);
    }

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return <div ref={containerRef} />;
}
