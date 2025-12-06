document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const urlParams = new URLSearchParams(window.location.search);
    const atendimentoId = urlParams.get('id');

    let atendimento = null;
    let veterinarios = [];
    let animais = [];
    let selectedVeterinario = null;
    let selectedAnimal = null;
    
    if (!atendimentoId) {
        alert('ID do atendimento não fornecido');
        window.location.href = 'buscar.html';
        return;
    }

    // Carregar veterinários
    async function carregarVeterinarios() {
        try {
            const response = await fetch('/api/veterinario?status=true');
            veterinarios = await response.json();

            if (!veterinarios.some(v => v.cod === atendimento.cod_veterinario)) {
                const veterinario = await fetch(`/api/veterinario/${atendimento.cod_veterinario}`);
                veterinarios.push(await veterinario.json());
            }
            
            const veterinarioSelect = document.querySelector('.custom-select-wrapper:first-child .options-container');
            veterinarioSelect.innerHTML = '';
            
            veterinarios.forEach(vet => {
                const option = document.createElement('div');
                option.className = 'option';
                option.textContent = vet.nome;
                option.dataset.id = vet.cod;
                option.addEventListener('click', () => {
                    selectedVeterinario = vet.cod;
                    document.querySelector('.custom-select-wrapper:first-child .selected').textContent = vet.nome;
                });
                veterinarioSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar veterinários:', error);
        }
    }
    
    // Carregar animais
    async function carregarAnimais() {
        try {
            const response = await fetch('/api/animais?status=true');
            animais = await response.json();

            if (!animais.some(a => a.cod === atendimento.cod_animal)) {
                const animal = await fetch(`/api/animais/${atendimento.cod_animal}`);
                animais.push(await animal.json());
            }
            
            const animalSelect = document.querySelector('.custom-select-wrapper:last-child .options-container');
            animalSelect.innerHTML = '';
            
            animais.forEach(animal => {
                const option = document.createElement('div');
                option.className = 'option';
                option.textContent = animal.nome;
                option.dataset.id = animal.cod;
                option.addEventListener('click', () => {
                    selectedAnimal = animal.cod;
                    document.querySelector('.custom-select-wrapper:last-child .selected').textContent = animal.nome;
                });
                animalSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar animais:', error);
        }
    }

    // Carregar dados do atendimento
    async function carregarAtendimento() {
        try {
            const response = await fetch(`/api/atendimentos/${atendimentoId}`);
            if (!response.ok) {
                throw new Error('Atendimento não encontrado');
            }
            
            atendimento = await response.json();
        } catch (error) {
            console.error('Erro ao carregar atendimento:', error);
            alert('Erro ao carregar dados do atendimento');
            window.location.href = 'buscar.html';
        }
    }

    function preencherFormularioAtendimento() {
        // Preencher formulário
        const data = new Date(atendimento.data);
        const dataFormatada = data.toISOString().split('T')[0]; // Formato YYYY-MM-DD

        document.getElementById('data').value = dataFormatada;
        document.getElementById('anamnese').value = atendimento.anamnese || '';

        // Selecionar veterinário e animal
        selectedVeterinario = atendimento.cod_veterinario;
        selectedAnimal = atendimento.cod_animal;

        // Atualizar selects
        const veterinario = veterinarios.find(v => v.cod === atendimento.cod_veterinario);
        const animal = animais.find(a => a.cod === atendimento.cod_animal);

        if (veterinario) {
            document.querySelector('.custom-select-wrapper:first-child .selected').textContent = veterinario.nome;
        }
        if (animal) {
            document.querySelector('.custom-select-wrapper:last-child .selected').textContent = animal.nome;
        }
    }

    // Configurar selects customizados
    function configurarSelects() {
        const selects = document.querySelectorAll(".custom-select");

        selects.forEach(select => {
            const selected = select.querySelector(".selected");
            const optionsContainer = select.querySelector(".options-container");
            const options = select.querySelectorAll(".option");

            selected.addEventListener("click", () => {
                selects.forEach(s => {
                    if (s !== select) s.classList.remove("open");
                });
                select.classList.toggle("open");
            });

            options.forEach(option => {
                option.addEventListener("click", () => {
                    selected.textContent = option.textContent;
                    select.classList.remove("open");
                });
            });
        });

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
        
        const atendimentoData = {
            cod_animal: selectedAnimal,
            cod_veterinario: selectedVeterinario,
            data: data
        };

        try {
            const response = await fetch(`/api/atendimentos/${atendimentoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(atendimentoData)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Atendimento atualizado com sucesso!');
                window.location.href = 'buscar.html';
            } else {
                alert('Erro ao atualizar atendimento: ' + (data.message || data.error || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao atualizar atendimento. Por favor, tente novamente.');
        }
    });

    // Inicialização
    async function inicializar() {
        await carregarAtendimento();
        await carregarVeterinarios();
        await carregarAnimais();
        preencherFormularioAtendimento();
        configurarSelects();
    }

    inicializar();
}); 