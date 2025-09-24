import { initUI } from './ui.js';
import { initBible } from './bible.js';
import { initSlides } from './slides.js';
import { initFileParsing } from './fileParsing.js';

document.addEventListener('DOMContentLoaded', () => {
    initUI();
    initBible();
    initSlides();
    initFileParsing();
});
