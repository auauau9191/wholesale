import { createContext, useContext } from "react";

const HubScopeContext = createContext({ hub: "ALL", setHub: () => {} });

export const HubScopeProvider = HubScopeContext.Provider;

export function useHubScope() {
  return useContext(HubScopeContext);
}

export const HUB_LABEL = {
  ALL: "All hubs",
  BNE: "Brisbane hub",
  SYD: "Sydney hub",
};

export const HUB_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "BNE", label: "Brisbane" },
  { value: "SYD", label: "Sydney" },
];