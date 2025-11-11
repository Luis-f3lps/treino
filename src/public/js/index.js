
document.addEventListener('DOMContentLoaded', () => {
    
    const input = document.getElementById('workout-string-input');
    const button = document.getElementById('load-workout-button');
    const displayArea = document.getElementById('workout-display-area');
    const dayFilterSelect = document.getElementById('day-filter-select'); 
    const printButton = document.getElementById('print-pdf-button');
    
    const alunoNameSpan = document.getElementById('display-aluno-name');
    const instrutorNameSpan = document.getElementById('display-instrutor-name');

    let workoutData = {}; 
    let sortedDays = []; 

    button.addEventListener('click', () => {
        carregarTreino();
    });
    
    dayFilterSelect.addEventListener('change', () => {
        const selectedDay = dayFilterSelect.value;
        renderizarTreino(selectedDay); 
    });

    printButton.addEventListener('click', () => {
        window.print();
    });

    // --- 4. FUNÇÃO DE RENDERIZAÇÃO (MODIFICADA) ---
    function renderizarTreino(filter = 'all') { 
        displayArea.innerHTML = ''; 
        let hasResults = false;
        if (sortedDays.length === 0) {
            displayArea.innerHTML = '<p>Nenhum treino carregado.</p>';
            return;
        }

        for (const day of sortedDays) {
            if (filter !== 'all' && day !== filter) {
                continue; 
            }
            hasResults = true;
            const exercisesForDay = workoutData[day];
            const diaFormatado = `Dia ${day.toUpperCase()}`;
            displayArea.innerHTML += `<h2 class="day-title">${diaFormatado}</h2>`;

            // Adiciona o cabeçalho (visível apenas na impressão)
            displayArea.innerHTML += `
                <div class="print-header">
                    <span>EXERCÍCIO</span>
                    <span>SÉRIE | REP.</span>
                </div>
            `;

            for (const info of exercisesForDay) {
                // --- MUDANÇA NO HTML GERADO ---
                // Agora o card tem 3 colunas: gif, details, reps
                const cardHTML = `
                    <div class="exercise-card">
                        <div class="exercise-gif">
                            <img src="${info.link_gif}" alt="${info.nome}">
                        </div>
                        <div class="exercise-details">
                            <h4>${info.nome}</h4>
                            <p><strong>Músculo Primário:</strong> ${info.musculo_primario_nome || 'N/A'}</p>
                            <p><strong>Músculos Secundários:</strong> ${info.musculos_secundarios_nomes || 'Nenhum'}</p>
                                                        <p>${info.repeticoes_recomendadas || 'N/A'}</p>

                        </div>
                    </div>
                `;
                displayArea.innerHTML += cardHTML;
            }
        }
        if (!hasResults && filter !== 'all') {
            displayArea.innerHTML = `<p>Nenhum exercício encontrado para o Dia ${filter.toUpperCase()}.</p>`;
        }
    }
    
    // --- 5. FUNÇÃO DE CARREGAMENTO (NÃO MUDA) ---
    async function carregarTreino(stringOverride = null) {
        
        const rawString = stringOverride ? stringOverride : input.value;
        
        if (stringOverride) input.value = rawString;
        
        const parts = rawString.split('/');
        if (!rawString || parts.length < 3) {
            displayArea.innerHTML = '<p>String inválida. Formato esperado: aluno/instrutor/exercicio...</p>';
            alunoNameSpan.textContent = 'N/A';
            instrutorNameSpan.textContent = 'N/A';
            return;
        }

        const alunoName = parts[0];
        const instrutorName = parts[1];
        const workoutString = parts.slice(2).join('/'); 

        alunoNameSpan.textContent = alunoName;
        instrutorNameSpan.textContent = instrutorName;

        if (!workoutString || !workoutString.startsWith('exercicio/')) {
            displayArea.innerHTML = '<p>String de treino inválida.</p>';
            return;
        }

        const pairs = workoutString.replace('exercicio/', '').split('+');
        const exercisesToFetch = [];
        const idList = [];
        pairs.forEach(pair => {
            const parts = pair.split(',');
            if (parts[0] && parts[1]) {
                exercisesToFetch.push({ id: parts[0], day: parts[1] });
                idList.push(parts[0]);
            }
        });
        if (idList.length === 0) {
            displayArea.innerHTML = '<p>Nenhum exercício válido na string.</p>';
            return;
        }

        try {
            displayArea.innerHTML = '<p>Buscando dados...</p>';
            const response = await fetch(`/api/exercicios/info?ids=${idList.join(',')}`);
            if (!response.ok) throw new Error(`Erro da API: ${response.statusText}`);
            
            const exercisesInfo = await response.json(); 
            const fullWorkoutList = exercisesToFetch.map(exercise => {
                const info = exercisesInfo.find(ex => ex.id_exercicio === exercise.id);
                return { ...info, day: exercise.day };
            }).filter(ex => ex.nome); 

            workoutData = fullWorkoutList.reduce((acc, exercise) => {
                const day = exercise.day;
                if (!acc[day]) acc[day] = [];
                acc[day].push(exercise);
                return acc;
            }, {});

            sortedDays = Object.keys(workoutData).sort();
            popularFiltroDeDias(sortedDays);
            renderizarTreino('all');

        } catch (err) {
            displayArea.innerHTML = `<p><b>Falha ao carregar treino:</b> ${err.message}</p>`;
            console.error(err);
        }
    }
    
    // --- 6. FUNÇÃO POPULAR SELECT (NÃO MUDA) ---
    function popularFiltroDeDias(days) {
        while (dayFilterSelect.options.length > 1) {
            dayFilterSelect.remove(1);
        }
        dayFilterSelect.value = 'all'; 
        days.forEach(day => {
            const option = document.createElement('option');
            option.value = day; 
            option.textContent = `Dia ${day.toUpperCase()}`; 
            dayFilterSelect.appendChild(option);
        });
    }

    // --- 7. FUNÇÃO CHECAR URL (NÃO MUDA) ---
    function checarURL() {
        const params = new URLSearchParams(window.location.search);
        const treinoParam = params.get('treino'); 
        if (treinoParam) {
            const decodedString = decodeURIComponent(treinoParam);
            carregarTreino(decodedString);
        }
    }

    checarURL(); 
});