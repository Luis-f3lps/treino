        const form = document.getElementById('tbmForm');
        const resultadoDiv = document.getElementById('resultado');
        const corpoTabelaHistorico = document.getElementById('corpoTabelaHistorico'); 
        const btnLimpar = document.getElementById('limparHistorico');
        const btnImprimir = document.getElementById('imprimirHistorico'); 
        
        const CHAVE_STORAGE = 'historicoTBM';


        function carregarHistorico() {
            const historico = JSON.parse(localStorage.getItem(CHAVE_STORAGE)) || [];
            corpoTabelaHistorico.innerHTML = ''; 

            if (historico.length === 0) {
                corpoTabelaHistorico.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum cálculo salvo ainda.</td></tr>';
                return;
            }

            // Adiciona cada item do histórico como uma linha (tr) na tabela
            historico.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.nome}</td>
                    <td>${item.idade}</td>
                    <td>${item.altura.toFixed(1)}</td>
                    <td>${item.peso.toFixed(1)}</td>
                    <td>${item.sexo}</td>
                    <td>${item.tbm.toFixed(2)}</td>
                `;
                corpoTabelaHistorico.appendChild(tr);
            });
        }


        function salvarCalculo(nome, idade, peso, altura, sexo, tbm) {
            const historico = JSON.parse(localStorage.getItem(CHAVE_STORAGE)) || [];
            
            const novaEntrada = {
                nome, idade, peso, altura, sexo, tbm,
                data: new Date().toISOString()
            };

            historico.push(novaEntrada);
            localStorage.setItem(CHAVE_STORAGE, JSON.stringify(historico));
        }

        /**
         * Lida com o envio do formulário.
         */
        function handleCalcular(event) {
            event.preventDefault(); 

            const nome = document.getElementById('nome').value;
            const idade = parseFloat(document.getElementById('idade').value);
            const altura = parseFloat(document.getElementById('altura').value);
            const peso = parseFloat(document.getElementById('peso').value);
            const sexo = document.getElementById('sexo').value;

            if (!nome || isNaN(idade) || isNaN(altura) || isNaN(peso) || !sexo) {
                resultadoDiv.innerHTML = 'Por favor, preencha todos os campos corretamente.';
                resultadoDiv.style.color = 'red';
                return;
            }

            let tbm = 0;

            if (sexo === 'masculino') {
                tbm = 88.362 + (13.397 * peso) + (4.799 * altura) - (5.677 * idade);
            } else if (sexo === 'feminino') {
                tbm = 447.593 + (9.247 * peso) + (3.098 * altura) - (4.330 * idade);
            }

            resultadoDiv.style.color = 'var(--cor-texto)';
            resultadoDiv.innerHTML = `Dados de ${nome}, salvos!<br>Sua TMB é de <span>${tbm.toFixed(2)}</span> calorias/dia.`;

            salvarCalculo(nome, idade, peso, altura, sexo, tbm);
            carregarHistorico();
            form.reset();
        }

        /**
         * Limpa todo o histórico do localStorage.
         */
        function limparHistorico() {
            if (confirm('Tem certeza que deseja apagar todo o histórico?')) {
                localStorage.removeItem(CHAVE_STORAGE);
                carregarHistorico(); 
            }
        }

        form.addEventListener('submit', handleCalcular);
        btnLimpar.addEventListener('click', limparHistorico);
        
        btnImprimir.addEventListener('click', () => {
            window.print();
        });

        // Carrega o histórico assim que a página é aberta
        document.addEventListener('DOMContentLoaded', carregarHistorico);