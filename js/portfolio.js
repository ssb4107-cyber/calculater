// ===== Portfolio =====



stocks.forEach(stock=>{

    if(!stock.positions){

        stock.positions=[];

    }

    stock.positions.forEach(position=>{

        if(position.status===undefined)
            position.status="OPEN";

        if(position.strategy===undefined)
            position.strategy="";

        if(position.targetPrice===undefined)
            position.targetPrice=null;

        if(position.stopPrice===undefined)
            position.stopPrice=null;

        if(position.tags===undefined)
            position.tags=[];

        if(position.realizedPnL===undefined)
            position.realizedPnL=0;

        if(position.currentPrice===undefined)
            position.currentPrice=0;

        if(position.unrealizedPnL===undefined)
            position.unrealizedPnL=0;

        if(position.unrealizedRate===undefined)
            position.unrealizedRate=0;

    });

});

let selectedIndex = 0;
let editingPositionId = null;
let editingTrade = null;

const stockList = document.getElementById("stockList");
const stockTitle = document.getElementById("stockTitle");
const stockInfo = document.getElementById("stockInfo");

const stockForm = document.getElementById("stockForm");

const stockName = document.getElementById("stockName");
const stockSymbol = document.getElementById("stockSymbol");
const stockMemo = document.getElementById("stockMemo");


function updatePositionStatus(position){

    if(position.remainQty===0){

        position.status="CLOSED";

    }else if(position.remainQty<position.buyQty){

        position.status="PARTIAL";

    }else{

        position.status="OPEN";

    }

}




function renderPositionGroup(title, list){

    const positionList = document.getElementById("positionList");

    positionList.insertAdjacentHTML("beforeend",`
        <h3 style="margin:20px 0 10px;">
            ${title}
        </h3>
    `);

    if(list.length===0){

        positionList.insertAdjacentHTML("beforeend",`
            <div style="margin-bottom:15px;color:#888;">
                없음
            </div>
        `);

        return;
    }

    list
        .sort((a,b)=>b.buyPrice-a.buyPrice)
        .forEach((position,index)=>{

            positionList.insertAdjacentHTML("beforeend",`

            <div class="position-card">

                <div class="position-title">

                    Position #${position.number}

                    <br>

                    ${position.buyPrice.toFixed(2)}$

                </div>

                <div>
                    현재보유 : ${position.remainQty}주
                </div>

                <div>
                    최초매수 : ${position.buyQty}주
                </div>

                <div>
                    매도수량 : ${position.buyQty-position.remainQty}주
                </div>

                <div>

                    진행률 :
                    ${Math.round((position.remainQty/position.buyQty)*100)}%

                </div>

                <div style="margin-top:6px;">

                <div style="
                height:8px;
                background:#ddd;
                border-radius:5px;
                overflow:hidden;
                ">

                <div style="
                width:${Math.round((position.remainQty/position.buyQty)*100)}%;
                height:100%;
                background:#22c55e;
                ">
                </div>

                </div>

                </div>

                <div>
                    날짜 : ${position.buyDate}
                </div>

                <div>
                    메모 : ${position.memo || "-"}
                    <hr>

                    <div>

                    현재가 :
                    ${(position.currentPrice ?? 0).toFixed(2)}$

                    </div>

                    <div>

                    평가손익 :

                    ${(position.unrealizedPnL ?? 0).toFixed(2)}$

                    </div>

                    <div>

                    수익률 :

                    ${(position.unrealizedRate ?? 0).toFixed(2)}%
                    <hr>

                    <div>

                    실현손익 :

                    ${position.realizedPnL.toFixed(2)}$

                    </div>

                    </div>
                </div>

                <button
                class="editPositionBtn"
                data-id="${position.id}">

                ✏ Position 수정

                </button>

                <br><br>

                <br>

                <button
                class="deletePositionBtn"
                data-id="${position.id}">

                🗑 Position 삭제

                </button>

                <br><br>
                <button class="toggleBtn"
                        data-id="${position.id}">
                    ▶ Position 열기
                </button>

                <div
                    class="tradeArea"
                    id="trade-${position.id}"
                    style="display:none;margin-top:15px;">

                    <button
                        class="sellBtn"
                        data-id="${position.id}">
                        매도
                    </button>

                    <hr>

                    <div class="tradeHistory">

                        ${
                            position.trades.length===0
                            ?
                            "거래내역이 없습니다."
                            :
                            position.trades.map(trade=>`

                                <div class="trade-item">

                                    📅 ${trade.date.substring(0,10)}<br>
                                    💰 ${trade.price.toFixed(2)}$<br>
                                    📦 ${trade.qty}주
                                    <br><br>

                                    <button
                                    class="editTradeBtn"
                                    data-position="${position.id}"
                                    data-trade="${trade.id}">

                                    ✏

                                    </button>

                                    <button
                                    class="deleteTradeBtn"
                                    data-position="${position.id}"
                                    data-trade="${trade.id}">

                                    🗑

                                    </button>
                                    <br>

                                    💵 ${trade.realizedPnL?.toFixed(2) ?? "0.00"}$

                                </div>

                                <hr>

                            `).join("")
                        }

                    </div>

                </div>

            </div>

            `);

        });

}

function bindPositionEvents(){

    document.querySelectorAll(".editPositionBtn").forEach(btn=>{

    btn.onclick=()=>{

        const id = Number(btn.dataset.id);

        const position = stocks[selectedIndex].positions.find(
            p => p.id === id
        );

        if(!position) return;

        editingPositionId = id;

        document.getElementById("buyPrice").value = position.buyPrice;
        document.getElementById("buyQty").value = position.buyQty;
        document.getElementById("buyDate").value = position.buyDate;
        document.getElementById("buyMemo").value = position.memo;

        document.getElementById("positionForm").style.display = "block";

    };

});

    document.querySelectorAll(".deletePositionBtn").forEach(btn=>{

    btn.onclick=()=>{

        if(!confirm("이 Position을 삭제하시겠습니까?")) return;

        const id=Number(btn.dataset.id);

        stocks[selectedIndex].positions =
            stocks[selectedIndex].positions.filter(
                p=>p.id!==id
            );

        saveStocks();

        renderPositions();

        };

    });

    document.querySelectorAll(".toggleBtn").forEach(btn=>{

        btn.onclick=()=>{

            const area=document.getElementById("trade-"+btn.dataset.id);

            if(!area) return;

            if(area.style.display==="none"){

                area.style.display="block";
                btn.textContent="▼ Position 닫기";

            }else{

                area.style.display="none";
                btn.textContent="▶ Position 열기";

            }

        };

    });

    document.querySelectorAll(".sellBtn").forEach(btn=>{

        btn.onclick=()=>{

            const id=Number(btn.dataset.id);

            const position=stocks[selectedIndex].positions.find(p=>p.id===id);

            if(!position) return;

            editingTrade = {

                mode="add";

                position

            };

            document.getElementById("sellPrice").value="";

            document.getElementById("sellQty").value="";

            document.getElementById("tradeForm").style.display="block";

            recalculatePosition(position);

            saveStocks();
            renderPositions();

        };

    });
    bindTradeEvents();
}

function recalculatePosition(position){

    position.remainQty = position.buyQty;

    position.realizedPnL = 0;

    position.trades.forEach(trade=>{

        if(trade.type==="SELL"){

            position.remainQty -= trade.qty;

            trade.realizedPnL =
                (trade.price-position.buyPrice)
                *trade.qty;

            position.realizedPnL += trade.realizedPnL;

        }

    });

    updatePositionStatus(position);

}

function bindTradeEvents(){

    document.querySelectorAll(".deleteTradeBtn").forEach(btn=>{

        btn.onclick=()=>{

            const positionId=Number(btn.dataset.position);

            const tradeId=Number(btn.dataset.trade);

            const position=stocks[selectedIndex]
                .positions
                .find(p=>p.id===positionId);

            if(!position) return;

            const trade=position.trades.find(
                t=>t.id===tradeId
            );

            if(!trade) return;

            if(!confirm("거래를 삭제하시겠습니까?"))
                return;


            position.trades=
                position.trades.filter(
                    t=>t.id!==tradeId
                );

                recalculatePosition(position);

                saveStocks();

                renderPositions();


        };

    });
document.querySelectorAll(".editTradeBtn").forEach(btn=>{

    btn.onclick=()=>{

        const positionId = Number(btn.dataset.position);
        const tradeId = Number(btn.dataset.trade);

        const position = stocks[selectedIndex]
            .positions
            .find(p=>p.id===positionId);

        if(!position) return;

        const trade = position.trades.find(
            t=>t.id===tradeId
        );

        if(!trade) return;

        editingTrade = {

            mode:"edit",

            position,

            trade

        };

        document.getElementById("sellPrice").value = trade.price;
        document.getElementById("sellQty").value = trade.qty;

        document.getElementById("tradeForm").style.display = "block";


        recalculatePosition(position);

        saveStocks();
        renderPositions();

    };

});
}






document.getElementById("addStockBtn").onclick = () => {

    stockTitle.textContent = "새 종목";

    stockInfo.textContent = "종목 정보를 입력하세요.";

    stockForm.style.display = "block";

};

document.getElementById("saveStockBtn").onclick = () => {

    if (stockSymbol.value.trim() === "") {
        alert("심볼을 입력하세요.");
        return;
    }

    stocks.push({
    name: stockName.value.trim(),
    symbol: stockSymbol.value.trim().toUpperCase(),
    memo: stockMemo.value.trim(),
    positions:[]
});

    selectedIndex = stocks.length - 1;

    saveStocks();
    renderPositions();

    renderStocks();

    stockTitle.textContent = stocks[selectedIndex].symbol;
    stockInfo.textContent = stocks[selectedIndex].name;

    stockForm.style.display = "none";

    stockName.value = "";
    stockSymbol.value = "";
    stockMemo.value = "";

};

renderStocks();

stockTitle.textContent = stocks[selectedIndex].symbol;
stockInfo.textContent = stocks[selectedIndex].name;
renderPositions();

const positionList=document.getElementById("positionList");
positionList.innerHTML="";

const positionForm=document.getElementById("positionForm");


document.getElementById("addPositionBtn").onclick=()=>{

    editingPositionId = null;

    document.getElementById("buyPrice").value="";
    document.getElementById("buyQty").value="";
    document.getElementById("buyDate").value="";
    document.getElementById("buyMemo").value="";

    positionForm.style.display="block";

};

document.getElementById("savePositionBtn").onclick=()=>{

    const price=Number(document.getElementById("buyPrice").value);

    const qty=Number(document.getElementById("buyQty").value);

    const date=document.getElementById("buyDate").value;

    const memo=document.getElementById("buyMemo").value;

    if(!price || !qty){

        alert("매수가와 수량을 입력하세요.");

        return;

    }

    const isEdit = editingPositionId !== null;
    if(editingPositionId===null){

    const position={

    id:Date.now(),
    number:
    stocks[selectedIndex].positions.length+1,

    buyPrice:price,

    buyQty:qty,

    remainQty:qty,

    buyDate:date,

    memo:memo,

    status:"OPEN",

    tags:[],

    realizedPnL:0,

    currentPrice:0,

    unrealizedPnL:0,

    unrealizedRate:0,

    trades:[]

};  

    stocks[selectedIndex].positions.push(position);

}else{

    const position=stocks[selectedIndex].positions.find(
        p=>p.id===editingPositionId
    );

    position.buyPrice=price;
    position.buyQty=qty;
    position.buyDate=date;
    position.memo=memo;
    

    if(position.remainQty>qty){

        position.remainQty=qty;

    }

    recalculatePosition(position);
    updatePositionStatus(position);

    editingPositionId=null;

}

    saveStocks();
    renderPositions();

    console.log(stocks[selectedIndex].positions);

    alert(

    isEdit

    ?

    "Position 수정 완료"

    :

    "Position 추가 완료"

    );

    editingPositionId = null;

    document.getElementById("buyPrice").value = "";
    document.getElementById("buyQty").value = "";
    document.getElementById("buyDate").value = "";
    document.getElementById("buyMemo").value = "";

    positionForm.style.display="none";
    

};

document.getElementById("saveTradeBtn").onclick=()=>{

    const price=Number(document.getElementById("sellPrice").value);

    const qty=Number(document.getElementById("sellQty").value);

    if(!price||!qty){

        alert("입력하세요.");

        return;

    }

    const position=editingTrade.position;

    if(qty>position.remainQty){

        alert("보유수량 초과");

        return;

    }

    if(editingTrade.mode==="add"){

    position.trades.push({

        id:Date.now(),

        type:"SELL",

        price,

        qty,

        date:new Date().toISOString()

    });

}else{

    editingTrade.trade.price = price;
    editingTrade.trade.qty = qty;

}

    recalculatePosition(position);

    saveStocks();

    renderPositions();

    document.getElementById("tradeForm").style.display="none";

    editingTrade = null;

};

document.getElementById("cancelTradeBtn").onclick=()=>{

    editingTrade=null;

    document.getElementById("tradeForm").style.display="none";

};