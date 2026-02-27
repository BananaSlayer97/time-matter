import React, { createContext, useContext, useState, useEffect } from 'react';

const GlobalTickContext = createContext<number>(Date.now());

export const GlobalTickProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        // Updated to tick every 60 seconds for performance
        const timer = setInterval(() => {
            setNow(Date.now());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    return (
        <GlobalTickContext.Provider value={now}>
            {children}
        </GlobalTickContext.Provider>
    );
};

export const useGlobalTick = () => useContext(GlobalTickContext);
