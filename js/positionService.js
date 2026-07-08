const PositionService = (() => {
    function toSafeNumber(value) {
        const number = Number(value);

        return Number.isFinite(number) ? number : 0;
    }

    function calculateStockAveragePrice(stock) {
        if (!stock || !Array.isArray(stock.positions) || stock.positions.length === 0) {
            return 0;
        }

        const totalQty = stock.positions.reduce(
            (sum, position) => sum + toSafeNumber(position.remainQty),
            0
        );

        if (totalQty === 0) return 0;

        const totalCost = stock.positions.reduce(
            (sum, position) => sum + toSafeNumber(position.buyPrice) * toSafeNumber(position.remainQty),
            0
        );

        return totalCost / totalQty;
    }

    function getTotalSoldQty(position) {
        if (!position || !Array.isArray(position.trades)) return 0;

        return position.trades
            .filter(trade => trade.type === "SELL")
            .reduce((sum, trade) => sum + toSafeNumber(trade.qty), 0);
    }

    function updatePositionStatus(position) {
        if (!position) return;

        if (toSafeNumber(position.remainQty) <= 0) {
            position.status = "CLOSED";
        } else if (toSafeNumber(position.remainQty) < toSafeNumber(position.buyQty)) {
            position.status = "PARTIAL";
        } else {
            position.status = "OPEN";
        }
    }

    function recalculatePosition(position) {
        if (!position) return;

        position.remainQty = toSafeNumber(position.buyQty);
        position.realizedPnL = 0;

        if (!Array.isArray(position.trades)) {
            position.trades = [];
        }

        position.trades.forEach(trade => {
            if (trade.type === "SELL") {
                position.remainQty -= toSafeNumber(trade.qty);

                trade.realizedPnL =
                    (toSafeNumber(trade.price) - toSafeNumber(position.buyPrice))
                    * toSafeNumber(trade.qty);

                position.realizedPnL += trade.realizedPnL;
            }
        });

        updatePositionStatus(position);
    }

    function recalculateAllPositions(stocks) {
        if (!Array.isArray(stocks)) return;

        stocks.forEach(stock => {
            if (!Array.isArray(stock.positions)) return;

            stock.positions.forEach(recalculatePosition);
        });
    }

    return {
        calculateStockAveragePrice,
        getTotalSoldQty,
        updatePositionStatus,
        recalculatePosition,
        recalculateAllPositions
    };
})();
