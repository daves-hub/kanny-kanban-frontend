import { createContext, useContext, ReactNode, useState } from "react";

type DragContextType = {
  activeListId: number | null;
  setActiveListId: (id: number | null) => void;
};

const DragContext = createContext<DragContextType | undefined>(undefined);

export function DragProvider({ children }: { children: ReactNode }) {
  const [activeListId, setActiveListId] = useState<number | null>(null);

  return (
    <DragContext.Provider value={{ activeListId, setActiveListId }}>
      {children}
    </DragContext.Provider>
  );
}

export function useDragContext() {
  const context = useContext(DragContext);
  if (!context) {
    throw new Error("useDragContext must be used within DragProvider");
  }
  return context;
}
