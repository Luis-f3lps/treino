
document.addEventListener('DOMContentLoaded', () => {

            const muscleSelect = document.getElementById('muscle-group-select');
            const resultsContainer = document.getElementById('exercise-results-container');
            const detailPanelContent = document.getElementById('exercise-detail-content');
const saveButton = document.getElementById('save-workout-button'); 
            async function carregarMusculos() {
                try {
                    const response = await fetch('/api/musculos');
                    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
                    const musculos = await response.json();
                    preencherSelect(musculos);
                } catch (error) {
                    console.error('Falha ao carregar músculos:', error);
                    muscleSelect.innerHTML = '<option value="">Erro ao carregar</option>';
                }
            }

            function preencherSelect(musculos) {
                muscleSelect.innerHTML = '';
                muscleSelect.add(new Option('Todos os músculos', '')); // <-- Trocado

                musculos.forEach(musculo => {
                    muscleSelect.add(new Option(musculo.nome, musculo.id_musculo));
                });
            }
            async function buscarExerciciosPorMusculo(id) {
                resultsContainer.innerHTML = '<p>Buscando exercícios...</p>';
                try {
                    const response = await fetch(`/api/exercicios/por-musculo?id=${id}`);
                    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
                    const exercicios = await response.json();
                    renderizarExercicios(exercicios);
                } catch (error) {
                    console.error('Falha ao buscar exercícios:', error);
                    resultsContainer.innerHTML = '<p>Erro ao buscar exercícios.</p>';
                }
            }

            function renderizarExercicios(exercicios) {
                resultsContainer.innerHTML = '';
                if (exercicios.length === 0) {
                    resultsContainer.innerHTML = '<p>Nenhum exercício encontrado.</p>';
                    return;
                }

                const addedIds = new Set();
                detailPanelContent.querySelectorAll('.selected-exercise-item').forEach(item => {
                    addedIds.add(item.id.replace('selected-', ''));
                });

                exercicios.forEach(ex => {
                    const cardDiv = document.createElement('div');
                    cardDiv.className = 'exercise-card';

                    const gifDiv = document.createElement('div');
                    gifDiv.className = 'exercise-gif';
                    gifDiv.innerHTML = `<img src="${ex.link_gif}" alt="${ex.nome}">`;

                    const infoDiv = document.createElement('div');
                    infoDiv.className = 'exercise-info';

                    infoDiv.innerHTML = `
            <h4>${ex.nome}</h4>
            <p><strong>Repetições:</strong> ${ex.repeticoes_recomendadas || 'N/A'}</p>
            <p><strong>Músculo Primário:</strong> ${ex.musculo_primario_nome || 'N/A'}</p>
            <p><strong>Músculos Secundários:</strong> ${ex.musculos_secundarios_nomes || 'Nenhum'}</p>
            <p><strong>ID:</strong> ${ex.id_exercicio}</p>
            <button class="add-button">Adicionar</button>
        `;

                    const addButton = infoDiv.querySelector('.add-button');
                    addButton.dataset.id = ex.id_exercicio;
                    addButton.dataset.nome = ex.nome;

                    if (addedIds.has(ex.id_exercicio)) {
                        addButton.disabled = true;
                        addButton.textContent = 'Adicionado';
                    }

                    cardDiv.appendChild(gifDiv);
                    cardDiv.appendChild(infoDiv);
                    resultsContainer.appendChild(cardDiv);
                });
            }
           function adicionarExercicioNoPainel(button, id, nome) {
                if (detailPanelContent.classList.contains('is-empty')) {
                    detailPanelContent.innerHTML = '';
                    detailPanelContent.classList.remove('is-empty');
                }
                if (document.getElementById(`selected-${id}`)) {
                    alert('Esse exercício já foi adicionado!');
                    return;
                }
                button.disabled = true;
                button.textContent = 'Adicionado';
                const itemDiv = document.createElement('div');
                itemDiv.className = 'selected-exercise-item';
                itemDiv.id = `selected-${id}`;
                itemDiv.dataset.rawId = id;
                const nomeSpan = document.createElement('span');
                nomeSpan.textContent = nome;
                const daySelect = document.createElement('select');
                daySelect.className = 'day-select';
                
                const days = {
                    'a': 'Dia A',
                    'b': 'Dia B',
                    'c': 'Dia C',
                    'd': 'Dia D'
                };
                // Cria as options usando o {valor: texto}
                for (const [value, text] of Object.entries(days)) {
                    daySelect.add(new Option(text, value));
                }

                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete-button';
                deleteButton.textContent = 'Excluir';
                
                itemDiv.appendChild(nomeSpan);
                itemDiv.appendChild(daySelect);
                itemDiv.appendChild(deleteButton);
                detailPanelContent.appendChild(itemDiv);
            }

function gerarStringDeTreino() {
    const items = detailPanelContent.querySelectorAll('.selected-exercise-item');
    const outputBox = document.getElementById('workout-string-output');

    if (items.length === 0) {
        alert('Nenhum exercício selecionado para salvar.');
        outputBox.value = '';
        return null; // <-- Retorna nulo se falhar
    }

    const workoutParts = [];
    items.forEach(item => {
        const id = item.dataset.rawId;
        const dia = item.querySelector('.day-select').value;
        workoutParts.push(`${id},${dia}`);
    });

    const finalString = `exercicio/${workoutParts.join('+')}`;

    console.log(finalString);
    outputBox.value = finalString;

    return finalString; // <-- FALTAVA ISSO AQUI, PÔ!
}


            muscleSelect.addEventListener('change', () => {
                const muscleId = muscleSelect.value;
                buscarExerciciosPorMusculo(muscleId);
            });

            resultsContainer.addEventListener('click', (event) => {
                if (event.target && event.target.classList.contains('add-button')) {
                    const button = event.target;
                    adicionarExercicioNoPainel(button, button.dataset.id, button.dataset.nome);
                }
            });

            detailPanelContent.addEventListener('click', (event) => {
                if (event.target && event.target.classList.contains('delete-button')) {
                    const itemToRemove = event.target.closest('.selected-exercise-item');
                    const id = itemToRemove.dataset.rawId;
                    itemToRemove.remove();
                    const originalAddButton = resultsContainer.querySelector(`.add-button[data-id="${id}"]`);
                    if (originalAddButton) {
                        originalAddButton.disabled = false;
                        originalAddButton.textContent = 'Adicionar';
                    }
                    if (detailPanelContent.children.length === 0) {
                        detailPanelContent.classList.add('is-empty');
                        detailPanelContent.innerHTML = '<p>Adicione exercícios da lista ao lado.</p>';
                    }
                }
            });

saveButton.addEventListener('click', () => {
                const stringGerada = gerarStringDeTreino();
                if (stringGerada) {
                    const encodedString = encodeURIComponent(stringGerada);
                    window.location.href = `index.html?treino=${encodedString}`;
                }
            });


            async function init() {
                await carregarMusculos();
                buscarExerciciosPorMusculo('');
            }
            init(); 

        }); 
