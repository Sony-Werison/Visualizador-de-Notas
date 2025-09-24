let touchStartX = 0, touchStartY = 0, touchEndX = 0, touchEndY = 0;

export function handleTouchStart(e) {
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
}
export function handleTouchMove(e) {
    const t = e.touches[0];
    touchEndX = t.clientX;
    touchEndY = t.clientY;
}
export function handleTouchEnd() {
    // ...lógica de swipe...
}

// Consolida toggling de sidebars
export function toggleSidebar(sidebarId, open) {
    const sidebar = document.getElementById(sidebarId);
    document.body.classList.remove('history-open', 'bible-open', 'settings-open');
    sidebar.classList.toggle('open', open);
    if (open) document.body.classList.add(`${sidebarId.replace('-','_')}-open`);
}

// Consolida botão ativo
export function setActiveButton(selector, value) {
    document.querySelectorAll(selector).forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value == value);
    });
}

// ...outros utilitários de UI...
