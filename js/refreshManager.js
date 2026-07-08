const RefreshManager = (() => {
    let timer = null;
    let refreshCallback = null;
    let intervalCallback = null;
    let enabledCallback = null;
    let inFlight = false;

    async function run(reason = "auto") {
        if (inFlight || !refreshCallback) return;
        if (enabledCallback && !enabledCallback()) return;

        inFlight = true;

        try {
            await refreshCallback({ reason });
        } finally {
            inFlight = false;
        }
    }

    function stop() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

    function start(options) {
        stop();

        refreshCallback = options.refresh;
        intervalCallback = options.getIntervalMs;
        enabledCallback = options.isEnabled;

        if (!refreshCallback || (enabledCallback && !enabledCallback())) {
            return;
        }

        run("initial");

        const intervalMs = Math.max(
            60 * 1000,
            Number(intervalCallback?.()) || 5 * 60 * 1000
        );

        timer = setInterval(() => {
            run("interval");
        }, intervalMs);
    }

    return {
        start,
        stop,
        run
    };
})();
