let names = [];
let validNames = []; // Armazena apenas os nomes com status "OK"
let displayInterval;
let speed = 100;

document.getElementById('speedControl').value = speed;

document.getElementById('speedControl').addEventListener('input', function () {
    speed = parseInt(this.value, 10);
    localStorage.setItem('speed', speed);
});

function loadNames() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput.files.length === 0) {
        alert('Por favor, faça o upload de um arquivo.');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Carrega todos os nomes na lista names e filtra os que têm "OK" na lista validNames
        names = jsonData.map(row => row[0]).filter(name => name.length > 0);
        validNames = jsonData.filter(row => row[1] && row[1].toUpperCase() === "OK").map(row => row[0]);

        if (names.length === 0) {
            alert('Arquivo vazio ou inválido.');
            return;
        }

        document.getElementById('nameDisplay').innerText = 'Nomes carregados! Pronto para sortear.';

        // Exibe a prévia de todos os nomes
        const namePreview = document.getElementById('namePreview');
        namePreview.innerHTML = '<strong>Prévia dos Nomes:</strong><br>' + names.join('<br>');
    };

    reader.readAsArrayBuffer(file);
}

function startDraw() {
    if (validNames.length === 0) {
        alert('Nenhum nome com status "OK" disponível para sorteio.');
        return;
    }

    const drawSound = document.getElementById('drawSound');
    drawSound.play();  // Toca o som do sorteio

    const winners = [];
    const winnerCount = parseInt(document.getElementById('winnerCount').value, 10);
    let currentIndex = 0;

    displayInterval = setInterval(function () {
        currentIndex = (currentIndex + 1) % names.length;
        const currentName = names[currentIndex];
        document.getElementById('nameDisplay').innerText = currentName;

        // Ajusta o tamanho da fonte dinamicamente
        const nameDisplayElement = document.getElementById('nameDisplay');
        adjustFontSize(nameDisplayElement, currentName);

    }, speed);

    const progressBar = document.getElementById('progress');
    progressBar.style.transition = 'width 13s linear';
    progressBar.style.width = '100%';

    setTimeout(function () {
        clearInterval(displayInterval);
        while (winners.length < winnerCount) {
            const winner = validNames[Math.floor(Math.random() * validNames.length)];
            if (!winners.includes(winner)) {
                winners.push(winner);
            }
        }
        document.getElementById('nameDisplay').innerHTML = '<span id="winnerDisplay">Vencedor(es):<br>' + winners.join('<br>') + '</span>';
        resetProgressBar();
    }, 13000);
}

function adjustFontSize(element, text) {
    element.style.fontSize = '2rem'; // Redefine o tamanho da fonte para o padrão
    while (element.scrollWidth > element.clientWidth) {
        const fontSize = parseFloat(window.getComputedStyle(element, null).getPropertyValue('font-size'));
        element.style.fontSize = (fontSize - 1) + 'px';
    }
}

function resetProgressBar() {
    const progressBar = document.getElementById('progress');
    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';
}