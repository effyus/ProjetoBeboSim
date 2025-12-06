document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const tutorSearch = document.getElementById('tutorSearch');
    const tutorIdInput = document.getElementById('tutor_id');
    const tutoresList = document.getElementById('tutoresList');
    let allTutores = [];

    // Função para carregar a lista de tutores
    async function carregarTutores() {
        try {
            const response = await fetch('/api/tutores/active');
            allTutores = await response.json();
            
            // Limpar a lista atual
            tutoresList.innerHTML = '';
            
            // Adicionar apenas tutores ativos à lista
            allTutores.forEach(tutor => {
                const option = document.createElement('option');
                option.value = tutor.nome;
                option.dataset.id = tutor.cod;
                tutoresList.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar tutores:', error);
            alert('Erro ao carregar lista de tutores. Por favor, recarregue a página.');
        }
    }

    // Função para encontrar o tutor pelo nome
    function encontrarTutorPorNome(nome) {
        return allTutores.find(tutor => tutor.nome.toLowerCase() === nome.toLowerCase());
    }

    // Event listener para quando o usuário digita
    tutorSearch.addEventListener('input', function(e) {
        const tutor = encontrarTutorPorNome(e.target.value);
        if (tutor) {
            tutorIdInput.value = tutor.id;
            console.log('Tutor encontrado:', tutor);
        }
    });

    // Event listener para quando um tutor é selecionado da lista
    tutorSearch.addEventListener('change', function(e) {
        const tutor = encontrarTutorPorNome(e.target.value);
        if (tutor) {
            tutorIdInput.value = tutor.id;
            console.log('Tutor selecionado:', tutor);
        } else {
            tutorIdInput.value = '';
            console.log('Nenhum tutor encontrado');
        }
    });
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validar campos obrigatórios
        const nome = document.getElementById('nome').value.trim();
        const especie = document.getElementById('especie').value.trim();
        const tutorNome = tutorSearch.value.trim();
        const tutor = encontrarTutorPorNome(tutorNome);
        const dataNascimento = document.getElementById('dataNascimento').value;
        
        console.log('Dados do formulário:', { 
            nome, 
            especie, 
            tutorNome,
            tutorId: tutor ? tutor.id : null,
            dataNascimento
        });

        if (!nome || !especie || !tutor || !dataNascimento) {
            alert('Por favor, preencha todos os campos obrigatórios (Nome, Espécie, Tutor e Data de Nascimento)');
            return;
        }
        
        // Coletando os dados do formulário
        const animalData = {
            nome: nome,
            especie: especie,
            raca: document.getElementById('raca').value.trim(),
            data_nascimento: dataNascimento,
            peso: document.getElementById('peso').value,
            tutor_id: tutor.cod,
            status: true
        };

        console.log('Dados a serem enviados:', animalData);

        try {
            const response = await fetch('/api/animais', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(animalData)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Animal cadastrado com sucesso!');
                window.location.href = '/animais/buscar';
            } else {
                alert('Erro ao cadastrar animal: ' + (data.message || data.error || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao cadastrar animal. Por favor, tente novamente.');
        }
    });

    // Carregar tutores quando a página carregar
    carregarTutores();
}); 