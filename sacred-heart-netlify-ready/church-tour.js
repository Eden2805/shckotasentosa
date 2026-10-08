/* Dependency-free 3D illustration: polygon geometry projected onto a canvas. */
(() => {
    "use strict";

    const config = window.CHURCH_TOUR_CONFIG || {};
    function httpsUrl(value) {
        try {
            const url = new URL(value);
            return url.protocol === "https:" ? url.href : null;
        } catch {
            return null;
        }
    }
    const embedUrl = httpsUrl(config.embedUrl);
    if (embedUrl) {
        document.getElementById("captured-tour-frame").src = embedUrl;
        document.getElementById("captured-tour-link").href = httpsUrl(config.publicUrl) || embedUrl;
        document.getElementById("captured-tour").hidden = false;
        document.getElementById("illustrated-tour").hidden = true;
        document.querySelector("#virtual-tour .tour-section-heading > p").textContent = "Explore the captured church tour and discover its spaces at your own pace.";
        document.querySelectorAll(".tour-model-link").forEach(link => {
            link.textContent = "Explore the captured 3D tour ↗";
        });
        return;
    }

    const canvas = document.getElementById("tour-canvas");
    const stage = document.getElementById("tour-stage");
    const context = canvas.getContext("2d");
    if (!context) {
        document.getElementById("tour-view-label").textContent = "Illustration unavailable";
        return;
    }
    const state = { yaw: -.65, pitch: .5, zoom: 1, view: "exterior", selected: "exterior" };
    const spots = [
        { id: "exterior", number: "01", point: [0, 3.6, -11.2], view: "exterior" },
        { id: "nave", number: "02", point: [0, .4, -1], view: "interior" },
        { id: "sanctuary", number: "03", point: [0, 1.8, 8], view: "interior" },
        { id: "sacred-details", number: "04", point: [0, 3.4, 10.5], view: "interior" }
    ];
    const hotspotLayer = document.getElementById("tour-hotspots");
    const buttons = new Map();
    spots.forEach(spot => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "tour-hotspot";
        button.textContent = spot.number;
        const title = document.querySelector(`#highlight-${spot.id} h3`).textContent;
        button.setAttribute("aria-label", `Explore ${title}`);
        button.title = title;
        button.addEventListener("click", () => selectSpot(spot.id));
        hotspotLayer.append(button);
        buttons.set(spot.id, button);
    });

    // Model units are illustrative. No site dimensions or historical plans are implied.
    function geometry(interior) {
        const faces = [];
        let layer = 0;
        function face(points, color) { faces.push({ points, color, layer }); }
        function box(x, y, z, width, height, depth, color) {
            const a = x - width / 2, b = x + width / 2;
            const c = z - depth / 2, d = z + depth / 2, top = y + height;
            face([[a,y,c],[b,y,c],[b,top,c],[a,top,c]], color);
            face([[b,y,c],[b,y,d],[b,top,d],[b,top,c]], color);
            face([[b,y,d],[a,y,d],[a,top,d],[b,top,d]], color);
            face([[a,y,d],[a,y,c],[a,top,c],[a,top,d]], color);
            face([[a,top,c],[b,top,c],[b,top,d],[a,top,d]], color);
        }
        box(0, -.5, 0, 18, .5, 29, "#d4d8cc");
        layer = 1;
        box(0, 0, 0, 12, .25, 22, "#ded5c7");
        box(0, 0, -13, 4, .15, 4, "#c4c6bf");
        // Draw the supporting floor before fixtures that sit on it.
        layer = 2;
        const wallHeight = interior ? 1 : 5;
        box(-5.9, .25, 0, .3, wallHeight, 22, "#eee9dc");
        box(5.9, .25, 0, .3, wallHeight, 22, "#eee9dc");
        box(0, .25, 10.8, 12, 5, .3, "#ddcfb7");
        if (!interior) {
            box(0, .25, -10.8, 12, 5, .3, "#f3ede0");
            box(0, .25, -11.01, 2.2, 2.6, .12, "#655549");
            box(0, 3.1, -11.08, .23, 1.5, .12, "#25384d");
            box(0, 3.95, -11.09, 1.05, .22, .13, "#25384d");
            face([[-6.4,5.3,-11.4],[0,9,-11.4],[0,9,11.4],[-6.4,5.3,11.4]], "#435267");
            face([[0,9,-11.4],[6.4,5.3,-11.4],[6.4,5.3,11.4],[0,9,11.4]], "#516277");
            face([[-6,5.3,-10.97],[6,5.3,-10.97],[0,8.8,-10.97]], "#ece7db");
            face([[-6,5.3,10.97],[6,5.3,10.97],[0,8.8,10.97]], "#ece7db");
            box(0, 8.7, 7, .18, 2, .18, "#a48655");
            box(0, 10, 7, 1.1, .18, .18, "#a48655");
            for (let z = -7; z <= 7; z += 3.5) {
                box(-6.08, 2.1, z, .08, 1.8, 1.1, "#8297a4");
                box(6.08, 2.1, z, .08, 1.8, 1.1, "#8297a4");
            }
        } else {
            // Open roof and low side walls expose the nave and sanctuary.
            box(0, .25, 8, 11.5, .4, 5, "#c4b49c");
            box(0, .65, 8, 2.8, 1, 1.2, "#f0e8d9");
            box(0, 1.65, 8, 3.2, .15, 1.5, "#fffaf0");
            box(0, 1.4, 10.56, 4, 3.6, .2, "#c7b599");
            box(0, 2.6, 10.4, 1.1, 1.25, .25, "#977746");
            box(-3.6, .65, 7.3, .85, 1.8, .85, "#725646");
            box(-3.6, 2.45, 7.3, 1.1, .12, 1, "#8b6a52");
            for (let z = -7.5; z <= 3; z += 1.7) {
                for (const x of [-3.1, 3.1]) {
                    box(x, .25, z, 3.7, .7, .55, "#9b785b");
                    box(x, .8, z - .22, 3.7, .65, .15, "#816046");
                }
            }
        }
        return faces;
    }
    const models = { exterior: geometry(false), interior: geometry(true) };
    let width = 0, height = 0, pendingFrame = 0;
    function project(point) {
        const [x, y, z] = point;
        const cos = Math.cos(state.yaw), sin = Math.sin(state.yaw);
        const rotatedX = x * cos - z * sin;
        const rotatedZ = x * sin + z * cos;
        const centeredY = y - 3;
        const screenY = centeredY * Math.cos(state.pitch) + rotatedZ * Math.sin(state.pitch);
        const depth = rotatedZ * Math.cos(state.pitch) - centeredY * Math.sin(state.pitch);
        const perspective = 55 / (55 + depth);
        const scale = Math.min(width / 36, height / 26) * state.zoom;
        return { x: width / 2 + rotatedX * scale * perspective, y: height * .45 - screenY * scale * perspective, depth };
    }
    function render() {
        pendingFrame = 0;
        context.clearRect(0, 0, width, height);
        const projected = models[state.view].map(face => {
            const points = face.points.map(project);
            return { points, color: face.color, layer: face.layer, depth: points.reduce((sum, p) => sum + p.depth, 0) / points.length };
        }).sort((a, b) => a.layer - b.layer || b.depth - a.depth);
        projected.forEach(face => {
            context.beginPath();
            face.points.forEach((p, index) => index ? context.lineTo(p.x, p.y) : context.moveTo(p.x, p.y));
            context.closePath();
            context.fillStyle = face.color;
            context.fill();
            context.strokeStyle = "rgba(34, 45, 57, .12)";
            context.lineWidth = .6;
            context.stroke();
        });
        spots.forEach(spot => {
            const button = buttons.get(spot.id);
            const position = project(spot.point);
            button.hidden = spot.view !== state.view || position.x < 18 || position.x > width - 18 || position.y < 18 || position.y > height - 65;
            button.style.left = `${position.x}px`;
            button.style.top = `${position.y}px`;
            button.setAttribute("aria-pressed", String(spot.id === state.selected));
        });
    }
    function requestRender() {
        if (!pendingFrame) pendingFrame = requestAnimationFrame(render);
    }
    function resize() {
        width = stage.clientWidth;
        height = stage.clientHeight;
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        requestRender();
    }
    function selectSpot(id, changeView = false) {
        const spot = spots.find(item => item.id === id);
        if (!spot) return;
        if (changeView) setView(spot.view, false);
        state.selected = id;
        const article = document.getElementById(`highlight-${id}`);
        document.getElementById("tour-spot-number").textContent = spot.number;
        document.getElementById("tour-spot-title").textContent = article.querySelector("h3").textContent;
        document.getElementById("tour-spot-description").textContent = article.querySelector("p").textContent;
        document.getElementById("tour-spot-link").href = `#highlight-${id}`;
        requestRender();
    }
    function setView(view, selectDefault = true) {
        state.view = view;
        state.yaw = -.65;
        state.pitch = view === "interior" ? .85 : .5;
        state.zoom = 1;
        document.querySelectorAll("[data-view]").forEach(button => {
            button.setAttribute("aria-pressed", String(button.dataset.view === view));
        });
        document.getElementById("tour-view-label").textContent = view === "interior" ? "Interior cutaway" : "Exterior view";
        if (selectDefault) selectSpot(view === "interior" ? "nave" : "exterior");
        requestRender();
    }
    function action(name) {
        if (name === "left") state.yaw -= .2;
        if (name === "right") state.yaw += .2;
        if (name === "zoom-in") state.zoom = Math.min(1.8, state.zoom + .1);
        if (name === "zoom-out") state.zoom = Math.max(.65, state.zoom - .1);
        if (name === "reset") setView(state.view);
        requestRender();
    }
    document.querySelectorAll("[data-view]").forEach(button => button.addEventListener("click", () => setView(button.dataset.view)));
    document.querySelectorAll("[data-action]").forEach(button => button.addEventListener("click", () => action(button.dataset.action)));
    document.querySelectorAll("[data-highlight]").forEach(link => link.addEventListener("click", () => selectSpot(link.dataset.highlight, true)));

    let drag = null;
    canvas.addEventListener("pointerdown", event => {
        if (event.button !== 0 || drag) return;
        drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
        canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener("pointermove", event => {
        if (!drag || drag.id !== event.pointerId) return;
        state.yaw += (event.clientX - drag.x) * .008;
        state.pitch = Math.max(.15, Math.min(1.25, state.pitch - (event.clientY - drag.y) * .005));
        drag.x = event.clientX;
        drag.y = event.clientY;
        requestRender();
    });
    canvas.addEventListener("pointerup", () => { drag = null; });
    canvas.addEventListener("pointercancel", () => { drag = null; });
    canvas.addEventListener("lostpointercapture", () => { drag = null; });
    // Zoom only while the viewer has focus so ordinary page scrolling stays available.
    canvas.addEventListener("wheel", event => {
        if (document.activeElement !== canvas) return;
        event.preventDefault();
        action(event.deltaY < 0 ? "zoom-in" : "zoom-out");
    }, { passive: false });
    canvas.addEventListener("keydown", event => {
        const actions = { ArrowLeft: "left", ArrowRight: "right", "+": "zoom-in", "=": "zoom-in", "-": "zoom-out", "0": "reset" };
        if (actions[event.key]) {
            event.preventDefault();
            action(actions[event.key]);
        } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault();
            state.pitch = Math.max(.15, Math.min(1.25, state.pitch + (event.key === "ArrowUp" ? .1 : -.1)));
            requestRender();
        }
    });
    if (window.ResizeObserver) new ResizeObserver(resize).observe(stage);
    else window.addEventListener("resize", resize);
    resize();
    selectSpot("exterior");
})();
