"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/context/CartContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { FavouritesProvider } from "@/context/FavouritesContext";
import { GeneralSettingsProvider } from "@/context/GeneralSettingsContext";
import type { GeneralSettings } from "@/lib/settings";

type ProvidersProps = {
  children: React.ReactNode;
  generalSettings: GeneralSettings;
};

export default function Providers({ children, generalSettings }: ProvidersProps) {
  return (
    <SessionProvider>
      <CurrencyProvider>
        <FavouritesProvider>
        <CartProvider>
          <GeneralSettingsProvider value={generalSettings}>
            {children}
          </GeneralSettingsProvider>
        </CartProvider>
        </FavouritesProvider>
      </CurrencyProvider>
    </SessionProvider>
  );
}
