export function countWordsInBlock(block) {
    const richText = block[block.type]?.rich_text;
    if (!richText) return 0;
    return richText.reduce((acc, t) => {
        const text = t.plain_text || (t.text ? t.text.content : '');
        return acc + (text ? text.trim().split(/\s+/).length : 0);
    }, 0);
}

// Refina lógica para slides: só quebra em headings ou parágrafos curtos que sejam "título"
export function parseBlocksIntoSlides(blocks, settings) {
    if (!blocks || blocks.length === 0) return [[]];
    if (settings.displayMode === 'scroll') return [blocks];

    const slides = [];
    let currentSlideContent = [];
    blocks.forEach(block => {
        const isHeading = ['heading_1', 'heading_2', 'heading_3'].includes(block.type);
        // Só considera parágrafo curto como slide se for isolado e não parte de lista/callout
        const isSingleLineParagraph = block.type === 'paragraph' &&
            block.paragraph.rich_text &&
            block.paragraph.rich_text.length === 1 &&
            block.paragraph.rich_text[0].plain_text &&
            block.paragraph.rich_text[0].plain_text.trim().length > 0 &&
            block.paragraph.rich_text[0].plain_text.trim().length <= 60 &&
            currentSlideContent.length === 0;

        if (isHeading || isSingleLineParagraph) {
            if (currentSlideContent.length > 0) {
                slides.push(currentSlideContent);
                currentSlideContent = [];
            }
        }
        currentSlideContent.push(block);
    });
    if (currentSlideContent.length > 0) slides.push(currentSlideContent);
    return slides.length > 0 ? slides : [[]];
}

// Modulariza renderização de blocos, agrupando listas aninhadas corretamente
export function renderBlocks(blocks, container) {
    if (!blocks) return;
    let i = 0;
    while (i < blocks.length) {
        const block = blocks[i];
        // Agrupa listas aninhadas
        if (block.type === 'bulleted_list_item' || block.type === 'numbered_list_item') {
            const listTag = block.type === 'bulleted_list_item' ? 'ul' : 'ol';
            const listEl = document.createElement(listTag);
            listEl.className = listTag === 'ul' ? 'list-disc pl-6 space-y-2 mt-2' : 'list-decimal pl-6 space-y-2 mt-2';
            let j = i;
            while (j < blocks.length && blocks[j].type === block.type) {
                const li = createHtmlFromBlock(blocks[j]);
                if (li) {
                    // Renderiza filhos recursivamente para listas aninhadas
                    if (blocks[j].children && blocks[j].children.length > 0) {
                        renderBlocks(blocks[j].children, li);
                    }
                    listEl.appendChild(li);
                }
                j++;
            }
            container.appendChild(listEl);
            i = j;
        } else {
            const el = createHtmlFromBlock(block);
            if (el) container.appendChild(el);
            i++;
        }
    }
}

// ...exporta outras funções necessárias...
