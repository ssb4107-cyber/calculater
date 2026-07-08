// ===== Dashboard =====

function toNumber(value) {
    return Number(value) || 0;
}

function getSelectedStock() {
    return stocks[selectedIndex] || null;
}

function getCurrentPrice() {
    const stock = getSelectedStock();

    return stock ? toNumber(stock.currentPrice) : 0;
}

function getPositionValue(position) {
    return getCurrentPrice() * toNumber(position.remainQty);
}

function getPositionUnrealized(position) {
    return (
        getCurrentPrice() - toNumber(position.buyPrice)
    ) * toNumber(position.remainQty);
}

function getPositionRate(position) {
    const buyPrice = toNumber(position.buyPrice);

    if (buyPrice === 0) return 0;

    return (
        (getCurrentPrice() - buyPrice)
        / buyPrice
    ) * 100;
}

function getPositionTotalPnL(position) {
    return toNumber(position.realizedPnL)
        + getPositionUnrealized(position);
}

function getRemainCost(position) {
    return toNumber(position.buyPrice)
        * toNumber(position.remainQty);
}

function getPositionMarketValue(position) {
    return getCurrentPrice()
        * toNumber(position.remainQty);
}

function calculateDashboard(stock) {
    const summary = {
        totalBuy: 0,
        totalValue: 0,
        realized: 0,
        unrealized: 0,
        rate: 0
    };

    if (!stock) return summary;

    stock.positions.forEach(position => {
        summary.totalBuy +=
            toNumber(position.buyPrice) * toNumber(position.buyQty);

        summary.totalValue +=
            getPositionValue(position);

        summary.realized +=
            toNumber(position.realizedPnL);

        summary.unrealized +=
            getPositionUnrealized(position);
    });

    summary.rate = summary.totalBuy === 0
        ? 0
        : ((summary.realized + summary.unrealized) / summary.totalBuy) * 100;

    return summary;
}

function renderDashboard() {
    const summary = calculateDashboard(getSelectedStock());

    document.getElementById("totalBuy").textContent =
        `$${summary.totalBuy.toFixed(2)}`;

    document.getElementById("totalValue").textContent =
        `$${summary.totalValue.toFixed(2)}`;

    document.getElementById("realizedPnL").textContent =
        `$${summary.realized.toFixed(2)}`;

    document.getElementById("unrealizedPnL").textContent =
        `$${summary.unrealized.toFixed(2)}`;

    document.getElementById("totalRate").textContent =
        `${summary.rate.toFixed(2)}%`;
}
