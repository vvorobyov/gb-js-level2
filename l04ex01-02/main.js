const textEl = document.getElementById('text');
const fixBtn = document.getElementById('fixBtn');
const regExp = /('([^a-z])|(\s)')/gmi;

fixBtn.addEventListener('click', () => {
    textEl.value = textEl.value.replace(regExp, '$3"$2');
});
