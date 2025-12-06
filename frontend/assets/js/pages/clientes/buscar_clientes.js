document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.getElementById('agendamentoTableBody');
    const searchBox = document.querySelector('.search-box');
    let agendamentos = [];

    // Carregar agendamentos
    async function carregarAgendamentos() {
        try {
            const response = await fetch('/api/agendamentos');
            agendamentos = await response.json();
            exibirAgendamentos(agendamentos);
        } catch (error) {
            console.error('Erro ao carregar agendamentos:', error);
        }
    }

    // Exibir agendamentos na tabela
    function exibirAgendamentos(agendamentosParaExibir) {
        tableBody.innerHTML = '';
        
        agendamentosParaExibir.forEach(agendamento => {
            const row = document.createElement('tr');
            
            // Formatar data
            const data = new Date(agendamento.data_agendada);
            const dataFormatada = data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            
            row.innerHTML = `
                <td>${agendamento.animal ? agendamento.animal.nome : 'N/A'}</td>
                <td>${agendamento.veterinario ? agendamento.veterinario.nome : 'N/A'}</td>
                <td>${dataFormatada}</td>
                <td>${agendamento.descricao || '-'}</td>
                <td>
                    <button class="btn-editar" onclick="editarAgendamento(${agendamento.cod})">
                        Editar
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    }

    // Função para editar agendamento
    window.editarAgendamento = function(cod) {
        window.location.href = `editar.html?id=${cod}`;
    };

    // Busca em tempo real
    searchBox.addEventListener('input', function(e) {
        const termo = e.target.value.toLowerCase();
        const agendamentosFiltrados = agendamentos.filter(agendamento => {
            const animal = (agendamento.animal ? agendamento.animal.nome : '').toLowerCase();
            const veterinario = (agendamento.veterinario ? agendamento.veterinario.nome : '').toLowerCase();
            const descricao = (agendamento.descricao || '').toLowerCase();
            const data = new Date(agendamento.data_agendada).toLocaleDateString('pt-BR').toLowerCase();
            return animal.includes(termo) || veterinario.includes(termo) || descricao.includes(termo) || data.includes(termo);
        });
        exibirAgendamentos(agendamentosFiltrados);
    });

    // Carregar dados iniciais
    carregarAgendamentos();
}); 