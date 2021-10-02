import { createContext } from "react";

export const flyoutDefaultContext = {
  isFlyoutVisible: false,
  tradeGroup: undefined,
};

export const FlyoutContext = createContext(flyoutDefaultContext);
