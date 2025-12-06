document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const urlParams = new URLSearchParams(window.location.search);
    const agendamentoId = urlParams.get('id');

    let agendamento = null;
    let veterinarios = [];
    let animais = [];
    let selectedVeterinario = null;
    let selectedAnimal = null;
    
    if (!agendamentoId) {
        alert('ID do agendamento não fornecido');
        window.location.href = 'buscar.html';
        return;
    }

    // Carregar veterinários
    async function carregarVeterinarios() {
        try {
            console.log('Carregando veterinários...');
            const response = await fetch('/api/veterinario?status=true');
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            veterinarios = await response.json();
            console.log('Veterinários carregados:', veterinarios);

            if (!veterinarios.some(v => v.cod === agendamento.cod_veterinario)) {
                const veterinario = await fetch(`/api/veterinario/${agendamento.cod_veterinario}`);
                veterinarios.push(await veterinario.json());
            }
            
            const veterinarioSelect = document.querySelector('.selects-row .custom-select-wrapper:first-child .options-container');
            if (!veterinarioSelect) {
                console.error('Elemento veterinarioSelect não encontrado');
                return;
            }
            
            veterinarioSelect.innerHTML = '';
            
            veterinarios.forEach(vet => {
                const option = document.createElement('div');
                option.className = 'option';
                option.textContent = vet.nome;
                option.dataset.id = vet.cod;
                option.addEventListener('click', () => {
                    selectedVeterinario = vet.cod;
                    document.querySelector('.selects-row .custom-select-wrapper:first-child .selected').textContent = vet.nome;
                });
                veterinarioSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar veterinários:', error);
            console.error('Detalhes do erro:', error.message);
        }
    }
    
    // Carregar animais
    async function carregarAnimais() {
        try {
            console.log('Carregando animais...');
            const response = await fetch('/api/animais?status=true');
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            animais = await response.json();
            console.log('Animais carregados:', animais);

            if (!animais.some(a => a.cod === agendamento.cod_animal)) {
                const animal = await fetch(`/api/animais/${agendamento.cod_animal}`);
                animais.push(await animal.json());
            }
            
            const animalSelect = document.querySelector('.selects-row .custom-select-wrapper:last-child .options-container');
            if (!animalSelect) {
                console.error('Elemento animalSelect não encontrado');
                return;
            }
            
            animalSelect.innerHTML = '';
            
            animais.forEach(animal => {
                const option = document.createElement('div');
                option.className = 'option';
                option.textContent = animal.nome;
                option.dataset.id = animal.cod;
                option.addEventListener('click', () => {
                    selectedAnimal = animal.cod;
                    document.querySelector('.selects-row .custom-select-wrapper:last-child .selected').textContent = animal.nome;
                });
                animalSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar animais:', error);
            console.error('Detalhes do erro:', error.message);
        }
    }

    // Carregar dados do agendamento
    async function carregarAgendamento() {
        try {
            console.log('Carregando agendamento ID:', agendamentoId);
            const response = await fetch(`/api/agendamentos/${agendamentoId}`);
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            agendamento = await response.json();
            console.log('Agendamento carregado:', agendamento);
        } catch (error) {
            console.error('Erro ao carregar agendamento:', error);
            console.error('Detalhes do erro:', error.message);
            alert('Erro ao carregar dados do agendamento');
            window.location.href = 'buscar.html';
        }
    }

    // Preencher formulário com os dados do agendamento
    function preencherFormularioAgendamento() {
        // Preencher formulário
        const data = new Date(agendamento.data_agendada);
        const dataFormatada = data.toISOString().split('T')[0]; // Formato YYYY-MM-DD

        const dataInput = document.getElementById('data');
        const descricaoInput = document.getElementById('descricao');

        if (dataInput) dataInput.value = dataFormatada;
        if (descricaoInput) descricaoInput.value = agendamento.descricao || '';

        // Selecionar veterinário e animal
        selectedVeterinario = agendamento.cod_veterinario;
        selectedAnimal = agendamento.cod_animal;

        // Atualizar selects
        const veterinario = veterinarios.find(v => v.cod === agendamento.cod_veterinario);
        const animal = animais.find(a => a.cod === agendamento.cod_animal);

        if (veterinario) {
            const veterinarioSelected = document.querySelector('.selects-row .custom-select-wrapper:first-child .selected');
            if (veterinarioSelected) veterinarioSelected.textContent = veterinario.nome;
        }
        if (animal) {
            const animalSelected = document.querySelector('.selects-row .custom-select-wrapper:last-child .selected');
            if (animalSelected) animalSelected.textContent = animal.nome;
        }
    }

    // Configurar selects customizados
    function configurarSelects() {
        const selects = document.querySelectorAll(".custom-select");
        console.log('Configurando selects:', selects.length);

        selects.forEach((select, index) => {
            const selected = select.querySelector(".selected");
            const optionsContainer = select.querySelector(".options-container");
            
            if (!selected || !optionsContainer) {
                console.error(`Select ${index} não tem elementos necessários`);
                return;
            }

            // Configurar click no elemento selecionado
            selected.addEventListener("click", (e) => {
                e.stopPropagation();
                selects.forEach(s => {
                    if (s !== select) s.classList.remove("open");
                });
                select.classList.toggle("open");
            });

            // Configurar event listeners para as opções
            const options = optionsContainer.querySelectorAll(".option");
            options.forEach(option => {
                option.addEventListener("click", (e) => {
                    e.stopPropagation();
                    selected.textContent = option.textContent;
                    select.classList.remove("open");
                });
            });
        });

        // Fechar selects ao clicar fora
        document.addEventListener("click", (e) => {
            selects.forEach(select => {
                if (!select.contains(e.target)) {
                    select.classList.remove("open");
                }
            });
        });
    }

    // Enviar formulário
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validações
        if (!selectedVeterinario) {
            alert('Por favor, selecione um veterinário');
            return;
        }
        
        if (!selectedAnimal) {
            alert('Por favor, selecione um animal');
            return;
        }
        
        const data = document.getElementById('data').value;
        if (!data) {
            alert('Por favor, selecione uma data');
            return;
        }
        
        const agendamentoData = {
            cod_animal: selectedAnimal,
            cod_veterinario: selectedVeterinario,
            data_agendada: data,
            descricao: document.getElementById('descricao').value || null
        };

        try {
            const response = await fetch(`/api/agendamentos/${agendamentoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(agendamentoData)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Agendamento atualizado com sucesso!');
                window.location.href = 'buscar.html';
            } else {
                alert('Erro ao atualizar agendamento: ' + (data.message || data.error || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao atualizar agendamento. Por favor, tente novamente.');
        }
    });

    // Inicialização
    async function inicializar() {
        try {
            console.log('Iniciando carregamento...');
            console.log('ID do agendamento:', agendamentoId);

            await carregarAgendamento();
            console.log('Agendamento carregado');
            
            await carregarVeterinarios();
            console.log('Veterinários carregados:', veterinarios.length);
            
            await carregarAnimais();
            console.log('Animais carregados:', animais.length);

            preencherFormularioAgendamento()
            
            configurarSelects();
            console.log('Selects configurados');
            
            console.log('Carregamento concluído com sucesso');
        } catch (error) {
            console.error('Erro na inicialização:', error);
        }
    }

    inicializar();
}); 