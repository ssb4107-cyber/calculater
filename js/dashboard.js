function renderDashboard(){

    const positions = stocks[selectedIndex].positions;

    let totalBuy = 0;
    let totalValue = 0;
    let realized = 0;
    let unrealized = 0;

    positions.forEach(position=>{

        totalBuy += position.buyPrice * position.buyQty;

        totalValue += position.currentPrice * position.remainQty;

        realized += position.realizedPnL;

        unrealized += position.unrealizedPnL;

    });

    document.getElementById("totalBuy").textContent =
        `$${totalBuy.toFixed(2)}`;

    document.getElementById("totalValue").textContent =
        `$${totalValue.toFixed(2)}`;

    document.getElementById("realizedPnL").textContent =
        `$${realized.toFixed(2)}`;

    document.getElementById("unrealizedPnL").textContent =
        `$${unrealized.toFixed(2)}`;

    const totalProfit = realized + unrealized;

    const rate =
        totalBuy===0
        ? 0
        : totalProfit/totalBuy*100;

    document.getElementById("totalRate").textContent =
        `${rate.toFixed(2)}%`;

}

function updateCurrentPrice(){

    const currentPrice =
        Number(document.getElementById("currentPrice").value);

    if(!currentPrice) return;

    stocks[selectedIndex].positions.forEach(position=>{

        position.currentPrice = currentPrice;

        position.unrealizedPnL =
            (currentPrice-position.buyPrice)
            *position.remainQty;

        position.unrealizedRate =
            ((currentPrice-position.buyPrice)
            /position.buyPrice)
            *100;

    });

    saveStocks();

    renderPositions();

}