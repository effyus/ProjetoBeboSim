document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.getElementById('atendimentoTableBody');
    const searchBox = document.querySelector('.search-box');
    let atendimentos = [];
    let animais = [];
    let veterinarios = [];

    // Carregar dados
    async function carregarDados() {
        try {
            const [atendimentosResponse, animaisResponse, veterinariosResponse] = await Promise.all([
                fetch('/api/atendimentos'),
                fetch('/api/animais'),
                fetch('/api/veterinario')
            ]);

            atendimentos = await atendimentosResponse.json();
            animais = await animaisResponse.json();
            veterinarios = await veterinariosResponse.json();

            exibirAtendimentos(atendimentos);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }

    // Exibir atendimentos na tabela
    function exibirAtendimentos(atendimentosParaExibir) {
        tableBody.innerHTML = '';
        
        atendimentosParaExibir.forEach(atendimento => {
            const row = document.createElement('tr');
            
            // Buscar dados relacionados
            const animal = animais.find(a => a.cod === atendimento.cod_animal);
            const veterinario = veterinarios.find(v => v.cod === atendimento.cod_veterinario);
            
            // Formatar data
            const data = new Date(atendimento.data);
            const dataFormatada = data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            
            row.innerHTML = `
                <td>${animal ? animal.nome : 'N/A'}</td>
                <td>${veterinario ? veterinario.nome : 'N/A'}</td>
                <td>${dataFormatada}</td>
                <td>
                    <button class="btn-editar" onclick="editarAtendimento(${atendimento.cod})">
                        Editar
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    }

    // Função para editar atendimento
    window.editarAtendimento = function(cod) {
        window.location.href = `editar.html?id=${cod}`;
    };

    // Busca em tempo real
    searchBox.addEventListener('input', function(e) {
        const termo = e.target.value.toLowerCase();
        const atendimentosFiltrados = atendimentos.filter(atendimento => {
            const animal = animais.find(a => a.cod === atendimento.cod_animal);
            const veterinario = veterinarios.find(v => v.cod === atendimento.cod_veterinario);
            const data = new Date(atendimento.data).toLocaleDateString('pt-BR').toLowerCase();
            
            return (animal && animal.nome.toLowerCase().includes(termo)) ||
                   (veterinario && veterinario.nome.toLowerCase().includes(termo)) ||
                   data.includes(termo);
        });
        exibirAtendimentos(atendimentosFiltrados);
    });

    // Carregar dados iniciais
    carregarDados();
}); 