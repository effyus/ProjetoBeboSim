async function buscarTutor(tutorId) {
    try {
        const response = await fetch(`/api/tutores/${tutorId}`);
        if (response.ok) {
            const tutor = await response.json();
            return tutor.nome;
        }
        return 'Tutor não encontrado';
    } catch (error) {
        console.error('Erro ao buscar tutor:', error);
        return 'Erro ao buscar tutor';
    }
}

async function carregarAnimais() {
    try {
        const response = await fetch('/api/animais');
        const animais = await response.json();
        
        const tableBody = document.getElementById('animaisTableBody');

        // Processar cada animal para buscar o tutor se necessário
        const animaisProcessados = await Promise.all(animais.map(async (animal) => {
            let nomeTutor = '';
            if (animal.tutor) {
                nomeTutor = animal.tutor.nome;
            } else if (animal.cod_tutor) {
                nomeTutor = await buscarTutor(animal.cod_tutor);
            }
            return { ...animal, nomeTutor };
        }));

        tableBody.innerHTML = animaisProcessados.map(animal => `
            <tr data-animal-id="${animal.cod}">
                <td>${animal.nome}</td>
                <td>${animal.especie}</td>
                <td>${animal.raca || '-'}</td>
                <td>${animal.nomeTutor}</td>
                <td><span class="status-${animal.status ? 'ativo' : 'inativo'}">${animal.status ? 'Ativo' : 'Inativo'}</span></td>
                <td><button class="btn-editar">Editar</button></td>
            </tr>
        `).join('');

        document.querySelectorAll('.btn-editar').forEach(button => {
            button.addEventListener('click', function () {
                const row = this.closest('tr');
                const animalId = row.getAttribute('data-animal-id');
                window.location.href = `/assets/pages/animais/editar.html?id=${animalId}`;
            });
        });
    } catch (error) {
        console.error('Erro ao carregar animais:', error);
        alert('Erro ao carregar lista de animais. Por favor, recarregue a página.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    carregarAnimais();

    const searchInput = document.querySelector('.search-box');
    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            const termo = e.target.value.toLowerCase();
            const linhas = document.querySelectorAll('#animaisTableBody tr');

            linhas.forEach(linha => {
                const nome = linha.cells[0].textContent.toLowerCase();
                const especie = linha.cells[1].textContent.toLowerCase();
                const raca = linha.cells[2].textContent.toLowerCase();
                const tutor = linha.cells[3].textContent.toLowerCase();
                
                linha.style.display = 
                    nome.includes(termo) || 
                    especie.includes(termo) || 
                    raca.includes(termo) || 
                    tutor.includes(termo) ? '' : 'none';
            });
        });
    }
});