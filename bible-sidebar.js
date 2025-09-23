// bible-sidebar.js
// JS para barra lateral da Bíblia, navegação, parser de referências e validação de versões

(() => {
document.addEventListener('DOMContentLoaded', function() {
    // Controle de visibilidade/interatividade da barra lateral
    bibleSidebar = document.getElementById('bible-sidebar');
    bibleToggleBtn = document.getElementById('bible-toggle-btn');
    closeBibleBtn = document.getElementById('close-bible-btn');
    function openBibleSidebar() {
        bibleSidebar.style.transform = 'translateX(0)';
        bibleSidebar.style.visibility = 'visible';
        bibleSidebar.style.pointerEvents = 'auto';
    }
    function closeBibleSidebar() {
        bibleSidebar.style.transform = 'translateX(100%)';
        bibleSidebar.style.visibility = 'hidden';
        bibleSidebar.style.pointerEvents = 'none';
    }
    if (bibleToggleBtn) bibleToggleBtn.onclick = openBibleSidebar;
    if (closeBibleBtn) closeBibleBtn.onclick = closeBibleSidebar;
    closeBibleSidebar();
    // Elementos da barra lateral da Bíblia
    const bibleSidebar = document.getElementById('bible-sidebar');
    const bibleToggleBtn = document.getElementById('bible-toggle-btn');
    const closeBibleBtn = document.getElementById('close-bible-btn');
    const bibleVersionSelect = document.getElementById('bible-version-select');
    const bibleNavigator = document.getElementById('bible-navigator');

    let bibleVersions = {};
    let currentBible = null;
    let currentBook = null;
    let currentChapter = null;

    async function loadBibleVersions() {
        const versions = ['NVI','ARA','NTLH','ACF','ARC','NAA','NBV','NVT'];
        let firstValid = null;
        for (const v of versions) {
            try {
                const res = await fetch(`Bíblias/${v}.json`);
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    bibleVersions[v] = data;
                    if (!firstValid) firstValid = v;
                }
            } catch(e) { bibleVersions[v] = null; }
        }
        // Se a versão padrão não existir, usa a primeira válida
        let selected = bibleVersionSelect.value;
        if (!bibleVersions[selected]) {
            bibleVersionSelect.value = firstValid;
            selected = firstValid;
        }
        setBibleVersion(selected);
    }

    function setBibleVersion(version) {
        currentBible = bibleVersions[version];
        renderBibleBooks();
    }

    function renderBibleBooks() {
        if (!currentBible) {
            bibleNavigator.innerHTML = '<div class="text-red-500">Nenhuma versão da Bíblia disponível.</div>';
            return;
        }
        bibleNavigator.innerHTML = '<h4 class="font-bold mb-2">Livros</h4>';
        currentBible.forEach((book, idx) => {
            const btn = document.createElement('button');
            btn.className = 'block w-full text-left px-2 py-1 rounded hover:bg-gray-800 mb-1';
            btn.textContent = book.abbrev;
            btn.onclick = () => { currentBook = idx; renderBibleChapters(); };
            bibleNavigator.appendChild(btn);
        });
    }

    function renderBibleChapters() {
        const book = currentBible[currentBook];
        bibleNavigator.innerHTML = `<h4 class='font-bold mb-2'>${book.abbrev}</h4>`;
        book.chapters.forEach((_, idx) => {
            const btn = document.createElement('button');
            btn.className = 'block w-full text-left px-2 py-1 rounded hover:bg-gray-800 mb-1';
            btn.textContent = `Capítulo ${idx+1}`;
            btn.onclick = () => { currentChapter = idx; renderBibleVerses(); };
            bibleNavigator.appendChild(btn);
        });
        const backBtn = document.createElement('button');
        backBtn.className = 'mt-4 px-2 py-1 rounded bg-gray-700';
        backBtn.textContent = 'Voltar';
        backBtn.onclick = renderBibleBooks;
        bibleNavigator.appendChild(backBtn);
    }

    function renderBibleVerses(highlightVerses=[]) {
        const book = currentBible[currentBook];
        const chapter = book.chapters[currentChapter];
        bibleNavigator.innerHTML = `<h4 class='font-bold mb-2'>${book.abbrev} ${currentChapter+1}</h4>`;
        chapter.forEach((verse, idx) => {
            const span = document.createElement('span');
            span.className = 'block px-2 py-1 rounded mb-1' + (highlightVerses.includes(idx+1) ? ' bg-yellow-300 text-black font-bold' : '');
            span.textContent = `${idx+1}. ${verse}`;
            bibleNavigator.appendChild(span);
        });
        const backBtn = document.createElement('button');
        backBtn.className = 'mt-4 px-2 py-1 rounded bg-gray-700';
        backBtn.textContent = 'Voltar';
        backBtn.onclick = renderBibleChapters;
        bibleNavigator.appendChild(backBtn);
    }

    function openBibleSidebar() {
        bibleSidebar.style.transform = 'translateX(0)';
    }
    function closeBibleSidebar() {
        bibleSidebar.style.transform = 'translateX(100%)';
    }
    if (bibleToggleBtn) bibleToggleBtn.onclick = openBibleSidebar;
    if (closeBibleBtn) closeBibleBtn.onclick = closeBibleSidebar;
    if (bibleVersionSelect) bibleVersionSelect.onchange = () => setBibleVersion(bibleVersionSelect.value);

    // Parser de referência bíblica
    const bookMap = {
        'Gn':0,'Êx':1,'Ex':1,'Lv':2,'Nm':3,'Dt':4,'Js':5,'Jz':6,'Rt':7,'1Sm':8,'2Sm':9,'1Rs':10,'2Rs':11,'1Cr':12,'2Cr':13,'Ed':14,'Ne':15,'Et':16,'Jó':17,'Sl':18,'Pv':19,'Ec':20,'Ct':21,'Is':22,'Jr':23,'Lm':24,'Ez':25,'Dn':26,'Os':27,'Jl':28,'Am':29,'Ob':30,'Jn':31,'Mq':32,'Na':33,'Hc':34,'Sf':35,'Ag':36,'Zc':37,'Ml':38,'Mt':39,'Mc':40,'Lc':41,'Jo':42,'At':43,'Rm':44,'1Co':45,'2Co':46,'Gl':47,'Ef':48,'Fp':49,'Cl':50,'1Ts':51,'2Ts':52,'1Tm':53,'2Tm':54,'Tt':55,'Fm':56,'Hb':57,'Tg':58,'1Pe':59,'2Pe':60,'1Jo':61,'2Jo':62,'3Jo':63,'Jd':64,'Ap':65
    };
    const refRegex = /((\d\s*)?[A-Za-zçãéíóúêôâõûüÁÉÍÓÚÊÔÂÕÛÜ]{2,}(?:[\s\w]*)?)\s*(\d{1,3})[.:](\d{1,3}(?:[-;]\d{1,3})*)/g;

    function linkifyBibleRefs(container) {
        if (!container) return;
        container.innerHTML = container.innerHTML.replace(refRegex, function(match, book, chap, verseStr) {
            return `<a href="#" class="bible-ref-link text-blue-500 underline" data-ref="${match}">${match}</a>`;
        });
        container.querySelectorAll('.bible-ref-link').forEach(link => {
            link.onclick = function(e) {
                e.preventDefault();
                openBibleSidebar();
                showBibleReference(link.dataset.ref);
            };
        });
    }

    function showBibleReference(ref) {
        const regex = /((\d\s*)?[A-Za-zçãéíóúêôâõûüÁÉÍÓÚÊÔÂÕÛÜ]{2,}(?:[\s\w]*)?)\s*(\d{1,3})[.:](\d{1,3}(?:[-;]\d{1,3})*)/;
        const m = ref.match(regex);
        if (!m) return;
        let [_, bookName, chap, verses] = m;
        chap = parseInt(chap);
        let bookIdx = bookMap[bookName.trim().replace(/\s+/g,'')];
        if (bookIdx === undefined) {
            bookIdx = Object.entries(bookMap).find(([abbr, idx]) => bookName.toLowerCase().includes(abbr.toLowerCase()));
            bookIdx = bookIdx ? bookIdx[1] : 0;
        }
        currentBook = bookIdx;
        currentChapter = chap-1;
        let highlightVerses = [];
        verses.split(';').forEach(part => {
            if (part.includes('-')) {
                let [start,end] = part.split('-').map(Number);
                for(let i=start;i<=end;i++) highlightVerses.push(i);
            } else {
                highlightVerses.push(Number(part));
            }
        });
        renderBibleVerses(highlightVerses);
    }

    loadBibleVersions();
    setTimeout(function() {
        linkifyBibleRefs(document.body);
    }, 1000);
 });
})();
})();
})();
