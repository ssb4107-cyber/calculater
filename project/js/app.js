
const frame = document.getElementById("pageFrame");
const menus = document.querySelectorAll(".menu");

const pages = {
    calculator: "pages/calculator.html",
    portfolio: "pages/portfolio.html",
    settings: "pages/settings.html"
};

menus.forEach(menu => {

    menu.addEventListener("click", () => {

        // active 제거
        menus.forEach(m => m.classList.remove("active"));

        // 현재 버튼 활성화
        menu.classList.add("active");

        // 페이지 변경
        const page = menu.dataset.page;

        frame.src = pages[page];

    });

});