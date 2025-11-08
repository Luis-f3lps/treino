



    document.addEventListener('DOMContentLoaded', () => {
        
        const input = document.getElementById('workout-string-input');
        const button = document.getElementById('load-workout-button');
        const displayArea = document.getElementById('workout-display-area');

        button.addEventListener('click', () => {
            carregarTreino();
        });

        async function carregarTreino(stringOverride = null) {
    
    // Pega os elementos (coloque isso dentro do DOMContentLoaded)
    const input = document.getElementById('workout-string-input');
    const displayArea = document.getElementById('workout-display-area');

    const rawString = stringOverride ? stringOverride : input.value;

    if (stringOverride) {
        input.value = rawString;
    }

    if (!rawString || !rawString.startsWith('exercicio/')) {
        displayArea.innerHTML = '<p>String inválida ou vazia. Deve começar com "exercicio/".</p>';
        return;
    }

    // 1. Parsear a string (igual antes)
    const pairs = rawString.replace('exercicio/', '').split('+');
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

    // 2. Buscar as infos (igual antes)
    try {
        displayArea.innerHTML = '<p>Buscando dados...</p>';
        
        const response = await fetch(`/api/exercicios/info?ids=${idList.join(',')}`);
        if (!response.ok) {
            throw new Error(`Erro da API: ${response.statusText}`);
        }
        
        const exercisesInfo = await response.json(); // Array de infos

        //
        // --- 3. MÁGICA DE AGRUPAMENTO (AQUI QUE MUDA TUDO) ---
        //
        
        // Primeiro, junte as infos da API (nome, gif) com o DIA (a, b)
        const fullWorkoutList = exercisesToFetch.map(exercise => {
            const info = exercisesInfo.find(ex => ex.id_exercicio === exercise.id);
            return {
                ...info, // Traz nome, gif, etc.
                day: exercise.day // Traz o dia (a, b, c...)
            };
        }).filter(ex => ex.nome); // Filtra se algum ID não foi achado

        // Agora, agrupe essa lista por dia
        // O resultado será: { a: [exercicio1, exercicio2], b: [exercicio3] }
        const groupedByDay = fullWorkoutList.reduce((acc, exercise) => {
            const day = exercise.day;
            if (!acc[day]) {
                acc[day] = []; // Cria o array para o "Dia A"
            }
            acc[day].push(exercise); // Adiciona o exercício nesse dia
            return acc;
        }, {}); // Começa com um objeto vazio

        //
        // --- 4. RENDERIZAR AGRUPADO ---
        //
        displayArea.innerHTML = ''; // Limpa o "Buscando..."

        // Pega as chaves (ex: ['b', 'a', 'd']) e ordena
        const sortedDays = Object.keys(groupedByDay).sort(); // Agora fica ['a', 'b', 'd']

        // Loop 1: Para cada DIA (a, b, c...)
        for (const day of sortedDays) {
            const exercisesForDay = groupedByDay[day];
            
            const diaFormatado = `Dia ${day.toUpperCase()}`;
            displayArea.innerHTML += `<h2 class="day-title">${diaFormatado}</h2>`;

            for (const info of exercisesForDay) {
                const cardHTML = `
                    <div class="exercise-card">
                        <div class="exercise-gif">
                            <img src="${info.link_gif}" alt="${info.nome}">
                        </div>
                        <div class="exercise-info">
                            <h4>${info.nome}</h4>
                            <p><strong>Repetições:</strong> ${info.repeticoes_recomendadas || 'N/A'}</p>
                            <p><strong>Músculo Primário:</strong> ${info.musculo_primario_nome || 'N/A'}</p>
                            <p><strong>Músculos Secundários:</strong> ${info.musculos_secundarios_nomes || 'Nenhum'}</p>
                        </div>
                    </div>
                `;
                displayArea.innerHTML += cardHTML;
            }
        }

    } catch (err) {
        displayArea.innerHTML = `<p><b>Falha ao carregar treino:</b> ${err.message}</p>`;
        console.error(err);
    }
}

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
