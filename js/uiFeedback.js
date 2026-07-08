const UIFeedback = (() => {
    let toastTimer = null;

    function ensureToast() {
        let toast = document.getElementById("appToast");

        if (!toast) {
            toast = document.createElement("div");
            toast.id = "appToast";
            toast.className = "app-toast";
            document.body.appendChild(toast);
        }

        return toast;
    }

    function showToast(message = "자동 저장됨") {
        const toast = ensureToast();
        const time = new Date().toLocaleTimeString("ko-KR", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit"
        });

        toast.textContent = `${message} ${time}`;
        toast.classList.add("show");

        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2000);
    }

    return {
        showToast
    };
})();
