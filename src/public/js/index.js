    var sidemenu = document.getElementById("sidemenu");
    function openmenu() {
        sidemenu.style.right = "0";
    }
    function clossmenu() {
        sidemenu.style.right = "-200px";
    }

    document.addEventListener('DOMContentLoaded', () => {
        
        const input = document.getElementById('workout-string-input');
        const button = document.getElementById('load-workout-button');
        const displayArea = document.getElementById('workout-display-area');

        button.addEventListener('click', () => {
            carregarTreino();
        });

        async function carregarTreino(stringOverride = null) {
            
            const rawString = stringOverride ? stringOverride : input.value;

            if (!rawString) {
                displayArea.innerHTML = '<p>Nenhuma string para carregar.</p>';
                return;
            }
            
            if (stringOverride) {
                input.value = rawString;
            }

            if (!rawString.startsWith('exercicio/')) {
                displayArea.innerHTML = '<p>String inválida. Deve começar com "exercicio/".</p>';
                return;
            }

            const pairs = rawString.replace('exercicio/', '').split('+'); // ["t01,a", "t03,b"]
            const exercisesToFetch = [];
            const idList = [];

            pairs.forEach(pair => {
                const parts = pair.split(',');
                const id = parts[0];
                const day = parts[1];
                if (id && day) {
                    exercisesToFetch.push({ id, day });
                    idList.push(id);
                }
            });

            if (idList.length === 0) {
                displayArea.innerHTML = '<p>Nenhum exercício válido na string.</p>';
                return;
            }

            try {
                displayArea.innerHTML = '<p>Buscando dados...</p>';
                
                const response = await fetch(`/api/exercicios/info?ids=${idList.join(',')}`);
                
                if (!response.ok) {
                    throw new Error(`Erro da API: ${response.statusText}`);
                }
                
                const exercisesInfo = await response.json(); 

                displayArea.innerHTML = '';
                
                exercisesToFetch.forEach(exercise => {
                    const info = exercisesInfo.find(ex => ex.id_exercicio === exercise.id);
                    
                    if (!info) {
                        displayArea.innerHTML += `<p>Erro: Info para ${exercise.id} não encontrada.</p>`;
                        return; 
                    }
                    
                    const diaFormatado = `Dia ${exercise.day.toUpperCase()}`;
                    
                    const cardHTML = `
                        <div class="exercise-card">
                            <div class="exercise-gif">
                                <img src="${info.link_gif}" alt="${info.nome}">
                            </div>
                            <div class="exercise-info">
                                <h4>${info.nome}</h4>
                                <p class="day-highlight">${diaFormatado}</p>
                                <p><strong>Repetições:</strong> ${info.repeticoes_recomendadas || 'N/A'}</p>
                                <p><strong>Músculo Primário:</strong> ${info.musculo_primario_nome || 'N/A'}</p>
                                <p><strong>Músculos Secundários:</strong> ${info.musculos_secundarios_nomes || 'Nenhum'}</p>
                            </div>
                        </div>
                    `;
                    displayArea.innerHTML += cardHTML;
                });

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
