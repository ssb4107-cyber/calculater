const PortfolioStorage = (() => {
    const STORAGE_KEY = "portfolioStocks";

    const defaultStocks = [
        {
            name: "Pan American Silver",
            symbol: "PAAS",
            currentPrice: null,
            memo: "",
            positions: []
        }
    ];

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function normalizeTrade(trade) {
        return {
            id: Number(trade.id) || Date.now(),
            type: trade.type || "SELL",
            price: Number(trade.price) || 0,
            qty: Number(trade.qty) || 0,
            date: trade.date || new Date().toISOString(),
            realizedPnL: Number(trade.realizedPnL) || 0
        };
    }

    function normalizePosition(position, index) {
        const buyQty = Number(position.buyQty) || 0;
        const trades = Array.isArray(position.trades)
            ? position.trades.map(normalizeTrade)
            : [];

        return {
            id: Number(position.id) || Date.now() + index,
            number: Number(position.number) || index + 1,
            type: position.type || "TRADING",
            buyPrice: Number(position.buyPrice) || 0,
            buyQty,
            remainQty: Number(position.remainQty ?? buyQty) || 0,
            buyDate: position.buyDate || "",
            memo: position.memo || "",
            status: position.status || "OPEN",
            tags: Array.isArray(position.tags) ? position.tags : [],
            realizedPnL: Number(position.realizedPnL) || 0,
            trades
        };
    }

    function normalizeStock(stock) {
        return {
            name: stock.name || stock.symbol || "",
            symbol: (stock.symbol || "").toUpperCase(),
            currentPrice: stock.currentPrice === null
                ? null
                : Number(stock.currentPrice) || null,
            memo: stock.memo || "",
            positions: Array.isArray(stock.positions)
                ? stock.positions.map(normalizePosition)
                : []
        };
    }

    function loadStocks() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

            if (Array.isArray(saved) && saved.length > 0) {
                return saved.map(normalizeStock);
            }
        } catch (error) {
            console.warn("Portfolio data could not be loaded.", error);
        }

        return clone(defaultStocks);
    }

    function saveStocks(stocks) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stocks));
    }

    return {
        loadStocks,
        saveStocks
    };
})();
