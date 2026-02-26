import React, { createContext, useContext, useState, useEffect } from 'react';

const GlobalTickContext = createContext<number>(Date.now());

export const GlobalTickProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        // Use a single interval for the entire app
        // Ticks every 1000ms to stay synchronized with seconds
        const timer = setInterval(() => {
            setNow(Date.now());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <GlobalTickContext.Provider value={now}>
            {children}
        </GlobalTickContext.Provider>
    );
};

export const useGlobalTick = () => useContext(GlobalTickContext);
